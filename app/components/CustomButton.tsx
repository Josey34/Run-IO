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
    testID?: string;
}

const CustomButton: React.FC<CustomButtonProps> = ({
    title,
    onPress,
    style,
    disabled = false,
    isLoading = false,
    testID,
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
            testID={testID}
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
        backgroundColor: "#7F8CAA",
        height: 51,
        padding: 10,
        borderRadius: 15,
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        marginTop: 20,
    },
    buttonDisabled: {
        backgroundColor: "#B8CFCE",
        opacity: 0.7,
    },
    buttonText: {
        color: "#EAEFEF",
        fontSize: 16,
        fontWeight: "bold",
    },
    buttonTextDisabled: {
        color: "#333446",
    },
});

export default CustomButton;
