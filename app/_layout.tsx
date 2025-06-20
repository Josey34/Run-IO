import {
    DarkTheme,
    DefaultTheme,
    ThemeProvider,
} from "@react-navigation/native";
import * as Location from "expo-location";
import { Slot } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as TaskManager from "expo-task-manager";
import { useEffect, useState } from "react";
import { enableScreens } from "react-native-screens";
import { RunHistoryProvider } from "../hooks/runHistoryContext";
import { AuthProvider } from "../hooks/useAuth";
import useColorScheme from "../hooks/useColorScheme";
import { ErrorModalEmitter } from "./api/api_service";
import ErrorModal from "./components/ErrorModal";
import { backgroundLocationService } from "./utils/backgroundLocationService";

export const BACKGROUND_LOCATION_TASK = "background-location-task";

TaskManager.defineTask(BACKGROUND_LOCATION_TASK, async ({ data, error }) => {
    if (error) {
        console.error("Background task error:", error);
        return;
    }

    if (data) {
        const { locations } = data as { locations: Location.LocationObject[] };

        try {
            for (const location of locations) {
                await backgroundLocationService.saveLocationPoint(location);
            }
            // console.log(`Processed ${locations.length} location updates`);
        } catch (error) {
            console.error("Error processing location updates:", error);
        }
    }
});

enableScreens();

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

    try {
        return (
            <ThemeProvider
                value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
            >
                <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
                <AuthProvider>
                    <RunHistoryProvider>
                        <Slot />
                    </RunHistoryProvider>
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
