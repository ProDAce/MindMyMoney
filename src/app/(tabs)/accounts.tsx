import { useGlobalStyles } from "@/styles/global";
import { ScrollView, Text } from "react-native";

export default function Accounts() {
    const {theme, styles} = useGlobalStyles();
    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Accounts Page</Text>
        </ScrollView>
    );
}
