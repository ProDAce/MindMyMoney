// components/datetime/Calendar.tsx
import { memo, useEffect, useMemo, useState } from 'react';
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

/** Cheap, allocation-free comparable key for a calendar date — avoids
 *  constructing/comparing Date objects in hot per-cell checks. */
function dateKey(y: number, m: number, d: number): number {
  return y * 10000 + (m + 1) * 100 + d;
}

function keyOf(d: Date): number {
  return dateKey(d.getFullYear(), d.getMonth(), d.getDate());
}

export interface CalendarProps {
  /** Currently selected date, if any. Controls which day is highlighted. */
  selected?: Date | null;
  /** Called with a plain Date (time stripped to midnight) when a day is tapped. */
  onSelect: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
}

function CalendarInner({ selected, onSelect, minDate, maxDate }: CalendarProps) {
  const [cursor, setCursor] = useState<Date>(selected ?? new Date());
  const styles = useCalendarStyle();

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

  const goMonth = (delta: number) => setCursor(new Date(year, monthIndex + delta, 1));
  const goYear = (delta: number) => setCursor(new Date(year + delta, monthIndex, 1));

  // Build all 42 cells (with their Date + comparable key) exactly once per
  // (year, monthIndex) — not on every keystroke elsewhere in the sheet, and
  // not 3-4 times per cell the way isSelected/isToday/isDisabled/onPress
  // each separately reconstructing a Date used to.
  type Cell = { day: number; offset: -1 | 0 | 1; date: Date; key: number };
  const cells = useMemo<Cell[]>(() => {
    const firstWeekday = new Date(year, monthIndex, 1).getDay();
    const totalDays = daysInMonth(year, monthIndex);
    const prevMonthDays = daysInMonth(year, monthIndex - 1);

    const built: Cell[] = [];
    const push = (day: number, offset: -1 | 0 | 1) => {
      const date = new Date(year, monthIndex + offset, day);
      built.push({ day, offset, date, key: keyOf(date) });
    };

    for (let i = firstWeekday - 1; i >= 0; i--) push(prevMonthDays - i, -1);
    for (let d = 1; d <= totalDays; d++) push(d, 0);
    let trailing = 1;
    while (built.length < 42) push(trailing++, 1);

    return built;
  }, [year, monthIndex]);

  const selectedKey = selected ? keyOf(selected) : null;
  const todayKey = keyOf(new Date());
  const minKey = minDate ? keyOf(minDate) : null;
  const maxKey = maxDate ? keyOf(maxDate) : null;

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
              // Plain integer comparisons — no Date allocation per check.
              const disabled = (minKey !== null && cell.key < minKey) || (maxKey !== null && cell.key > maxKey);
              const selectedCell = selectedKey !== null && cell.key === selectedKey;
              const todayCell = cell.key === todayKey;
              const outOfMonth = cell.offset !== 0;

              return (
                <TouchableOpacity
                  key={colIdx}
                  style={[
                    styles.dayCell,
                    selectedCell && styles.dayCellSelected,
                    todayCell && !selectedCell && styles.dayCellToday,
                  ]}
                  disabled={disabled}
                  onPress={() => {
                    if (outOfMonth) setCursor(new Date(year, monthIndex + cell.offset, 1));
                    onSelect(cell.date);
                  }}
                >
                  <Text
                    style={[
                      styles.dayCellText,
                      outOfMonth && styles.dayCellTextOutOfMonth,
                      disabled && styles.dayCellTextDisabled,
                      selectedCell && styles.dayCellTextSelected,
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

function sameDateOrNull(a?: Date | null, b?: Date | null): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  return sameDay(a, b);
}

// Custom comparator: `selected`/`minDate`/`maxDate` are compared by value,
// not reference — DateSelector constructs a fresh Date on every keystroke,
// so a reference check here would re-render all 42 cells on every digit
// typed, even when nothing about the grid actually changed. `onSelect` is
// still compared by reference — pass a useCallback-stabilized handler from
// the parent so an unrelated re-render doesn't force this to re-render too.
const Calendar = memo(CalendarInner, (prev, next) => {
  return (
    sameDateOrNull(prev.selected, next.selected) &&
    sameDateOrNull(prev.minDate, next.minDate) &&
    sameDateOrNull(prev.maxDate, next.maxDate) &&
    prev.onSelect === next.onSelect
  );
});

export default Calendar;