import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    Alert,
    ImageBackground,
    StyleSheet,
    Text,
    TextInput,
} from "react-native";
import { login } from "../api/api_service"; // Import the login function from API
import CustomButton from "../components/CustomButton";

export default function LoginScreen() {
    const router = useRouter();
    const [username, setUsername] = useState<string>("");
    const [password, setPassword] = useState<string>("");

    const handleLogin = async () => {
        try {
            const response = await login(username, password);
            if (response.uid) {
                // Navigate to the home screen after login
                router.push("/warning_screen");
            } else {
                Alert.alert(
                    "Login Failed",
                    response.error || "Unknown error occurred"
                );
            }
        } catch (error) {
            Alert.alert("Login Failed", error.message);
        }
    };

    return (
        <ImageBackground
            source={require("../assets/images/running.jpg")} // Update the path to your image
            style={styles.background}
            resizeMode="cover"
        >
            <BlurView intensity={50} style={styles.blurContainer}>
                <Text style={styles.title}>Login</Text>

                <Text style={styles.inputTitle}>Username:</Text>
                <TextInput
                    style={styles.input}
                    value={username}
                    onChangeText={setUsername}
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
