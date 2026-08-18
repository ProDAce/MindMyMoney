import Header from "@/components/ui/header";
import { useGlobalStyles } from "@/styles/global";
import { ScrollView } from "react-native";

export default function Transactions() {
    const { theme, styles } = useGlobalStyles();
    return (
        <ScrollView style={styles.container}>
            <Header showButton="menu" title="Transactions" />
        </ScrollView>
    );
}
