import React from "react";
import {
    Animated,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

interface ErrorModalProps {
    visible: boolean;
    errorMessage: string;
    onClose: () => void;
}

const ErrorModal: React.FC<ErrorModalProps> = ({
    visible,
    errorMessage,
    onClose,
}) => {
    const fadeAnim = React.useRef(new Animated.Value(0)).current;

    React.useEffect(() => {
        if (visible) {
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
            }).start();
        } else {
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 400,
                useNativeDriver: true,
            }).start();
        }
    }, [visible, fadeAnim]);

    return (
        <Modal
            animationType="none"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <Animated.View style={[styles.centeredView, { opacity: fadeAnim }]}>
                <View style={styles.modalView}>
                    <Text style={styles.modalText}>{errorMessage}</Text>
                    <TouchableOpacity style={styles.button} onPress={onClose}>
                        <Text style={styles.buttonText}>Close</Text>
                    </TouchableOpacity>
                </View>
            </Animated.View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.5)",
    },
    modalView: {
        margin: 20,
        backgroundColor: "#EAEFEF",
        borderRadius: 20,
        padding: 35,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalText: {
        marginBottom: 15,
        textAlign: "center",
        fontSize: 16,
    },
    button: {
        borderRadius: 20,
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: "#7F8CAA",
    },
    buttonText: {
        color: "#EAEFEF",
        fontSize: 16,
    },
});

export default ErrorModal;
