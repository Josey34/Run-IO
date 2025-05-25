import {
    DarkTheme,
    DefaultTheme,
    ThemeProvider,
} from "@react-navigation/native";
import { Slot } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { AuthProvider } from "../hooks/useAuth";
import useColorScheme from "../hooks/useColorScheme";
import { ErrorModalEmitter } from "./api/api_service";
import ErrorModal from "./components/ErrorModal";

export default function Layout() {
    const { colorScheme } = useColorScheme();
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
}
