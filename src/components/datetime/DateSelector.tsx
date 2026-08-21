// components/datetime/DateSelector.tsx
import { useGlobalStyles } from '@/styles/global';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Calendar, { MONTH_NAMES, daysInMonth } from './Calender';

// ---------------------------------------------------------------------------
// Supported format tokens
//   DD          -> 2-digit day
//   MM          -> 2-digit month
//   MonthName   -> full month name, chosen from a picker
//   YYYY        -> 4-digit year
//   YY          -> 2-digit year
// Tokens can appear in any order with any separator between them, e.g.
//   "DD/MM/YYYY", "MM-DD-YY", "DD/MonthName/YYYY", "YYYY/MM/DD"
// ---------------------------------------------------------------------------

export type DateFormat = string;

type TokenType = 'DD' | 'MM' | 'YYYY' | 'YY' | 'MonthName';

const TOKEN_REGEX = /DD|MM|YYYY|YY|MonthName/g;



export function parseFormat(format: DateFormat): { tokens: TokenType[]; seps: string[] } {
  const tokens: TokenType[] = [];
  const seps: string[] = [];
  let lastEnd = 0;
  let m: RegExpExecArray | null;
  const regex = new RegExp(TOKEN_REGEX);
  while ((m = regex.exec(format)) !== null) {
    if (tokens.length > 0) seps.push(format.slice(lastEnd, m.index));
    tokens.push(m[0] as TokenType);
    lastEnd = regex.lastIndex;
  }
  return { tokens, seps };
}

function pad2(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

export function formatDate(date: Date, tokens: TokenType[], seps: string[]): string {
  const day = date.getDate();
  const monthIndex = date.getMonth();
  const year = date.getFullYear();
  const parts = tokens.map((t) => {
    switch (t) {
      case 'DD':
        return pad2(day);
      case 'MM':
        return pad2(monthIndex + 1);
      case 'MonthName':
        return MONTH_NAMES[monthIndex];
      case 'YYYY':
        return `${year}`;
      case 'YY':
        return `${year}`.slice(-2);
      default:
        return '';
    }
  });
  return parts.reduce((acc, part, i) => acc + part + (seps[i] ?? ''), '');
}

function stripTime(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface DateSelectorProps {
  format: DateFormat;
  value?: Date;
  onChange: (date: Date, formatted: string) => void;
  minDate?: Date;
  maxDate?: Date;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function DateSelector({
  format,
  value,
  onChange,
  minDate,
  maxDate,
}: DateSelectorProps) {
  const { tokens, seps } = useMemo(() => parseFormat(format), [format]);
  const yearTokenLen = tokens.includes('YYYY') ? 4 : 2;

  const [dayStr, setDayStr] = useState(value ? pad2(value.getDate()) : '');
  const [monthStr, setMonthStr] = useState(
    value ? pad2(value.getMonth() + 1) : ''
  );
  const [monthIndex, setMonthIndex] = useState<number | null>(
    value ? value.getMonth() : null
  );
  const [yearStr, setYearStr] = useState(
    value
      ? yearTokenLen === 4
        ? `${value.getFullYear()}`
        : `${value.getFullYear()}`.slice(-2)
      : ''
  );
  const [monthPickerOpen, setMonthPickerOpen] = useState(false);

  const refs = [useRef<TextInput>(null), useRef<TextInput>(null), useRef<TextInput>(null)];

  const resolvedYear = (): number | null => {
    if (yearStr.length !== yearTokenLen) return null;
    const y = Number(yearStr);
    if (Number.isNaN(y)) return null;
    return yearTokenLen === 2 ? 2000 + y : y;
  };

  const resolvedMonthIndex0 = (): number | null => {
    if (tokens.includes('MonthName')) return monthIndex;
    if (monthStr.length !== 2) return null;
    const m = Number(monthStr);
    if (Number.isNaN(m) || m < 1 || m > 12) return null;
    return m - 1;
  };

  const resolvedDay = (): number | null => {
    if (dayStr.length !== 2) return null;
    const d = Number(dayStr);
    if (Number.isNaN(d) || d < 1 || d > 31) return null;
    return d;
  };

  const selectedDate = useMemo((): Date | null => {
    const y = resolvedYear();
    const m = resolvedMonthIndex0();
    const d = resolvedDay();
    if (y === null || m === null || d === null) return null;
    if (d > daysInMonth(y, m)) return null;
    return new Date(y, m, d);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dayStr, monthStr, monthIndex, yearStr]);

  // Whenever all three segments resolve to a valid, in-range date, fire onChange.
  useEffect(() => {
    if (!selectedDate) return;
    if (minDate && selectedDate < stripTime(minDate)) return;
    if (maxDate && selectedDate > stripTime(maxDate)) return;
    onChange(selectedDate, formatDate(selectedDate, tokens, seps));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  const focusNext = (index: number) => {
    const next = refs[index + 1];
    if (next && next.current) next.current.focus();
  };

  const onDigitsChange = (
    text: string,
    setter: (s: string) => void,
    maxLen: number,
    index: number
  ) => {
    const digits = text.replace(/[^0-9]/g, '').slice(0, maxLen);
    setter(digits);
    if (digits.length === maxLen) focusNext(index);
  };

  const applyDate = (date: Date) => {
    setDayStr(pad2(date.getDate()));
    if (tokens.includes('MonthName')) {
      setMonthIndex(date.getMonth());
    } else {
      setMonthStr(pad2(date.getMonth() + 1));
    }
    setYearStr(
      yearTokenLen === 4 ? `${date.getFullYear()}` : `${date.getFullYear()}`.slice(-2)
    );
  };

  const selectMonthName = (idx: number) => {
    setMonthIndex(idx);
    setMonthPickerOpen(false);
    focusNext(tokens.indexOf('MonthName'));
  };

  const {theme} = useGlobalStyles();

  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      padding: 12,
    },
    inputRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    segmentField: {
      backgroundColor: theme.colors.surfaceElevated,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: theme.colors.border,
      color: theme.colors.text,
      fontSize: 18,
      fontWeight: '600',
      textAlign: 'center',
      width: 52,
      height: 44,
    },
    yearField: {
      width: 68,
    },
    monthNameField: {
      backgroundColor: theme.colors.surfaceElevated,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: theme.colors.border,
      height: 44,
      paddingHorizontal: 12,
      justifyContent: 'center',
      minWidth: 110,
    },
    segmentValueText: {
      color: theme.colors.text,
      fontSize: 16,
      fontWeight: '600',
    },
    placeholderText: {
      color: theme.colors.textMuted,
      fontSize: 16,
      fontWeight: '600',
    },
    separator: {
      color: theme.colors.textMuted,
      fontSize: 18,
      marginHorizontal: 4,
    },
    calendarWrap: {
      marginTop: 14,
    },
    modalBackdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    monthListCard: {
      width: 220,
      maxHeight: 320,
      backgroundColor: theme.colors.surfaceElevated,
      borderRadius: 14,
      paddingVertical: 8,
    },
    monthListItem: {
      paddingVertical: 10,
      paddingHorizontal: 16,
    },
    monthListItemText: {
      color: theme.colors.text,
      fontSize: 16,
    },
    monthListItemTextActive: {
      color: theme.colors.accent,
      fontWeight: '700',
    },
  });

  const renderSegment = (token: TokenType, index: number) => {
    if (token === 'MonthName') {
      return (
        <TouchableOpacity
          key="monthname"
          style={styles.monthNameField}
          activeOpacity={0.7}
          onPress={() => setMonthPickerOpen(true)}
        >
          <Text style={monthIndex === null ? styles.placeholderText : styles.segmentValueText}>
            {monthIndex === null ? 'Month' : MONTH_NAMES[monthIndex]}
          </Text>
        </TouchableOpacity>
      );
    }

    if (token === 'DD') {
      return (
        <TextInput
          key="dd"
          ref={refs[index]}
          style={styles.segmentField}
          keyboardType="number-pad"
          maxLength={2}
          placeholder="DD"
          placeholderTextColor={theme.colors.textMuted}
          value={dayStr}
          onChangeText={(t) => onDigitsChange(t, setDayStr, 2, index)}
        />
      );
    }

    if (token === 'MM') {
      return (
        <TextInput
          key="mm"
          ref={refs[index]}
          style={styles.segmentField}
          keyboardType="number-pad"
          maxLength={2}
          placeholder="MM"
          placeholderTextColor={theme.colors.textMuted}
          value={monthStr}
          onChangeText={(t) => onDigitsChange(t, setMonthStr, 2, index)}
        />
      );
    }

    const len = token === 'YYYY' ? 4 : 2;
    return (
      <TextInput
        key="year"
        ref={refs[index]}
        style={[styles.segmentField, styles.yearField]}
        keyboardType="number-pad"
        maxLength={len}
        placeholder={token}
        placeholderTextColor={theme.colors.textMuted}
        value={yearStr}
        onChangeText={(t) => onDigitsChange(t, setYearStr, len, index)}
      />
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputRow}>
        {tokens.map((token, i) => (
          <React.Fragment key={`${token}-${i}`}>
            {renderSegment(token, i)}
            {i < seps.length && <Text style={styles.separator}>{seps[i]}</Text>}
          </React.Fragment>
        ))}
      </View>

      <View style={styles.calendarWrap}>
        <Calendar
          selected={selectedDate}
          onSelect={applyDate}
          minDate={minDate}
          maxDate={maxDate}
        />
      </View>

      <Modal visible={monthPickerOpen} transparent animationType="fade">
        <Pressable style={styles.modalBackdrop} onPress={() => setMonthPickerOpen(false)}>
          <View style={styles.monthListCard}>
            <ScrollView>
              {MONTH_NAMES.map((name, idx) => (
                <TouchableOpacity
                  key={name}
                  style={styles.monthListItem}
                  onPress={() => selectMonthName(idx)}
                >
                  <Text
                    style={[
                      styles.monthListItemText,
                      monthIndex === idx && styles.monthListItemTextActive,
                    ]}
                  >
                    {name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}