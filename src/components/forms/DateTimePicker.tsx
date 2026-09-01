// components/forms/DateTimePicker.tsx
import { HourFormat } from "@/components/datetime/Clock";
import DateSelector, { DateFormat, formatDate, parseFormat, toISODateString } from '@/components/datetime/DateSelector';
import TimeSelector, { formatTime, TimeValue, toTimeStorageString } from '@/components/datetime/TimeSelector';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { useAmountInputStyles } from '@/styles/componentStyle';
import { useGlobalStyles } from '@/styles/global';
import { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import MainButton from '../ui/MainButton';

type DateTimePickerProps = {
    /** Controlled initial value, "yyyy-mm-ddTHH:MM" (24h, no timezone). */
    value?: string;
    /** Fired after either drawer is confirmed, with the composed "yyyy-mm-ddTHH:MM". */
    onChange?: (isoDateTime: string) => void;
    minDate?: Date;
    maxDate?: Date;
};

// Constant for now — promote to props later if per-instance formats are needed.
const DATE_FORMAT: DateFormat = 'DD/MonthName/YYYY';
const TIME_FORMAT: HourFormat = '12h';

function pad2(n: number): string {
    return n < 10 ? `0${n}` : `${n}`;
}

function parseStorageDateTime(iso?: string): Date {
    if (!iso) return new Date();
    const [datePart, timePart] = iso.split('T');
    const [y, m, d] = datePart.split('-').map(Number);
    const [hh, mm] = (timePart ?? '00:00').split(':').map(Number);
    return new Date(y, m - 1, d, hh, mm);
}

function toStorageString(d: Date): string {
    return `${toISODateString(d)}T${toTimeStorageString({ hour: d.getHours(), minute: d.getMinutes() })}`;
}

export function DateTimePicker({ value, onChange, minDate, maxDate }: DateTimePickerProps) {
    const { theme } = useGlobalStyles();
    const styles = useAmountInputStyles();

    const { tokens, seps } = useMemo(() => parseFormat(DATE_FORMAT), []);

    // Single source of truth — a full Date carrying both the committed date
    // and time-of-day. Neither drawer can touch this except via its own
    // Cancel/Confirm flow.
    const [committed, setCommitted] = useState<Date>(() => parseStorageDateTime(value));

    const [showDateSheet, setShowDateSheet] = useState(false);
    const [pendingDate, setPendingDate] = useState<Date>(committed);

    const [showTimeSheet, setShowTimeSheet] = useState(false);
    const [pendingTime, setPendingTime] = useState<TimeValue>({
        hour: committed.getHours(),
        minute: committed.getMinutes(),
    });

    function openDateSheet() {
        setPendingDate(committed);
        setShowDateSheet(true);
    }

    function cancelDate() {
        setShowDateSheet(false); // pendingDate discarded, committed untouched
    }

    function confirmDate() {
        // Merge the picked calendar date with the existing time-of-day —
        // DateSelector's Date always has its time zeroed out.
        const next = new Date(committed);
        next.setFullYear(pendingDate.getFullYear(), pendingDate.getMonth(), pendingDate.getDate());
        setCommitted(next);
        onChange?.(toStorageString(next));
        setShowDateSheet(false);
    }

    function openTimeSheet() {
        setPendingTime({ hour: committed.getHours(), minute: committed.getMinutes() });
        setShowTimeSheet(true);
    }

    function cancelTime() {
        setShowTimeSheet(false); // pendingTime discarded, committed untouched
    }

    function confirmTime() {
        const next = new Date(committed);
        next.setHours(pendingTime.hour, pendingTime.minute, 0, 0);
        setCommitted(next);
        onChange?.(toStorageString(next));
        setShowTimeSheet(false);
    }

    const dateLabel = formatDate(committed, tokens, seps);
    const timeLabel = formatTime({ hour: committed.getHours(), minute: committed.getMinutes() }, TIME_FORMAT);

    return (
        <View style={styles.trasparentContainer}>
            <View style={{ flexDirection: 'row', gap: 12 }}>
                <Pressable
                    onPress={openDateSheet}
                    style={styles.currencyButton}
                    accessibilityLabel={`Date ${dateLabel}`}
                >
                    <Text style={{ color: theme.colors.text }}>{dateLabel}</Text>
                </Pressable>

                <Pressable
                    onPress={openTimeSheet}
                    style={styles.currencyButton}
                    accessibilityLabel={`Time ${timeLabel}`}
                >
                    <Text style={{ color: theme.colors.text }}>{timeLabel}</Text>
                </Pressable>
            </View>

            <BottomSheet visible={showDateSheet} onClose={cancelDate}>
                <DateSelector
                    value={pendingDate}
                    format={DATE_FORMAT}
                    onChange={(d) => setPendingDate(d)}
                    minDate={minDate}
                    maxDate={maxDate}
                />
                <View style={{ flexDirection: 'row', marginTop: 16, gap: 12 }}>
                    <MainButton title="Cancel" type="basic" onClick={cancelDate} />
                    <MainButton title="Select Date" type="save" onClick={confirmDate} />
                </View>
            </BottomSheet>

            <BottomSheet visible={showTimeSheet} onClose={cancelTime}>
                <TimeSelector
                    value={pendingTime}
                    format={TIME_FORMAT}
                    onChange={(t) => setPendingTime(t)}
                />
                <View style={{ flexDirection: 'row', marginTop: 16, gap: 12 }}>
                    <MainButton title="Cancel" type="basic" onClick={cancelTime} />
                    <MainButton title="Select Time" type="save" onClick={confirmTime} />
                </View>
            </BottomSheet>
        </View>
    );
}
