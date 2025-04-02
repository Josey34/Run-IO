import {
    DarkTheme,
    DefaultTheme,
    ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { Provider as ReduxProvider } from "react-redux";
import { TailwindProvider } from "tailwindcss-react-native";
import { ErrorModalEmitter } from "./api/api_service";
import ErrorModal from "./components/ErrorModal";
import { AuthProvider } from "./hooks/useAuth";
import useColorScheme from "./hooks/useColorScheme";
import store from "./redux/store";

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
                        <Stack screenOptions={{ headerShown: false }}>
                            {/* Remove the leading dot and .tsx extension */}
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
                        </Stack>
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
