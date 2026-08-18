import { useGlobalStyles } from "@/styles/global";
import { ScrollView, Text } from "react-native";

export default function Budgets() {
    const {theme, styles} = useGlobalStyles();
    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Budget Page</Text>
        </ScrollView>
    );
}
