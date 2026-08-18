// app/(tabs)/add.tsx
import { Redirect } from 'expo-router';
export default function AddTab() {
    // Never actually rendered — tabPress is intercepted below.
    // This exists only so the router has a file to satisfy the tab.
    return <Redirect href="/" />;
}