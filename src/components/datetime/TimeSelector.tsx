// components/datetime/TimeSelector.tsx
import { useEffect, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import Clock, { HourFormat } from './Clock';
import { useTimeSelectorStyle } from './dateTimeStyles';

// ---------------------------------------------------------------------------
// Time value contract: the UI can work in 12-hour + AM/PM, but everything
// that leaves this component — onChange, the isoTime string — is always
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
  /** Display/interaction format for the dial. Storage is always 24h regardless. */
  format?: HourFormat;
  /** (time, isoTime) — isoTime is always the canonical zero-padded "HH:MM", 24h. */
  onChange: (time: TimeValue, isoTime: string) => void;
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

/** Canonical storage string — always 24h, zero-padded, no AM/PM. */
export function toTimeStorageString(time: TimeValue): string {
  return `${pad2(time.hour)}:${pad2(time.minute)}`;
}

/** Display string honoring the chosen format — for showing on a trigger, not for storage. */
export function formatTime(time: TimeValue, format: HourFormat): string {
  if (format === '24h') return `${pad2(time.hour)}:${pad2(time.minute)}`;
  const { hour12, period } = to12Hour(time.hour);
  return `${pad2(hour12)}:${pad2(time.minute)} ${period}`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function TimeSelector({ value, format = '12h', onChange }: TimeSelectorProps) {
  const styles = useTimeSelectorStyle();

  const [hour24, setHour24] = useState(value?.hour ?? new Date().getHours());
  const [minute, setMinute] = useState(value?.minute ?? 0);
  const [mode, setMode] = useState<Mode>('hour');

  const { hour12, period } = to12Hour(hour24);

  // Always report 24-hour time — the consumer never sees hour12/period.
  useEffect(() => {
    const time: TimeValue = { hour: hour24, minute };
    onChange(time, toTimeStorageString(time));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hour24, minute]);

  const handleSelectHour = (dialValue: number) => {
    if (format === '24h') {
      setHour24(dialValue); // Clock already reports the actual 0–23 hour in 24h mode
    } else {
      setHour24(to24Hour(dialValue, period)); // dialValue is 1–12; keep current AM/PM
    }
  };

  const handleSelectMinute = (m: number) => setMinute(m);

  const handleTogglePeriod = (p: Period) => {
    setHour24(to24Hour(hour12, p));
  };

  const handleRelease = () => {
    if (mode === 'hour') setMode('minute'); // native-picker-style auto-advance
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.digitalRow}>
          <TouchableOpacity onPress={() => setMode('hour')}>
            <Text style={[styles.digitalText, mode === 'hour' && styles.digitalTextActive]}>
              {pad2(format === '24h' ? hour24 : hour12)}
            </Text>
          </TouchableOpacity>
          <Text style={styles.digitalColon}>:</Text>
          <TouchableOpacity onPress={() => setMode('minute')}>
            <Text style={[styles.digitalText, mode === 'minute' && styles.digitalTextActive]}>
              {pad2(minute)}
            </Text>
          </TouchableOpacity>
        </View>

        {format === '12h' && (
          <View style={styles.periodColumn}>
            <TouchableOpacity
              style={[styles.periodButton, period === 'AM' && styles.periodButtonActive]}
              onPress={() => handleTogglePeriod('AM')}
            >
              <Text style={[styles.periodText, period === 'AM' && styles.periodTextActive]}>
                AM
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.periodButton, period === 'PM' && styles.periodButtonActive]}
              onPress={() => handleTogglePeriod('PM')}
            >
              <Text style={[styles.periodText, period === 'PM' && styles.periodTextActive]}>
                PM
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.faceWrap}>
        <Clock
          mode={mode}
          hourFormat={format}
          hour12={hour12}
          hour24={hour24}
          minute={minute}
          onSelectHour={handleSelectHour}
          onSelectMinute={handleSelectMinute}
          onRelease={handleRelease}
        />
      </View>
    </View>
  );
}
