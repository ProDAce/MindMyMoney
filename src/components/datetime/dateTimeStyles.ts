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

// ---------------------------------------------------------------------------
// Clock (the dial itself — components/datetime/Clock.tsx)
// ---------------------------------------------------------------------------

const createClockStyle = (theme: Theme) =>
  StyleSheet.create({
    face: {
      backgroundColor: theme.colors.surfaceElevated,
    },
    centerDot: {
      backgroundColor: theme.colors.accent,
    },
    hand: {
      backgroundColor: theme.colors.accent,
    },
    handEndDot: {
      backgroundColor: theme.colors.accent,
      opacity: 0.25,
    },
    labelText: {
      color: theme.colors.text,
      fontSize: 15,
      fontWeight: '500',
    },
    labelTextInner: {
      color: theme.colors.textMuted,
      fontSize: 12,
      fontWeight: '500',
    },
    labelTextActive: {
      color: theme.colors.primaryText,
      fontWeight: '700',
    },
  });

export const useClockStyle = () => {
  const theme = useTheme();
  return useMemo(() => createClockStyle(theme), [theme]);
};

// ---------------------------------------------------------------------------
// TimeSelector (digital readout + AM/PM + the Clock — components/datetime/TimeSelector.tsx)
// ---------------------------------------------------------------------------

const createTimeSelectorStyle = (theme: Theme) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.colors.surface,
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
      color: theme.colors.textMuted,
      fontSize: 40,
      fontWeight: '300',
    },
    digitalTextActive: {
      color: theme.colors.accent,
      fontWeight: '600',
    },
    digitalColon: {
      color: theme.colors.textMuted,
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
      borderColor: theme.colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      marginVertical: 2,
    },
    periodButtonActive: {
      backgroundColor: theme.colors.accent,
      borderColor: theme.colors.accent,
    },
    periodText: {
      color: theme.colors.textMuted,
      fontSize: 12,
      fontWeight: '700',
    },
    periodTextActive: {
      color: theme.colors.primaryText,
    },
    faceWrap: {
      alignItems: 'center',
    },
  });

export const useTimeSelectorStyle = () => {
  const theme = useTheme();
  return useMemo(() => createTimeSelectorStyle(theme), [theme]);
};