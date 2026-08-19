// app/transaction/new.tsx
import { AmountInput } from '@/components/forms/AmountInput';
import { TransactionTypeSelector } from '@/components/forms/TransactionTypeSelector';
import Header from '@/components/ui/header';
import { CURRENCIES, Currency } from '@/constants/currencies';
import { TransactionType } from '@/constants/transactionTypes';
import { useGlobalStyles } from "@/styles/global";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from "react-native";

export default function AddNew() {
    const { styles, theme } = useGlobalStyles();
    const [type, setType] = useState<TransactionType>('debit');
    const [amount, setAmount] = useState('');
    const [currency, setCurrency] = useState<Currency>(CURRENCIES[0]);

    const renderTest = () => {
        return (
            <>
                {Array.from({ length: 10 }, (_, index) => (
                    <View key={index} style={styles.card}>
                        <Text style={{ color: theme.colors.text }}>Card {index + 1}</Text>
                    </View>
                ))}
            </>
        );
    };

    return (
        <ScrollView style={styles.container}>
            <Header showButton="back" title="Add Transaction" />
            <TransactionTypeSelector value={type} onChange={setType} />
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
                <AmountInput
                    amount={amount}
                    onChangeAmount={setAmount}
                    currency={currency}
                    onChangeCurrency={setCurrency}
                />
            </KeyboardAvoidingView>
            {renderTest()}
        </ScrollView>
    );
}