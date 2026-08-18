// app/transaction/new.tsx
import { useGlobalStyles } from "@/styles/global";
import { Text, View } from "react-native";

export default function AddNew() {
    const { styles } = useGlobalStyles();

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Add New</Text>
        </View>
    );
}