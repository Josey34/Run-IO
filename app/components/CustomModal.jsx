import React from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const CustomModal = ({ visible, onClose, message, onConfirm }) => {
    return (
        <Modal visible={visible} transparent={true} animationType="slide">
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalMessage}>{message}</Text>
                    <TouchableOpacity
                        style={styles.confirmButton}
                        onPress={onConfirm}
                    >
                        <Text style={styles.buttonText}>OK</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modalContent: {
        width: 300,
        padding: 20,
        backgroundColor: "white",
        borderRadius: 10,
        alignItems: "center",
    },
    modalMessage: {
        marginBottom: 20,
        textAlign: "center",
    },
    confirmButton: {
        backgroundColor: "#000000",
        padding: 10,
        borderRadius: 5,
    },
    buttonText: {
        color: "#FFFFFF",
        fontWeight: "bold",
    },
});

export default CustomModal;
