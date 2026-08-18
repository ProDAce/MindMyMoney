import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { Theme, radius, spacing, typography, useTheme } from './theme';

// ---------------------------------------------------------------------------
// Header
// ---------------------------------------------------------------------------

const createHeaderStyles = (theme: Theme) =>
  StyleSheet.create({
    headerContainer: {
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