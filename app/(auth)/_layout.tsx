import { Stack } from "expo-router";

export default function AuthLayout() {
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
