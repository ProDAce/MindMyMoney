import { useGlobalStyles } from "@/styles/global";
import { ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Dashboard() {
    const { theme, styles } = useGlobalStyles();
    const insets = useSafeAreaInsets();
    const renderTest = () => {
        return (
            <>
                {Array.from({ length: 10 }, (_, index) => (
                    <View key={index} style={styles.card}>
                        <Text style={{ color: theme.colors.text }}>Card {index + 1}</Text>
                    </View>
                ))}
            </>
        );
    };
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Dashboard page</Text>
            <ScrollView
                // style={styles.container}
                // contentContainerStyle={{
                //     paddingBottom: insets.bottom + 40,
                // }}
            >

                {renderTest()}
            </ScrollView>
        </View>

    );
}
