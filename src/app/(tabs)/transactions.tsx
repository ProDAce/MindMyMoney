import { useGlobalStyles } from "@/styles/global";
import { ScrollView, Text } from "react-native";

export default function Transactions() {
    const { theme, styles } = useGlobalStyles();
    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Transactions page</Text>
        </ScrollView>
    );
}
