import { useBottomSheetStyles } from '@/styles/componentStyle';
import { Modal, Pressable, View } from 'react-native';

type BottomSheetProps = {
    visible: boolean;
    onClose: () => void;
    children: React.ReactNode;
};

export function BottomSheet({ visible, onClose, children }: BottomSheetProps) {
    const styles = useBottomSheetStyles();

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <Pressable style={styles.backdrop} onPress={onClose}>
                <Pressable onPress={(e) => e.stopPropagation()}>
                    <View style={styles.sheet}>
                        <View style={styles.handle} />
                        <View style={styles.content}>{children}</View>
                    </View>
                </Pressable>
            </Pressable>
        </Modal>
    );
}