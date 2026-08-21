// components/datetime/Calendar.tsx
import { useGlobalStyles } from '@/styles/global';
import { useEffect, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useCalendarStyle } from './dateTimeStyles';

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const WEEKDAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const hitSlop = { top: 8, bottom: 8, left: 8, right: 8 };

export function daysInMonth(year: number, monthIndex0: number): number {
  return new Date(year, monthIndex0 + 1, 0).getDate();
}

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export interface CalendarProps {
  /** Currently selected date, if any. Controls which day is highlighted. */
  selected?: Date | null;
  /** Called with a plain Date (time stripped to midnight) when a day is tapped. */
  onSelect: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
}

export default function Calendar({ selected, onSelect, minDate, maxDate }: CalendarProps) {
  const [cursor, setCursor] = useState<Date>(selected ?? new Date());

  // Jump the visible month whenever the selected date changes from outside
  // (e.g. the user typed a date manually rather than tapping the grid).
  useEffect(() => {
    if (selected && !sameDay(selected, cursor)) {
      setCursor(new Date(selected.getFullYear(), selected.getMonth(), 1));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  const year = cursor.getFullYear();
  const monthIndex = cursor.getMonth();
  const firstWeekday = new Date(year, monthIndex, 1).getDay();
  const totalDays = daysInMonth(year, monthIndex);
  const prevMonthDays = daysInMonth(year, monthIndex - 1);

  // Always build a fixed 6-row (42 cell) grid, filling the leading/trailing
  // edges with the adjacent month's days so the card height never changes
  // and there's no empty gap on shorter months.
  type Cell = { day: number; offset: -1 | 0 | 1 };
  const cells: Cell[] = [];
  for (let i = firstWeekday - 1; i >= 0; i--) {
    cells.push({ day: prevMonthDays - i, offset: -1 });
  }
  for (let d = 1; d <= totalDays; d++) {
    cells.push({ day: d, offset: 0 });
  }
  let trailing = 1;
  while (cells.length < 42) {
    cells.push({ day: trailing++, offset: 1 });
  }

  const goMonth = (delta: number) => setCursor(new Date(year, monthIndex + delta, 1));
  const goYear = (delta: number) => setCursor(new Date(year + delta, monthIndex, 1));

  const cellDate = (cell: Cell) => new Date(year, monthIndex + cell.offset, cell.day);

  const isDisabled = (cell: Cell) => {
    const d = cellDate(cell);
    if (minDate && d < new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate()))
      return true;
    if (maxDate && d > new Date(maxDate.getFullYear(), maxDate.getMonth(), maxDate.getDate()))
      return true;
    return false;
  };

  const isSelected = (cell: Cell) => !!selected && sameDay(selected, cellDate(cell));

  const today = new Date();
  const isToday = (cell: Cell) => sameDay(today, cellDate(cell));

  const {theme} = useGlobalStyles();
  const styles = useCalendarStyle();

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => goYear(-1)} hitSlop={hitSlop}>
          <Text style={styles.navIcon}>«</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => goMonth(-1)} hitSlop={hitSlop}>
          <Text style={styles.navIcon}>‹</Text>
        </TouchableOpacity>

        <Text style={styles.title}>
          {MONTH_NAMES[monthIndex]} {year}
        </Text>

        <TouchableOpacity onPress={() => goMonth(1)} hitSlop={hitSlop}>
          <Text style={styles.navIcon}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => goYear(1)} hitSlop={hitSlop}>
          <Text style={styles.navIcon}>»</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.weekdayRow}>
        {WEEKDAY_LABELS.map((w) => (
          <Text key={w} style={styles.weekdayLabel}>
            {w}
          </Text>
        ))}
      </View>

      <View style={styles.daysGrid}>
        {Array.from({ length: 6 }, (_, rowIdx) => (
          <View key={rowIdx} style={styles.dayRow}>
            {cells.slice(rowIdx * 7, rowIdx * 7 + 7).map((cell, colIdx) => {
              const disabled = isDisabled(cell);
              const outOfMonth = cell.offset !== 0;
              return (
                <TouchableOpacity
                  key={colIdx}
                  style={[
                    styles.dayCell,
                    isSelected(cell) && styles.dayCellSelected,
                    isToday(cell) && !isSelected(cell) && styles.dayCellToday,
                  ]}
                  disabled={disabled}
                  onPress={() => {
                    if (outOfMonth) setCursor(new Date(year, monthIndex + cell.offset, 1));
                    onSelect(cellDate(cell));
                  }}
                >
                  <Text
                    style={[
                      styles.dayCellText,
                      outOfMonth && styles.dayCellTextOutOfMonth,
                      disabled && styles.dayCellTextDisabled,
                      isSelected(cell) && styles.dayCellTextSelected,
                    ]}
                  >
                    {cell.day}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
}

