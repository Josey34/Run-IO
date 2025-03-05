import { useRouter } from "expo-router";
import { Button, Text, View } from "react-native";

export default function WelcomeScreen() {
    const router = useRouter();

    return (
        <View className="flex-1 justify-center items-center bg-white">
            <Text className="text-2xl font-bold">Welcome to the App!</Text>
            <Button
                title="Login"
                onPress={() => router.push("/(auth)/login_screen")}
            />
            <Button
                title="Register"
                onPress={() => router.push("/(auth)/register_screen")}
            />
        </View>
    );
}
