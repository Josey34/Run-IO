import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Button, Text, View } from "react-native";
import { useDispatch } from "react-redux";
import CustomModal from "../components/Modal";
import { login } from "../redux/actions"; // Ensure the path is correct

const LoginScreen = () => {
    const [modalVisible, setModalVisible] = useState(false);
    const router = useRouter();
    const dispatch = useDispatch();

    // Function to show modal before proceeding
    const handleWarning = () => {
        setModalVisible(true);
    };

    // Function when the user confirms the modal
    const handleConfirm = () => {
        setModalVisible(false);
        router.push("/form_data_screen");
    };

    // Function for login action
    const handleLogin = () => {
        const user = { username: "exampleUser" }; // Replace with actual user data
        dispatch(login(user));
        router.push("/home_screen"); // Navigate to home after login
    };

    return (
        <View className="flex-1 justify-center items-center bg-white px-4">
            <Text className="text-xl font-semibold mb-4">Login Screen</Text>

            {/* Show Warning Modal */}
            <Button
                title="Show Warning"
                onPress={handleWarning}
                color="#ff6600"
            />

            {/* Show Login Button */}
            <Button title="Login" onPress={handleLogin} color="#007bff" />

            {/* Modal Component */}
            <CustomModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                message="Do you have any pre-existing sickness?"
                onConfirm={handleConfirm}
            />
        </View>
    );
};

export default LoginScreen;
