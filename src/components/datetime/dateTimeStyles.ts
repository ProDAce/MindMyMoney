// components/datetime/dateTimeStyles.ts

import { Theme, useTheme } from '@/styles/theme';
import { useMemo } from 'react';
import { StyleSheet } from 'react-native';

const createCalendarStyle = (theme: Theme) =>
  StyleSheet.create({
    card: {
        backgroundColor: theme.colors.background,
        borderRadius: 14,
        padding: 12,
      },
      header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
      },
      navIcon: {
        color: theme.colors.text,
        fontSize: 20,
        paddingHorizontal: 6,
      },
      title: {
        color: theme.colors.text,
        fontSize: 16,
        fontWeight: '700',
      },
      weekdayRow: {
        flexDirection: 'row',
        marginBottom: 4,
      },
      weekdayLabel: {
        flex: 1,
        textAlign: 'center',
        color: theme.colors.textMuted,
        fontSize: 12,
        fontWeight: '600',
      },
      daysGrid: {
        flexDirection: 'column',
      },
      dayRow: {
        flexDirection: 'row',
      },
      dayCell: {
        flex: 1,
        aspectRatio: 1,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
        marginVertical: 1,
      },
      dayCellSelected: {
        backgroundColor: theme.colors.accent,
      },
      dayCellToday: {
        borderWidth: 1,
        borderColor: theme.colors.transfer,
      },
      dayCellText: {
        color: theme.colors.text,
        fontSize: 14,
      },
      dayCellTextSelected: {
        color: theme.colors.primaryText,
        fontWeight: '700',
      },
      dayCellTextDisabled: {
        color: theme.colors.textMuted,
      },
      dayCellTextOutOfMonth: {
        color: theme.colors.textMuted,
        opacity: 0.45,
      },
  });

export const useCalendarStyle = () => {
  const theme = useTheme();
  return useMemo(() => createCalendarStyle(theme), [theme]);
};