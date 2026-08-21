import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { Theme, useTheme } from './theme';

export const createGlobalStyles = (theme: Theme) =>
  StyleSheet.create({
    body: {
      flex: 1,
      backgroundColor: theme.colors.background,
      padding: 0,
      margin: 0,
    },
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      padding: 8,
      margin: 0,
      // paddingHorizontal: spacing.md, // 20 → use spacing.md (16) or spacing.lg (24) if you want exact 20, hardcode it
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: theme.colors.text,
    },
    card: {
      margin: 10,
      padding: 20,
      borderWidth: 1,
      borderRadius: 8,
      borderColor: theme.colors.border
    },
  });

// Combined hook — one call instead of useTheme() + createGlobalStyles() every screen.
// Memoized so styles only recompute when the theme (light/dark) actually changes.
export const useGlobalStyles = () => {
  const theme = useTheme();
  const globalStyles = useMemo(() => createGlobalStyles(theme), [theme]);
  return { theme, globalStyles };
};

// ---------------------------------------------------------------------------
// Usage in a component
// ---------------------------------------------------------------------------
//
// import { useGlobalStyles } from '@/styles/global';
//
// function Screen() {
//   const { theme, styles } = useGlobalStyles();
//
//   return <View style={styles.container}>...</View>;
// }

// ---------------------------------------------------------------------------
// Usage in a component
// ---------------------------------------------------------------------------
//
// import { useTheme } from './theme';
// import { createGlobalStyles } from './globalStyles';
//
// function Screen() {
//   const theme = useTheme();
//   const styles = createGlobalStyles(theme);
//
//   return <View style={styles.container}>...</View>;
// }