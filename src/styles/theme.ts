/**
 * theme.ts
 * Global theme file — Soft Lavender/Mint palette
 * Supports light and dark mode via React Native's Appearance API.
 */

import { useColorScheme } from 'react-native';

// ---------------------------------------------------------------------------
// 1. Raw color tokens
// ---------------------------------------------------------------------------

const palette = {
  // Brand
  lavender: '#8B7BB8',
  lavenderLight: '#B4A7D6',
  mint: '#5FAE7A',
  mintLight: '#8FD1A6',

  // Neutrals — light mode
  bgLight: '#FDFCFB',
  surfaceLight: '#FFFFFF',
  textLight: '#3D3A45',
  textMutedLight: '#6E6A78',
  borderLight: '#E6E2ED',

  // Neutrals — dark mode
  bgDark: '#171522',
  surfaceDark: '#221F30',
  textDark: '#EDEAF2',
  textMutedDark: '#A9A4B8',
  borderDark: '#332E44',

  // Status colors (shared across modes, tuned per-mode below)
  successLight: '#5FAE7A',
  successDark: '#8FD1A6',
  warningLight: '#D4A94A',
  warningDark: '#E8C374',
  errorLight: '#D9534F',
  errorDark: '#E8837F',

  // Transaction colours
  creditLight: '#5FAE7A',
  creditDark: '#6fda94',
  debitLight: '#D9534F',
  debitDark: '#f2605b',
  transferLight: '#4A90D4',
  transferDark: '#65b3fb',

  // Static
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
};

// ---------------------------------------------------------------------------
// 2. Semantic theme objects
// ---------------------------------------------------------------------------

export interface ThemeColors {
  background: string;
  surface: string;
  surfaceElevated: string;
  text: string;
  textMuted: string;
  border: string;

  primary: string;
  primaryText: string;
  accent: string;
  accentText: string;

  success: string;
  warning: string;
  error: string;

  credit: string;
  debit: string;
  transfer: string;

  disabled: string;
  overlay: string;
  transparent: string;
}

export interface Theme {
  mode: 'light' | 'dark';
  colors: ThemeColors;
}

export const lightTheme: Theme = {
  mode: 'light',
  colors: {
    background: palette.bgLight,
    surface: palette.surfaceLight,
    surfaceElevated: palette.white,
    text: palette.textLight,
    textMuted: palette.textMutedLight,
    border: palette.borderLight,

    primary: palette.lavender,
    primaryText: palette.white,
    accent: palette.mint,
    accentText: palette.white,

    success: palette.successLight,
    warning: palette.warningLight,
    error: palette.errorLight,

    credit: palette.creditLight,
    debit: palette.debitLight,
    transfer: palette.transferLight,

    disabled: '#D8D5DE',
    overlay: 'rgba(61, 58, 69, 0.4)',
    transparent: palette.transparent,
  },
};

export const darkTheme: Theme = {
  mode: 'dark',
  colors: {
    background: palette.bgDark,
    surface: palette.surfaceDark,
    surfaceElevated: '#2B2739',
    text: palette.textDark,
    textMuted: palette.textMutedDark,
    border: palette.borderDark,

    primary: palette.lavenderLight,
    primaryText: palette.bgDark,
    accent: palette.mintLight,
    accentText: palette.bgDark,

    success: palette.successDark,
    warning: palette.warningDark,
    error: palette.errorDark,

    credit: palette.creditDark,
    debit: palette.debitDark,
    transfer: palette.transferDark,

    disabled: '#3D3850',
    overlay: 'rgba(0, 0, 0, 0.6)',
    transparent: 'rgba(0,0,0,0.2)',
  },
};

// ---------------------------------------------------------------------------
// 3. Shared design tokens (spacing, radius, typography, shadows)
//    These stay constant across light/dark — only colors change.
// ---------------------------------------------------------------------------

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const radius = {
  sm: 6,
  md: 12,
  lg: 20,
  full: 999,
};

export const typography = {
  fontFamily: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
  },
  size: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 20,
    xl: 24,
    xxl: 32,
  },
  weight: {
    regular: '400' as const,
    medium: '500' as const,
    bold: '700' as const,
  },
};

export const shadow = {
  light: {
    shadowColor: palette.black,
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  dark: {
    shadowColor: palette.black,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
};

// ---------------------------------------------------------------------------
// 4. Hook — pulls theme based on system color scheme
// ---------------------------------------------------------------------------

export function useTheme(): Theme {
  const scheme = useColorScheme();
  return scheme === 'dark' ? darkTheme : lightTheme;
}

// ---------------------------------------------------------------------------
// 5. Usage example
// ---------------------------------------------------------------------------
//
// import { useTheme, spacing, radius, typography } from './theme';
//
// function Card() {
//   const theme = useTheme();
//   return (
//     <View
//       style={{
//         backgroundColor: theme.colors.surface,
//         borderRadius: radius.md,
//         padding: spacing.md,
//         borderWidth: 1,
//         borderColor: theme.colors.border,
//       }}
//     >
//       <Text style={{ color: theme.colors.text, fontSize: typography.size.md }}>
//         Hello
//       </Text>
//     </View>
//   );
// }