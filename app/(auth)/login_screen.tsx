import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ImageBackground, StyleSheet, Text, TextInput } from "react-native";
import { checkUserFormData, ErrorModalEmitter } from "../api/api_service";
import CustomButton from "../components/CustomButton";
import { useAuth } from "../hooks/useAuth";

export default function LoginScreen() {
    const router = useRouter();
    const { loginUser } = useAuth();
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async () => {
        if (isLoading) return;

        setIsLoading(true);
        try {
            // Login the user
            const userData = await loginUser(email, password);

            // Check if user has already submitted form data
            const hasFormData = await checkUserFormData(userData.uid);

            if (hasFormData) {
                // If user has already submitted form data, go directly to home
                router.replace("/(home)");
            } else {
                // If no form data exists, go to warning screen
                router.replace("/(auth)/warning_screen");
            }
        } catch (error: any) {
            ErrorModalEmitter.emit("SHOW_ERROR", error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ImageBackground
            source={require("../assets/images/running.jpg")}
            style={styles.background}
            resizeMode="cover"
        >
            <BlurView intensity={50} style={styles.blurContainer}>
                <Text style={styles.title}>Login</Text>

                <Text style={styles.inputTitle}>Email:</Text>
                <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                />

                <Text style={styles.inputTitle}>Password:</Text>
                <TextInput
                    style={styles.input}
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                />
                <Text style={styles.registerText}>
                    Don't have an account?{" "}
                    <Text
                        style={styles.registerLink}
                        onPress={() => router.push("/register_screen")}
                    >
                        Register Now
                    </Text>
                </Text>
                <CustomButton title="Login" onPress={handleLogin} />
            </BlurView>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    background: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    blurContainer: {
        padding: 20,
        borderRadius: 10,
        width: "90%",
        alignItems: "center",
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 20,
        color: "black",
    },
    inputTitle: {
        alignSelf: "flex-start",
        marginBottom: 5,
        color: "black",
    },
    input: {
        width: "100%",
        padding: 10,
        borderRadius: 5,
        backgroundColor: "rgba(255, 255, 255, 0.8)",
        marginBottom: 15,
    },
    registerText: {
        alignSelf: "flex-start",
        color: "black",
    },
    registerLink: {
        color: "#007bff",
        fontWeight: "bold",
    },
});
