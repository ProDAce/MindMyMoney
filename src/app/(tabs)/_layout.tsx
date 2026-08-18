// app/(tabs)/_layout.tsx
import { useGlobalStyles } from "@/styles/global";
import Ionicons from '@react-native-vector-icons/ionicons';
import { Tabs, useRouter } from "expo-router";
import { PlatformPressable } from "expo-router/build/react-navigation";
import { StyleSheet, View } from "react-native";

export default function TabLayout() {
  const { theme, styles } = useGlobalStyles();
  const router = useRouter();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.background,
          borderTopColor: theme.colors.surfaceElevated,
          padding: 0,
          overflow: 'visible',
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.text,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, focused }) => (
            // <Ionicons name={focused ? "home" : "home-outline"} size={24} color={color} />
            <Ionicons name={focused ? "grid" : "grid-outline"} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          title: "Transactions",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "receipt" : "receipt-outline"} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: "+",
          tabBarShowLabel: false,  
          tabBarButton: (props) => (
            <PlatformPressable
              {...props}
              style={[props.style, customStyles.addButtonContainer]}
            >
              <View style={[customStyles.addButton, { backgroundColor: theme.colors.primary }]}>
                <Ionicons name="add" size={32} color={theme.colors.accentText} />
              </View>
            </PlatformPressable>
          ),
        }}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            router.push('/transaction/new');
          },
        }}
      />
      <Tabs.Screen
        name="budgets"
        options={{
          title: "Budget",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "calculator" : "calculator-outline"} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="accounts"
        options={{
          title: "Accounts",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "business" : "business-outline"} size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const customStyles = StyleSheet.create({
  addButtonContainer: {
    top: -20, // Offsets the button vertically above the tab bar top border
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    // // Elevation & Shadows for depth over the tab bar
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.5,
  },
});