import { useMemo } from 'react';
import { Dimensions, StyleSheet } from 'react-native';
import { Theme, radius, spacing, typography, useTheme } from './theme';

const SCREEN_HEIGHT = Dimensions.get('window').height;

// ---------------------------------------------------------------------------
// Header
// ---------------------------------------------------------------------------

const createHeaderStyles = (theme: Theme) =>
  StyleSheet.create({
    headerContainer: {
      position: 'sticky',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: 56,
      paddingHorizontal: spacing.md,
      backgroundColor: theme.colors.background,
      // borderBottomWidth: 1,
      // borderBottomColor: theme.colors.border,
    },
    // Fixed-width side slots so headerCenter stays visually centered
    // regardless of whether left/right content is present.
    headerLeft: {
      minWidth: 40,
      alignItems: 'flex-start',
      justifyContent: 'center',
    },
    headerCenter: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: spacing.sm,
    },
    headerRight: {
      minWidth: 40,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: spacing.sm,
    },
    headerTitle: {
      fontSize: typography.size.lg,
      fontWeight: typography.weight.bold,
      color: theme.colors.text,
    },
    headerRightIcon: {
      padding: spacing.xs,
      borderRadius: radius.sm,
    },
  });

export const useHeaderStyles = () => {
  const theme = useTheme();
  return useMemo(() => createHeaderStyles(theme), [theme]);
};

// ---------------------------------------------------------------------------
// Transaction type buttons (segmented control)
// ---------------------------------------------------------------------------

const createTransactionTypeSelectorStyle = (theme: Theme) =>
  StyleSheet.create({
    segmentContainer: {
      flexDirection: 'row',
      // borderRadius: radius.md,
      // borderWidth: 1,
      // borderColor: theme.colors.border,
      overflow: 'hidden', // clips children to the rounded outer corners
    },
    segment: {
      margin: 8,
      flex: 1, // all three divide the row width evenly
      flexDirection: 'row', // icon + label side by side
      justifyContent: 'center',
      alignItems: 'center',
      gap: spacing.xs,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.sm,
      borderRadius: 20,
      backgroundColor: theme.colors.surface,
    },
    // segmentSelected: {
    //   backgroundColor: theme.colors.primary,
    // },
    segmentBorder: {
      borderRightWidth: 1,
      borderRightColor: theme.colors.border,
    },
    segmentText: {
      fontSize: typography.size.sm,
      fontWeight: typography.weight.medium,
      color: theme.colors.text,
    },
    segmentTextSelected: {
      fontSize: typography.size.sm,
      fontWeight: typography.weight.medium,
      color: theme.colors.primaryText,
    },
  });

export const useTransactionTypeSelectorStyle = () => {
  const theme = useTheme();
  return useMemo(() => createTransactionTypeSelectorStyle(theme), [theme]);
};

// ---------------------------------------------------------------------------
// Amount Input Field
// ---------------------------------------------------------------------------

const createAmountInputStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: radius.md,
      backgroundColor: theme.colors.surface,
      paddingHorizontal: spacing.sm,
      height: 56,
    },
    currencyButton: {
      display: 'flex',
      flexDirection: 'row',
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRightWidth: 1,
      borderRightColor: theme.colors.border,
      justifyContent: 'center',
      alignItems: 'center',
    },
    currencySymbol: {
      marginHorizontal: spacing.xs,
      fontSize: typography.size.lg,
      fontWeight: typography.weight.bold,
      color: theme.colors.primary,
    },
    amountInput: {
      flex: 1,
      fontSize: typography.size.xl,
      fontWeight: typography.weight.medium,
      color: theme.colors.text,
      paddingHorizontal: spacing.sm,
    },
    calculatorButton: {
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderLeftWidth: 1,
      borderLeftColor: theme.colors.border,
      justifyContent: 'center',
      alignItems: 'center',
    },
    trasparentContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      // borderWidth: 1,
      // borderColor: theme.colors.border,
      // borderRadius: radius.md,
      // backgroundColor: theme.colors.surface,
      paddingHorizontal: spacing.sm,
      height: 56,
    }
  });

export const useAmountInputStyles = () => {
  const theme = useTheme();
  return useMemo(() => createAmountInputStyles(theme), [theme]);
};

// ---------------------------------------------------------------------------
// Bottom Sheet
// ---------------------------------------------------------------------------

const createBottomSheetStyles = (theme: Theme) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: theme.colors.overlay,
      justifyContent: 'flex-end',
    },
    sheet: {
      flexDirection: 'column',
      maxHeight: Math.max(SCREEN_HEIGHT * 0.6,  600), // real pixel bound, not '%', so children can compute flex height
      backgroundColor: theme.colors.background,
      borderTopLeftRadius: radius.lg,
      borderTopRightRadius: radius.lg,
      paddingTop: spacing.sm,
      paddingHorizontal: spacing.md,
      paddingBottom: spacing.xl,
      overflow: 'hidden',
    },
    handle: {
      alignSelf: 'center',
      width: 40,
      height: 4,
      borderRadius: radius.full,
      backgroundColor: theme.colors.border,
      marginBottom: spacing.md,
    },
    // Wraps sheet content below the handle — flex:1 so it fills remaining
    // space within the bounded sheet height, letting scrollable children
    // (FlatList, ScrollView) size correctly instead of being clipped.
    content: {
      flexShrink: 1,
    },
  });

export const useBottomSheetStyles = () => {
  const theme = useTheme();
  return useMemo(() => createBottomSheetStyles(theme), [theme]);
};

const createCurrencyPickerStyles = (theme: Theme) =>
  StyleSheet.create({
    title: {
      fontSize: typography.size.lg,
      fontWeight: typography.weight.bold,
      color: theme.colors.text,
      marginBottom: spacing.md,
    },
    flatlist: {
      margin: 0,
      padding: 0,
      backgroundColor: '#00ff00'
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    rowSelected: {
      backgroundColor: theme.colors.surfaceElevated,
      borderRadius: radius.sm,
    },
    symbol: {
      fontSize: typography.size.lg,
      fontWeight: typography.weight.bold,
      color: theme.colors.primary,
      width: 36,
    },
    code: {
      fontSize: typography.size.md,
      color: theme.colors.text,
    },
  });

export const useCurrencyPickerStyles = () => {
  const theme = useTheme();
  return useMemo(() => createCurrencyPickerStyles(theme), [theme]);
};

const createMainButtonStyle = (theme: Theme) =>
  StyleSheet.create({
    mainButton: {
      flex: 1,
      height: 48,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    mainButtonTextBasic: {
      color: theme.colors.text, 
      fontSize: 16, 
      fontWeight: '600'
    },
    mainButtonTextHighlight: {
      color: theme.colors.accentText, 
      fontSize: 16, 
      fontWeight: '600'
    },
  });

export const useMainButtonStyle = () => {
  const theme = useTheme();
  return useMemo(() => createMainButtonStyle(theme), [theme]);
};

// ---------------------------------------------------------------------------
// Usage in a component
// ---------------------------------------------------------------------------
//
// import { useHeaderStyles } from '@/styles/componentStyles';
//
// function TransactionTypeButtons() {
//   const styles = useHeaderStyles();
//   const [selected, setSelected] = useState(0);
//
//   return (
//     <View style={styles.headerContainer}>
//       <View style={styles.headerLeft}>
//         <Text>Header</Text>
//       </View>
//     </View>
//   );
// }