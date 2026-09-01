// components/datetime/Clock.tsx
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  GestureResponderEvent,
  LayoutChangeEvent,
  PanResponder,
  Text,
  View,
} from 'react-native';
import { useClockStyle } from './dateTimeStyles';

export type ClockMode = 'hour' | 'minute';
export type HourFormat = '12h' | '24h';

const FACE_SIZE = 260;
const RADIUS = FACE_SIZE / 2;
const OUTER_RADIUS = RADIUS - 28; // 1–12 ring (also the only ring in 12h mode)
const INNER_RADIUS = RADIUS - 64; // 13–23 / 00 ring, 24h mode only
const RING_THRESHOLD = (OUTER_RADIUS + INNER_RADIUS) / 2;

export interface ClockProps {
  mode: ClockMode;
  hourFormat: HourFormat;
  /** 1–12 dial value. Required when hourFormat is '12h'. */
  hour12?: number;
  /** Actual 0–23 hour. Required when hourFormat is '24h'. */
  hour24?: number;
  minute: number;
  /** 12h: reports the tapped dial value (1–12). 24h: reports the actual hour (0–23). */
  onSelectHour: (value: number) => void;
  onSelectMinute: (minute: number) => void;
  /** Fires on touch release — callers use this to auto-advance hour -> minute. */
  onRelease?: () => void;
}

function pad2(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

function polar(radius: number, angleDeg: number) {
  const theta = (angleDeg * Math.PI) / 180;
  return {
    x: RADIUS + radius * Math.sin(theta),
    y: RADIUS - radius * Math.cos(theta),
  };
}

/** The hand's target angle/radius when NOT actively being dragged — derived
 *  purely from the committed value (props), never from touch state. */
function committedHandGeometry(
  mode: ClockMode,
  hourFormat: HourFormat,
  hour12: number | undefined,
  hour24: number | undefined,
  minute: number
): { angleDeg: number; radius: number } {
  if (mode === 'minute') return { angleDeg: minute * 6, radius: OUTER_RADIUS };
  if (hourFormat === '12h') return { angleDeg: ((hour12 ?? 12) % 12) * 30, radius: OUTER_RADIUS };
  const h = hour24 ?? 0;
  return { angleDeg: (h % 12) * 30, radius: h >= 1 && h <= 12 ? OUTER_RADIUS : INNER_RADIUS };
}

export default function Clock({
  mode,
  hourFormat,
  hour12,
  hour24,
  minute,
  onSelectHour,
  onSelectMinute,
  onRelease,
}: ClockProps) {
  const styles = useClockStyle();
  const faceLayout = useRef({ width: FACE_SIZE, height: FACE_SIZE });

  const onFaceLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    faceLayout.current = { width, height };
  };

  const angleFromTouch = useCallback((evt: GestureResponderEvent): number => {
    const { locationX, locationY } = evt.nativeEvent;
    const cx = faceLayout.current.width / 2;
    const cy = faceLayout.current.height / 2;
    const dx = locationX - cx;
    const dy = locationY - cy;
    let deg = (Math.atan2(dx, -dy) * 180) / Math.PI; // 0deg = 12 o'clock, clockwise
    if (deg < 0) deg += 360;
    return deg;
  }, []); // faceLayout is a ref — stable identity, safe to omit

  const distFromCenter = useCallback((evt: GestureResponderEvent): number => {
    const { locationX, locationY } = evt.nativeEvent;
    const cx = faceLayout.current.width / 2;
    const cy = faceLayout.current.height / 2;
    return Math.hypot(locationX - cx, locationY - cy);
  }, []);

  // --- the hand's rotation: an Animated.Value, NOT React state -----------
  // Updated via .setValue() during a drag — every touch-move event does
  // this, and .setValue() writes straight through to the native view,
  // completely bypassing React's render/reconciliation cycle. Routing this
  // through setState instead (as an earlier version did) meant every pixel
  // of finger movement triggered a full component re-render; on a burst of
  // buffered touch-move events RN can deliver in one go, enough of those
  // chained synchronously is exactly what trips React's "Maximum update
  // depth exceeded" safeguard. Stores CSS rotation degrees directly
  // (already offset by -90, since CSS rotate 0deg points right/3-o'clock).
  const initialGeometry = committedHandGeometry(mode, hourFormat, hour12, hour24, minute);
  const handRotationAnim = useRef(new Animated.Value(initialGeometry.angleDeg - 90)).current;

  // handRadius flips between exactly two values (outer/inner ring) — this
  // changes rarely (only right at a ring boundary crossing, or when the
  // committed value/mode changes), so plain state is safe here; it's the
  // continuous per-pixel angle above that needed to move off React state.
  const [handRadius, setHandRadius] = useState(initialGeometry.radius);
  const [dragActive, setDragActive] = useState(false);

  // Keep the hand pinned to the committed value whenever NOT actively being
  // dragged — e.g. mode toggles via the digital display, AM/PM changes, or
  // an external value prop change. .setValue() here doesn't trigger a
  // React re-render either, so this can't reintroduce the same problem.
  useEffect(() => {
    if (dragActive) return; // touch is driving it directly right now
    const { angleDeg, radius } = committedHandGeometry(mode, hourFormat, hour12, hour24, minute);
    handRotationAnim.setValue(angleDeg - 90);
    setHandRadius(radius);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, hourFormat, hour12, hour24, minute, dragActive]);

  // Separate refs per mode — so switching from minute to hour (or back)
  // can't cause the first touch in the new mode to be wrongly skipped just
  // because it happens to round to the same number the OTHER mode last saw.
  // This only gates the discrete onSelectHour/onSelectMinute calls (i.e.
  // what actually gets stored/displayed) — it has no bearing on the live
  // hand rotation above, which is driven unconditionally every move.
  const lastMinuteRef = useRef<number | null>(null);
  const lastHourRef = useRef<number | null>(null);

  const applyTouch = useCallback(
    (evt: GestureResponderEvent) => {
      const deg = angleFromTouch(evt);
      handRotationAnim.setValue(deg - 90); // live, every event — no re-render

      if (mode === 'minute') {
        if (handRadius !== OUTER_RADIUS) setHandRadius(OUTER_RADIUS); // rare — safe as state

        const m = Math.round(deg / 6) % 60;
        if (m === lastMinuteRef.current) return; // no actual change — skip the update
        lastMinuteRef.current = m;
        onSelectMinute(m);
        return;
      }

      const idx = Math.round(deg / 30) % 12; // 0..11
      let hourValue: number;

      if (hourFormat === '12h') {
        hourValue = idx === 0 ? 12 : idx;
        if (handRadius !== OUTER_RADIUS) setHandRadius(OUTER_RADIUS);
      } else {
        // 24h: which ring did they touch?
        const dist = distFromCenter(evt);
        const outer = dist >= RING_THRESHOLD;
        const r = outer ? OUTER_RADIUS : INNER_RADIUS;
        if (handRadius !== r) setHandRadius(r); // only changes right at the ring boundary
        hourValue = outer
          ? idx === 0 ? 12 : idx // outer ring: 1–12
          : idx === 0 ? 0 : idx + 12; // inner ring: 00, 13–23
      }

      if (hourValue === lastHourRef.current) return; // no actual change — skip the update
      lastHourRef.current = hourValue;
      onSelectHour(hourValue);
    },
    [mode, hourFormat, handRadius, onSelectHour, onSelectMinute, angleFromTouch, distFromCenter, handRotationAnim]
  );

  // The PanResponder object must stay stable across renders (recreating it
  // mid-gesture breaks touch tracking), but its handlers must always see
  // the LATEST mode/hourFormat/onSelectHour/onSelectMinute — not whatever
  // they were on the render that first created it. Route through refs that
  // get updated every render so the stable PanResponder always calls
  // through to current behavior.
  const applyTouchRef = useRef(applyTouch);
  applyTouchRef.current = applyTouch;
  const onReleaseRef = useRef(onRelease);
  onReleaseRef.current = onRelease;

  const beginDrag = useCallback((evt: GestureResponderEvent) => {
    setDragActive(true); // rare (once per gesture) — safe as state
    applyTouchRef.current(evt);
  }, []);

  const endDrag = useCallback(() => {
    setDragActive(false); // triggers the sync effect above to snap to the committed value
    onReleaseRef.current?.();
  }, []);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => beginDrag(evt),
      onPanResponderMove: (evt) => applyTouchRef.current(evt),
      onPanResponderRelease: () => endDrag(),
      onPanResponderTerminate: () => endDrag(), // e.g. a parent ScrollView steals the gesture
    })
  ).current;

  // rotate needs a string ('45deg'), not a raw number — this interpolation
  // is a standard passthrough trick: it just maps the stored degrees
  // straight to the same number of degrees as a string.
  const rotateInterpolated = handRotationAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '1deg'],
  });

  // --- labels -------------------------------------------------------------

  const minuteLabels = Array.from({ length: 12 }, (_, i) => i * 5);
  const outerHourLabels = Array.from({ length: 12 }, (_, i) => (i === 0 ? 12 : i));
  const innerHourLabels = Array.from({ length: 12 }, (_, i) => (i === 0 ? 0 : i + 12));

  const isOuterActive = (v: number) =>
    mode === 'minute'
      ? v === minute
      : hourFormat === '12h'
        ? v === hour12
        : v === hour24;

  const isInnerActive = (v: number) => mode === 'hour' && hourFormat === '24h' && v === hour24;

  return (
    <View style={[styles.face, { width: FACE_SIZE, height: FACE_SIZE, borderRadius: RADIUS }]}>
      <View
        style={{ width: FACE_SIZE, height: FACE_SIZE }}
        onLayout={onFaceLayout}
        {...panResponder.panHandlers}
      >
        <View
          style={[
            styles.centerDot,
            { position: 'absolute', left: RADIUS - 4, top: RADIUS - 4, width: 8, height: 8, borderRadius: 4, zIndex: 3 },
          ]}
        />

        {/* Everything that needs to rotate — the hand line AND its end dot —
            lives inside this one Animated.View, so they move together from
            a single transform with no separate position tracking to keep
            in sync. Version-safe pivot: RN's default transform origin is
            an element's own center, so this bar spans handRadius on BOTH
            sides of the clock's center (left = RADIUS - handRadius, width
            = handRadius*2) — its center already sits exactly on
            (RADIUS, RADIUS), so rotating it needs no transformOrigin. */}
        <Animated.View
          style={{
            position: 'absolute',
            left: RADIUS - handRadius,
            top: RADIUS - 1,
            width: handRadius * 2,
            height: 2,
            transform: [{ rotate: rotateInterpolated }],
            zIndex: 1,
          }}
        >
          <View style={[styles.hand, { position: 'absolute', right: 0, width: handRadius, height: 2 }]} />
          <View
            style={[
              styles.handEndDot,
              { position: 'absolute', width: 32, height: 32, borderRadius: 16, right: -16, top: -15 },
            ]}
          />
        </Animated.View>

        {mode === 'minute' &&
          minuteLabels.map((v, i) => {
            const pos = polar(OUTER_RADIUS, i * 30);
            return (
              <View
                key={v}
                pointerEvents="none"
                style={{ position: 'absolute', width: 32, height: 24, left: pos.x - 16, top: pos.y - 12, alignItems: 'center', justifyContent: 'center', zIndex: 2 }}
              >
                <Text style={[styles.labelText, isOuterActive(v) && styles.labelTextActive]}>
                  {pad2(v)}
                </Text>
              </View>
            );
          })}

        {mode === 'hour' &&
          outerHourLabels.map((v, i) => {
            const pos = polar(OUTER_RADIUS, i * 30);
            return (
              <View
                key={`outer-${v}`}
                pointerEvents="none"
                style={{ position: 'absolute', width: 32, height: 24, left: pos.x - 16, top: pos.y - 12, alignItems: 'center', justifyContent: 'center', zIndex: 2 }}
              >
                <Text style={[styles.labelText, isOuterActive(v) && styles.labelTextActive]}>
                  {v}
                </Text>
              </View>
            );
          })}

        {mode === 'hour' &&
          hourFormat === '24h' &&
          innerHourLabels.map((v, i) => {
            const pos = polar(INNER_RADIUS, i * 30);
            return (
              <View
                key={`inner-${v}`}
                pointerEvents="none"
                style={{ position: 'absolute', width: 28, height: 20, left: pos.x - 14, top: pos.y - 10, alignItems: 'center', justifyContent: 'center', zIndex: 2 }}
              >
                <Text
                  style={[
                    styles.labelTextInner,
                    isInnerActive(v) && styles.labelTextActive,
                  ]}
                >
                  {pad2(v)}
                </Text>
              </View>
            );
          })}
      </View>
    </View>
  );
}