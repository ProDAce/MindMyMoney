// components/ui/Header.tsx
import { useHeaderStyles } from '@/styles/componentStyle';
import { useGlobalStyles } from '@/styles/global';
import { Ionicons, IoniconsIconName } from '@react-native-vector-icons/ionicons';
import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

export type HeaderAction = {
    icon: IoniconsIconName;
    onPress: () => void;
    accessibilityLabel: string;
};

type HeaderProps = {
    title?: string;
    showButton?: 'back' | 'menu';
    onLeftPress?: () => void;
    rightActions?: HeaderAction[];
};

export default function Header({
    title,
    showButton,
    onLeftPress,
    rightActions = [],
}: HeaderProps) {
    const { theme, globalStyles } = useGlobalStyles();
    const headerStyles = useHeaderStyles();
    const router = useRouter();

    const handleLeftPress = () => {
        if (onLeftPress) {
            onLeftPress();
            return;
        }
        if (showButton === 'back') {
            router.back();
        }
        // 'menu' with no onLeftPress passed is a no-op — caller is expected
        // to supply navigation.openDrawer() from the screen, since Header
        // itself has no knowledge of the drawer.
    };

    return (
        <View style={headerStyles.headerContainer}>
            <View style={headerStyles.headerLeft}>
                {showButton && (
                    <Pressable
                        onPress={handleLeftPress}
                        hitSlop={12}
                        accessibilityLabel={showButton === 'back' ? 'Go back' : 'Open menu'}
                    >
                        <Ionicons
                            name={showButton === 'back' ? 'chevron-back' : 'menu'}
                            size={24}
                            color={theme.colors.text}
                        />
                    </Pressable>
                )}
            </View>

            <View style={headerStyles.headerCenter}>
                {title && (
                    <Text style={headerStyles.headerTitle} numberOfLines={1}>
                        {title}
                    </Text>
                )}
            </View>

            <View style={headerStyles.headerRight}>
                {rightActions.map((action, index) => (
                    <Pressable
                        key={index}
                        onPress={action.onPress}
                        hitSlop={12}
                        accessibilityLabel={action.accessibilityLabel}
                        style={headerStyles.headerRightIcon}
                    >
                        <Ionicons name={action.icon} size={22} color={theme.colors.text} />
                    </Pressable>
                ))}
            </View>
        </View>
    );
}