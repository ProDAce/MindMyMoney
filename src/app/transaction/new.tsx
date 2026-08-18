// app/transaction/new.tsx
import Header from '@/components/ui/header';
import { useGlobalStyles } from "@/styles/global";
import { View } from "react-native";

export default function AddNew() {
    const { styles } = useGlobalStyles();

    return (
        <View style={styles.container}>
            <Header showButton="back" title="Add Transaction" />
        </View>
    );
}