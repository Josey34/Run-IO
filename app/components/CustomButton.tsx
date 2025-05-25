import React from "react";
import {
    ActivityIndicator,
    StyleProp,
    StyleSheet,
    Text,
    TouchableOpacity,
    ViewStyle,
} from "react-native";

interface CustomButtonProps {
    title: string;
    onPress: () => void;
    style?: StyleProp<ViewStyle>;
    disabled?: boolean;
    isLoading?: boolean;
}

const CustomButton: React.FC<CustomButtonProps> = ({
    title,
    onPress,
    style,
    disabled = false,
    isLoading = false,
}) => {
    return (
        <TouchableOpacity
            style={[
                styles.button,
                (disabled || isLoading) && styles.buttonDisabled,
                style,
            ]}
            onPress={onPress}
            disabled={disabled || isLoading}
        >
            {isLoading ? (
                <ActivityIndicator color="#666666" />
            ) : (
                <Text
                    style={[
                        styles.buttonText,
                        disabled && styles.buttonTextDisabled,
                    ]}
                >
                    {title}
                </Text>
            )}
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
    buttonDisabled: {
        backgroundColor: "#CCCCCC",
        opacity: 0.7,
    },
    buttonText: {
        color: "#000000",
        fontSize: 16,
        fontWeight: "bold",
    },
    buttonTextDisabled: {
        color: "#666666",
    },
});

export default CustomButton;
