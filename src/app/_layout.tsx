// app/_layout.tsx
import { useGlobalStyles } from '@/styles/global';
import { ThemeProvider } from '@/styles/ThemeContext';
import { Stack } from "expo-router";
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RootLayout() {
    const { theme, globalStyles } = useGlobalStyles();
  
  return (
    <ThemeProvider>
      <SafeAreaView style={globalStyles.body} edges={['top', 'left', 'right']}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="transaction/new"
          options={{ presentation: 'modal', headerShown: false, title: 'Add Transaction' }}
        />
      </Stack >
      </SafeAreaView>
    </ThemeProvider>

  );
}
