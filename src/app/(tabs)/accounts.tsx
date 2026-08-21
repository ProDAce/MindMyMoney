import Header from "@/components/ui/header";
import { useGlobalStyles } from "@/styles/global";
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import { useState } from "react";
import { ScrollView } from "react-native";

export default function Accounts() {
    const { theme, globalStyles } = useGlobalStyles();

    const [calendarCursor, setCalendarCursor] = useState<Date>(new Date());
    
    const handleCursor = (v: any) => {
        setCalendarCursor(v)
    }

    
    return (
        <ScrollView style={globalStyles.container}>
            <Header showButton="menu" title="Account" />
            <MaterialDesignIcons name="bank" size={24} color={theme.colors.primary} />
            {/* <CalendarPanel cursor={calendarCursor} setCursor={handleCursor} selected={calendarCursor} /> */}
        </ScrollView>
    );
}
