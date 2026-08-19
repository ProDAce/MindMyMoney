import { CURRENCIES, Currency } from '@/constants/currencies';
import { useCurrencyPickerStyles } from '@/styles/componentStyle';
import { useTheme } from '@/styles/theme';
import Ionicons from '@react-native-vector-icons/ionicons';
import { FlatList, Pressable, Text, View } from 'react-native';

type CurrencyPickerSheetProps = {
  selected: Currency;
  onSelect: (currency: Currency) => void;
};

// Content rendered inside a <BottomSheet>. Doesn't manage its own
// visibility — the parent (AmountInput) controls open/close.
export function CurrencyPickerSheet({ selected, onSelect }: CurrencyPickerSheetProps) {
  const theme = useTheme();
  const styles = useCurrencyPickerStyles();

  return (
    <View>
      <Text style={styles.title}>Select currency</Text>
      <FlatList
    //   style={styles.flatlist}
     style={{ flexGrow: 0 }}
        data={CURRENCIES}
        keyExtractor={(item) => item.code}
        renderItem={({ item }) => {
          const isSelected = item.code === selected.code;
          return (
            <Pressable
              onPress={() => onSelect(item)}
              style={[styles.row, isSelected && styles.rowSelected]}
            >
              <Text style={styles.symbol}>{item.symbol}</Text>
              <Text style={styles.code}>{item.code}</Text>
              {isSelected && (
                <Ionicons
                  name="checkmark"
                  size={20}
                  color={theme.colors.primary}
                  style={{ marginLeft: 'auto' }}
                />
              )}
            </Pressable>
          );
        }}
      />
    </View>
  );
}