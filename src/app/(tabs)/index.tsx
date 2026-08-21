import Header from "@/components/ui/header";
import { useGlobalStyles } from "@/styles/global";
import Constants from 'expo-constants';
import { ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";


export default function Dashboard() {
    const { theme, globalStyles } = useGlobalStyles();
    const appName = Constants.expoConfig?.name;

    const insets = useSafeAreaInsets();
    const renderTest = () => {
        return (
            <>
                {Array.from({ length: 10 }, (_, index) => (
                    <View key={index} style={globalStyles.card}>
                        <Text style={{ color: theme.colors.text }}>Card {index + 1}</Text>
                    </View>
                ))}
            </>
        );
    };
    return (
        <View style={globalStyles.container}>
            <Header showButton="menu" title={appName} />
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
