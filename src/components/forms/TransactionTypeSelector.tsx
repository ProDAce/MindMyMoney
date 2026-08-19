import { TXN_TYPES, TransactionType } from '@/constants/transactionTypes';
import { useTransactionTypeSelectorStyle } from '@/styles/componentStyle';
import { useGlobalStyles } from '@/styles/global';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { Pressable, Text, View } from 'react-native';

interface TransactionTypeSelectorProps {
  value: TransactionType;
  onChange: (value: TransactionType) => void;
}

export function TransactionTypeSelector({ value, onChange }: TransactionTypeSelectorProps) {
  const { theme } = useGlobalStyles();
  const styles = useTransactionTypeSelectorStyle();

  // Color per type — pulled from theme so it stays theme-aware (light/dark)
  const colorFor = (type: TransactionType) => {
    switch (type) {
      case 'debit':
        return theme.colors.debit;
      case 'credit':
        return theme.colors.credit;
      case 'transfer':
        return theme.colors.transfer;
    }
  };

  return (
    <View style={styles.segmentContainer}>
      {TXN_TYPES.map((item, index) => {
        const isSelected = value === item.value;
        return (
          <Pressable
            key={item.value}
            onPress={() => onChange(item.value)}
            style={[
              styles.segment,
              index !== TXN_TYPES.length - 1 && styles.segmentBorder,
              isSelected && { backgroundColor: colorFor(item.value) },
            ]}
          >
            <Ionicons
              name={item.icon}
              size={18}
              color={isSelected ? theme.colors.primaryText : theme.colors.text}
            />
            <Text
              style={
                isSelected
                  ? styles.segmentTextSelected
                  : styles.segmentText
              }
            >
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}