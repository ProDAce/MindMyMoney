// components/datetime/TimeSelector.tsx

import { useEffect, useRef, useState } from 'react';
import {
    GestureResponderEvent,
    LayoutChangeEvent,
    PanResponder,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
// import { COLORS } from './Calender';

export const COLORS = {
  ink: '#14161A',
  panel: '#1B1E24',
  field: '#21242B',
  border: '#2E323B',
  text: '#F5F3EE',
  muted: '#8A8F98',
  placeholder: '#575B64',
  accent: '#35D0A0',
  today: '#FF8A3D',
};

// ---------------------------------------------------------------------------
// Time value contract: UI works in 12-hour + AM/PM, but everything that
// leaves this component — onChange, the value it's fed back — is always
// 24-hour. AM/PM never escapes this file.
// ---------------------------------------------------------------------------

export interface TimeValue {
  /** 0–23 */
  hour: number;
  /** 0–59 */
  minute: number;
}

export interface TimeSelectorProps {
  value?: TimeValue;
  onChange: (time: TimeValue) => void;
}

type Period = 'AM' | 'PM';
type Mode = 'hour' | 'minute';

function pad2(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

function to24Hour(hour12: number, period: Period): number {
  if (period === 'AM') return hour12 === 12 ? 0 : hour12;
  return hour12 === 12 ? 12 : hour12 + 12;
}

function to12Hour(hour24: number): { hour12: number; period: Period } {
  const period: Period = hour24 < 12 ? 'AM' : 'PM';
  let hour12 = hour24 % 12;
  if (hour12 === 0) hour12 = 12;
  return { hour12, period };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const FACE_SIZE = 240;
const RADIUS = FACE_SIZE / 2;
const LABEL_INSET = 30; // distance of number labels from the outer edge

export default function TimeSelector({ value, onChange }: TimeSelectorProps) {
  const initial = value ? to12Hour(value.hour) : to12Hour(new Date().getHours());

  const [hour12, setHour12] = useState(initial.hour12);
  const [minute, setMinute] = useState(value?.minute ?? 0);
  const [period, setPeriod] = useState<Period>(initial.period);
  const [mode, setMode] = useState<Mode>('hour');

  // Report 24-hour time any time the underlying pieces change — the
  // consumer never sees hour12 or period.
  useEffect(() => {
    onChange({ hour: to24Hour(hour12, period), minute });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hour12, minute, period]);

  const faceLayout = useRef({ x: 0, y: 0, width: FACE_SIZE, height: FACE_SIZE });

  const onFaceLayout = (e: LayoutChangeEvent) => {
    const { x, y, width, height } = e.nativeEvent.layout;
    faceLayout.current = { x, y, width, height };
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

  const applyTouch = (evt: GestureResponderEvent) => {
    const deg = angleFromTouch(evt);
    if (mode === 'hour') {
      const idx = Math.round(deg / 30) % 12;
      setHour12(idx === 0 ? 12 : idx);
    } else {
      const m = Math.round(deg / 6) % 60;
      setMinute(m);
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: applyTouch,
      onPanResponderMove: applyTouch,
      onPanResponderRelease: () => {
        if (mode === 'hour') setMode('minute'); // native-picker-style auto-advance
      },
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  ).current;

  // --- label geometry -------------------------------------------------

  const labelPosition = (index: number) => {
    const theta = (index * 30 * Math.PI) / 180;
    const r = RADIUS - LABEL_INSET;
    const x = RADIUS + r * Math.sin(theta);
    const y = RADIUS - r * Math.cos(theta);
    return { left: x - 16, top: y - 12 };
  };

  const hourLabels = Array.from({ length: 12 }, (_, i) => (i === 0 ? 12 : i));
  const minuteLabels = Array.from({ length: 12 }, (_, i) => i * 5);
  const labels = mode === 'hour' ? hourLabels : minuteLabels;

  const isLabelActive = (labelValue: number) =>
    mode === 'hour' ? labelValue === hour12 : labelValue === minute;

  // --- hand geometry ----------------------------------------------------

  const handAngleDeg = mode === 'hour' ? (hour12 % 12) * 30 : minute * 6;
  const handCssRotation = handAngleDeg - 90; // 0deg in CSS-rotate points right (3 o'clock)
  const handLength = RADIUS - LABEL_INSET;

  const handEnd = (() => {
    const theta = (handAngleDeg * Math.PI) / 180;
    const x = RADIUS + handLength * Math.sin(theta);
    const y = RADIUS - handLength * Math.cos(theta);
    return { x, y };
  })();

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.digitalRow}>
          <TouchableOpacity onPress={() => setMode('hour')}>
            <Text style={[styles.digitalText, mode === 'hour' && styles.digitalTextActive]}>
              {pad2(hour12)}
            </Text>
          </TouchableOpacity>
          <Text style={styles.digitalColon}>:</Text>
          <TouchableOpacity onPress={() => setMode('minute')}>
            <Text style={[styles.digitalText, mode === 'minute' && styles.digitalTextActive]}>
              {pad2(minute)}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.periodColumn}>
          <TouchableOpacity
            style={[styles.periodButton, period === 'AM' && styles.periodButtonActive]}
            onPress={() => setPeriod('AM')}
          >
            <Text style={[styles.periodText, period === 'AM' && styles.periodTextActive]}>
              AM
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.periodButton, period === 'PM' && styles.periodButtonActive]}
            onPress={() => setPeriod('PM')}
          >
            <Text style={[styles.periodText, period === 'PM' && styles.periodTextActive]}>
              PM
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.faceWrap}>
        <View style={styles.face} onLayout={onFaceLayout} {...panResponder.panHandlers}>
          <View style={styles.centerDot} />

          <View
            style={[
              styles.hand,
              {
                width: handLength,
                transform: [{ rotate: `${handCssRotation}deg` }],
              },
            ]}
          />
          <View style={[styles.handEndDot, { left: handEnd.x - 16, top: handEnd.y - 16 }]} />

          {labels.map((labelValue, i) => {
            const pos = labelPosition(i);
            const active = isLabelActive(labelValue);
            return (
              <View key={i} pointerEvents="none" style={[styles.labelBox, pos]}>
                <Text style={[styles.labelText, active && styles.labelTextActive]}>
                  {mode === 'minute' ? pad2(labelValue) : labelValue}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.panel,
    borderRadius: 16,
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  digitalRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  digitalText: {
    color: COLORS.muted,
    fontSize: 40,
    fontWeight: '300',
  },
  digitalTextActive: {
    color: COLORS.accent,
    fontWeight: '600',
  },
  digitalColon: {
    color: COLORS.muted,
    fontSize: 40,
    fontWeight: '300',
    marginHorizontal: 2,
  },
  periodColumn: {
    marginLeft: 16,
  },
  periodButton: {
    width: 44,
    height: 28,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 2,
  },
  periodButtonActive: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  periodText: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: '700',
  },
  periodTextActive: {
    color: COLORS.ink,
  },
  faceWrap: {
    alignItems: 'center',
  },
  face: {
    width: FACE_SIZE,
    height: FACE_SIZE,
    borderRadius: FACE_SIZE / 2,
    backgroundColor: COLORS.field,
  },
  centerDot: {
    position: 'absolute',
    left: RADIUS - 4,
    top: RADIUS - 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.accent,
    zIndex: 3,
  },
  hand: {
    position: 'absolute',
    left: RADIUS,
    top: RADIUS - 1,
    height: 2,
    backgroundColor: COLORS.accent,
    transformOrigin: 'left',
    zIndex: 1,
  },
  handEndDot: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.accent,
    opacity: 0.25,
    zIndex: 1,
  },
  labelBox: {
    position: 'absolute',
    width: 32,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  labelText: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '500',
  },
  labelTextActive: {
    color: COLORS.ink,
    fontWeight: '700',
  },
});