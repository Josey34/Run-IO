import { Stack } from "expo-router";
import { ActivityIndicator } from "react-native";
import { useAuth } from "../hooks/useAuth";

export default function AuthLayout() {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return <ActivityIndicator color="#000" />;
    }

    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen
                name="welcome_screen"
                options={{ title: "Welcome" }}
            />
            <Stack.Screen name="login_screen" options={{ title: "Login" }} />
            <Stack.Screen
                name="register_screen"
                options={{ title: "Register" }}
            />
            <Stack.Screen
                name="form_data_screen"
                options={{ title: "Form Data" }}
            />
        </Stack>
    );
}
