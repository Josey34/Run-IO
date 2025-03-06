import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

const CustomButton = ({ title, onPress, style }: any) => {
    return (
        <TouchableOpacity style={[styles.button, style]} onPress={onPress}>
            <Text style={styles.buttonText}>{title}</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        backgroundColor: "#FFFFFF",
        height: 51,
        padding: 10,
        borderRadius: 15,
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        marginTop: 20,
    },
    buttonText: {
        color: "#000000",
        fontSize: 16,
        fontWeight: "bold",
    },
});

export default CustomButton;
