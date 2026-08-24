// components/datetime/Clock.tsx
import { useRef } from 'react';
import {
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

  const angleFromTouch = (evt: GestureResponderEvent): number => {
    const { locationX, locationY } = evt.nativeEvent;
    const cx = faceLayout.current.width / 2;
    const cy = faceLayout.current.height / 2;
    const dx = locationX - cx;
    const dy = locationY - cy;
    let deg = (Math.atan2(dx, -dy) * 180) / Math.PI; // 0deg = 12 o'clock, clockwise
    if (deg < 0) deg += 360;
    return deg;
  };

  const distFromCenter = (evt: GestureResponderEvent): number => {
    const { locationX, locationY } = evt.nativeEvent;
    const cx = faceLayout.current.width / 2;
    const cy = faceLayout.current.height / 2;
    return Math.hypot(locationX - cx, locationY - cy);
  };

  const applyTouch = (evt: GestureResponderEvent) => {
    const deg = angleFromTouch(evt);

    if (mode === 'minute') {
      const m = Math.round(deg / 6) % 60;
      onSelectMinute(m);
      return;
    }

    const idx = Math.round(deg / 30) % 12; // 0..11

    if (hourFormat === '12h') {
      onSelectHour(idx === 0 ? 12 : idx);
      return;
    }

    // 24h: which ring did they touch?
    const dist = distFromCenter(evt);
    if (dist >= RING_THRESHOLD) {
      onSelectHour(idx === 0 ? 12 : idx); // outer ring: 1–12
    } else {
      onSelectHour(idx === 0 ? 0 : idx + 12); // inner ring: 00, 13–23
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: applyTouch,
      onPanResponderMove: applyTouch,
      onPanResponderRelease: () => onRelease?.(),
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  ).current;

  // --- what's currently selected, and where the hand points -------------

  let handAngleDeg: number;
  let handRadius: number;

  if (mode === 'minute') {
    handAngleDeg = minute * 6;
    handRadius = OUTER_RADIUS;
  } else if (hourFormat === '12h') {
    handAngleDeg = ((hour12 ?? 12) % 12) * 30;
    handRadius = OUTER_RADIUS;
  } else {
    const h = hour24 ?? 0;
    handAngleDeg = (h % 12) * 30;
    handRadius = h >= 1 && h <= 12 ? OUTER_RADIUS : INNER_RADIUS;
  }

  const handCssRotation = handAngleDeg - 90; // CSS rotate 0deg points right (3 o'clock)
  const handEnd = polar(handRadius, handAngleDeg);

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

        {/* Version-safe hand: RN's default transform origin is an element's
            own center, so this outer bar spans handRadius on BOTH sides of
            the clock's center (left = RADIUS - handRadius, width =
            handRadius*2) — meaning its center already sits exactly on
            (RADIUS, RADIUS), so rotating it needs no transformOrigin at
            all. Only the outward half is actually colored. */}
        <View
          style={{
            position: 'absolute',
            left: RADIUS - handRadius,
            top: RADIUS - 1,
            width: handRadius * 2,
            height: 2,
            transform: [{ rotate: `${handCssRotation}deg` }],
            zIndex: 1,
          }}
        >
          <View style={[styles.hand, { position: 'absolute', right: 0, width: handRadius, height: 2 }]} />
        </View>
        <View
          style={[
            styles.handEndDot,
            {
              position: 'absolute',
              width: 32,
              height: 32,
              borderRadius: 16,
              left: handEnd.x - 16,
              top: handEnd.y - 16,
              zIndex: 1,
            },
          ]}
        />

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