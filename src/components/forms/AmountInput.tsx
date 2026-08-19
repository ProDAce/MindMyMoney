import { CurrencyPickerSheet } from '@/components/forms/CurrencyPickerSheet';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Currency } from '@/constants/currencies';
import { useAmountInputStyles } from '@/styles/componentStyle';
import { useTheme } from '@/styles/theme';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

type AmountInputProps = {
    amount: string;
    onChangeAmount: (value: string) => void;
    currency: Currency;
    onChangeCurrency: (currency: Currency) => void;
};

export function AmountInput({
    amount,
    onChangeAmount,
    currency,
    onChangeCurrency,
}: AmountInputProps) {
    const theme = useTheme();
    const styles = useAmountInputStyles();

    const [showCurrencySheet, setShowCurrencySheet] = useState(false);
    const [showCalculatorSheet, setShowCalculatorSheet] = useState(false);

    const handleSelectCurrency = (c: Currency) => {
        onChangeCurrency(c);
        setShowCurrencySheet(false);
    };

    const handleCalculatorSubmit = (value: string) => {
        onChangeAmount(value);
        setShowCalculatorSheet(false);
    };

    return (
        <View style={styles.container}>
            <Pressable
                onPress={() => setShowCurrencySheet(true)}
                style={styles.currencyButton}
                accessibilityLabel={`Currency: ${currency.code}. Tap to change.`}
            >
                <Text style={styles.currencySymbol}>{currency.code}</Text>
                <Text style={styles.currencySymbol}>{currency.symbol}</Text>
            </Pressable>

            <TextInput
                style={styles.amountInput}
                value={amount}
                onChangeText={onChangeAmount}
                placeholder="0.00"
                placeholderTextColor={theme.colors.textMuted}
                keyboardType="decimal-pad"
                inputMode="decimal"
            />

            <Pressable
                onPress={() => setShowCalculatorSheet(true)}
                style={styles.calculatorButton}
                accessibilityLabel="Open calculator"
                hitSlop={8}
            >
                <Ionicons name="calculator-outline" size={22} color={theme.colors.text} />
            </Pressable>

            <BottomSheet visible={showCurrencySheet} onClose={() => setShowCurrencySheet(false)}>
                <CurrencyPickerSheet selected={currency} onSelect={handleSelectCurrency} />
            </BottomSheet>

            <BottomSheet visible={showCalculatorSheet} onClose={() => setShowCalculatorSheet(false)}>
                <Text>Calculator</Text>
            </BottomSheet>
        </View>
    );
}