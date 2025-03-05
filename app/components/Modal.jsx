import React from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const CustomModal = ({ visible, onClose, message, onConfirm }) => {
    return (
        <Modal visible={visible} transparent={true} animationType="slide">
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalText}>{message}</Text>
                    <TouchableOpacity onPress={onConfirm} style={styles.button}>
                        <Text style={styles.buttonText}>Yes</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={onClose} style={styles.button}>
                        <Text style={styles.buttonText}>No</Text>
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
    modalText: {
        marginBottom: 20,
        textAlign: "center",
    },
    button: {
        marginVertical: 10,
        padding: 10,
        backgroundColor: "#007BFF",
        borderRadius: 5,
    },
    buttonText: {
        color: "white",
    },
});

export default CustomModal;
