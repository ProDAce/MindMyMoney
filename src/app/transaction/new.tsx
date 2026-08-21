// app/transaction/new.tsx
import { AmountInput } from '@/components/forms/AmountInput';
import { DateTimePicker } from '@/components/forms/DateTimePicker';
import { TransactionTypeSelector } from '@/components/forms/TransactionTypeSelector';
import Header from '@/components/ui/header';
import { CURRENCIES, Currency } from '@/constants/currencies';
import { TransactionType } from '@/constants/transactionTypes';
import { useGlobalStyles } from "@/styles/global";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AddNew() {
    const { globalStyles, theme } = useGlobalStyles();
    const [type, setType] = useState<TransactionType>('debit');
    const [amount, setAmount] = useState('');
    const [currency, setCurrency] = useState<Currency>(CURRENCIES[0]);

    const renderTest = () => {
        return (
            <>
                {Array.from({ length: 10 }, (_, index) => (
                    <View key={index} style={globalStyles.card}>
                        <Text style={{ color: theme.colors.text }}>Card {index + 1}</Text>
                    </View>
                ))}
            </>
        );
    };

    return (
        <SafeAreaView style={globalStyles.body} edges={['bottom']}>

            <Header showButton="back" title="Add Transaction" />
            <ScrollView style={globalStyles.container}>
                <TransactionTypeSelector value={type} onChange={setType} />
                <KeyboardAvoidingView
                    style={globalStyles.container}
                    behavior={Platform.OS === "ios" ? "padding" : undefined}
                >
                    <AmountInput
                        amount={amount}
                        onChangeAmount={setAmount}
                        currency={currency}
                        onChangeCurrency={setCurrency}
                    />
                    <DateTimePicker />
                </KeyboardAvoidingView>
                {renderTest()}
            </ScrollView>
        </SafeAreaView>
    );
}