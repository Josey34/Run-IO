import { useRouter } from "expo-router";
import { useState } from "react";
import { Button, Text, TextInput, View } from "react-native";

export default function RegisterScreen() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const router = useRouter();

    const submitRegister = () => {
        alert("Registered Successfully!");
        router.push("/form_data_screen");
    };

    return (
        <View className="flex-1 justify-center items-center bg-white">
            <Text className="text-2xl font-bold">Register</Text>
            <TextInput
                className="border p-2 w-64 my-2"
                placeholder="Email"
                onChangeText={setEmail}
                value={email}
            />
            <TextInput
                className="border p-2 w-64 my-2"
                placeholder="Password"
                secureTextEntry
                onChangeText={setPassword}
                value={password}
            />
            <Button title="Register" onPress={submitRegister} />
        </View>
    );
}
