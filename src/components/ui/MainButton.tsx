import { useMainButtonStyle } from "@/styles/componentStyle";
import { useGlobalStyles } from "@/styles/global";
import { Text, TouchableOpacity } from "react-native";

type MainButtonProps = {
    title?: string;
    type: 'save' | 'cancel' | 'basic';
    onClick: () => void;
};

export default function MainButton({ title, type, onClick }: MainButtonProps) {
    const { theme } = useGlobalStyles();
    const style = useMainButtonStyle();

    function handleClick() {
        onClick();
    }

    function getButtonStyle() {
        if (type === 'save') {
            return { ...style.mainButton, backgroundColor: theme.colors.transfer };
        } else {
            return style.mainButton;
        }
    }
    function getButtonTextStyle() {
        if (type === 'save') {
            return style.mainButtonTextHighlight
        } else {
            return style.mainButtonTextBasic
        }
    }

    return (
        <TouchableOpacity
            onPress={handleClick}
            style={getButtonStyle()}
        >
            {/* {getButtonStyle()} */}
            <Text style={getButtonTextStyle()}>
                {title}
            </Text>
        </TouchableOpacity>
    )
}