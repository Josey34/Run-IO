import {
    DarkTheme,
    DefaultTheme,
    ThemeProvider,
} from "@react-navigation/native";
import { Slot } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { LogBox } from "react-native";
import { enableScreens } from "react-native-screens";
import { AuthProvider } from "../hooks/useAuth";
import useColorScheme from "../hooks/useColorScheme";
import { ErrorModalEmitter } from "./api/api_service";
import ErrorModal from "./components/ErrorModal";

// Enable native screens
enableScreens(true);

// Disable LogBox in production but keep error logging
if (!__DEV__) {
    LogBox.ignoreAllLogs();
    console.error = (...args) => {
        // Still log to native console in production
        console.warn("Production Error:", ...args);
    };
}

export default function Layout() {
    const { colorScheme } = useColorScheme();
    const [errorVisible, setErrorVisible] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        try {
            const showError = (message: string) => {
                console.error("App Error:", message);
                setErrorMessage(message);
                setErrorVisible(true);
            };

            ErrorModalEmitter.on("SHOW_ERROR", showError);

            return () => {
                ErrorModalEmitter.off("SHOW_ERROR", showError);
            };
        } catch (error) {
            console.error("Layout Effect Error:", error);
        }
    }, []);

    // Wrap the entire app in a try-catch
    try {
        return (
            <ThemeProvider
                value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
            >
                <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
                <AuthProvider>
                    <Slot />
                </AuthProvider>
                <ErrorModal
                    visible={errorVisible}
                    errorMessage={errorMessage}
                    onClose={() => setErrorVisible(false)}
                />
            </ThemeProvider>
        );
    } catch (error) {
        console.error("Layout Render Error:", error);
        return null;
    }
}
