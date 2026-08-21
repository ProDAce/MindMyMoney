// components/forms/DateTimePicker.tsx
import DateSelector, { formatDate, parseFormat } from '@/components/datetime/DateSelector';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Currency } from '@/constants/currencies';
import { useAmountInputStyles } from '@/styles/componentStyle';
import { useGlobalStyles } from '@/styles/global';
import { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import MainButton from '../ui/MainButton';

type DateTimePickerProps = {
    date?: string;
    onChangeDate?: (value: any) => void;
    time?: Currency;
    onChangeCurrency?: (currency: Currency) => void;
};

const DATE_FORMAT = 'DD/MonthName/YYYY';

export function DateTimePicker({
    date,
    onChangeDate,
    time,
    onChangeCurrency
}: DateTimePickerProps) {
    const {theme, globalStyles} = useGlobalStyles();
    const styles = useAmountInputStyles();
    const [showDateSelector, setShowDateSelector] = useState(false);

    // Committed value — what's shown on the trigger, unaffected by Cancel.
    const [getD, setD] = useState(new Date());
    // Local, uncommitted preview — DateSelector writes here while the sheet
    // is open; it's only copied into getD when "Select Date" is tapped.
    const [pending, setPending] = useState(getD);

    const { tokens, seps } = useMemo(() => parseFormat(DATE_FORMAT), []);

    function openSheet() {
        setPending(getD); // start each session from the last committed value
        setShowDateSelector(true);
    }

    function handleCancel() {
        setShowDateSelector(false); // pending is discarded, getD is untouched
    }

    function handleConfirm() {
        setD(pending);
        onChangeDate?.(formatDate(pending, tokens, seps));
        setShowDateSelector(false);
    }

    return (
        <View style={styles.trasparentContainer}>
            <Pressable
                onPress={openSheet}
                style={styles.currencyButton}
                accessibilityLabel={`Date ${formatDate(getD, tokens, seps)}`}
            >
                <Text style={{color: theme.colors.text}}>{formatDate(getD, tokens, seps)}</Text>
            </Pressable>

            <BottomSheet visible={showDateSelector} onClose={handleCancel}>
                <DateSelector
                    value={pending}
                    format={DATE_FORMAT}
                    onChange={(d) => setPending(d)}
                />

                <View
                    style={{
                        flexDirection: 'row',
                        marginTop: 16,
                        gap: 12,
                    }}
                >
                    <MainButton title='Cancel' type='basic' onClick={handleCancel} />
                    <MainButton title='Select Date' type='save' onClick={handleConfirm} />
                </View>
            </BottomSheet>
        </View>
    );
}