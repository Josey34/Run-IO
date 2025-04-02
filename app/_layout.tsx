import {
    DarkTheme,
    DefaultTheme,
    ThemeProvider,
} from "@react-navigation/native";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { Provider as ReduxProvider } from "react-redux";
import { TailwindProvider } from "tailwindcss-react-native";
import { ErrorModalEmitter } from "./api/api_service";
import ErrorModal from "./components/ErrorModal";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import useColorScheme from "./hooks/useColorScheme";
import store from "./redux/store";

// Inner layout component to handle auth
function InnerLayout() {
    const { user } = useAuth();
    const segments = useSegments();
    const router = useRouter();

    useEffect(() => {
        const inAuthGroup = segments[0] === "(auth)";
        const inHomeGroup = segments[0] === "(home)";

        if (!user && inHomeGroup) {
            // Redirect to welcome screen if trying to access protected routes while not authenticated
            router.replace("/(auth)/welcome_screen");
        }
    }, [user, segments]);

    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen
                name="(auth)/welcome_screen"
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="(auth)/index"
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="(home)/index"
                options={{ headerShown: false }}
            />
            {/* Add other screens here */}
            <Stack.Screen
                name="(auth)/login_screen"
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="(auth)/register_screen"
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="(auth)/form_data_screen"
                options={{ headerShown: false }}
            />
        </Stack>
    );
}

export default function Layout() {
    const colorScheme: any = useColorScheme();
    const [errorVisible, setErrorVisible] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        const showError = (message: string) => {
            setErrorMessage(message);
            setErrorVisible(true);
        };

        ErrorModalEmitter.on("SHOW_ERROR", showError);

        return () => {
            ErrorModalEmitter.off("SHOW_ERROR", showError);
        };
    }, []);

    return (
        <ReduxProvider store={store}>
            <TailwindProvider>
                <ThemeProvider
                    value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
                >
                    <StatusBar
                        style={colorScheme === "dark" ? "light" : "dark"}
                    />
                    <AuthProvider>
                        <InnerLayout />
                    </AuthProvider>
                    <ErrorModal
                        visible={errorVisible}
                        errorMessage={errorMessage}
                        onClose={() => setErrorVisible(false)}
                    />
                </ThemeProvider>
            </TailwindProvider>
        </ReduxProvider>
    );
}
