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
import CustomButton from "../components/CustomButton";
import CustomModal from "../components/CustomModal";
import { useAuth } from "../hooks/useAuth"; // Import the useAuth hook

export default function RegisterScreen() {
    const router = useRouter();
    const { registerUser } = useAuth(); // Destructure the registerUser function from useAuth
    const [username, setUsername] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [modalVisible, setModalVisible] = useState<boolean>(false);

    const handleRegister = async () => {
        try {
            await registerUser(email, password, username);
            setModalVisible(true);
        } catch (error: any) {
            Alert.alert("Registration Failed", error.message);
        }
    };

    return (
        <ImageBackground
            source={require("../assets/images/running.jpg")} // Update the path to your image
            style={styles.background}
            resizeMode="cover"
        >
            <BlurView intensity={50} style={styles.blurContainer}>
                <Text style={styles.title}>Register</Text>

                <Text style={styles.inputTitle}>Username:</Text>
                <TextInput
                    style={styles.input}
                    value={username}
                    onChangeText={setUsername}
                />

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

                <CustomButton title="Register" onPress={handleRegister} />
            </BlurView>
            <CustomModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                message="Registered Successfully!"
                onConfirm={() => {
                    setModalVisible(false);
                    router.push("/login_screen");
                }}
            />
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
});
