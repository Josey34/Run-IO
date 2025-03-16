import {
    DarkTheme,
    DefaultTheme,
    ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Provider as ReduxProvider } from "react-redux";
import { TailwindProvider } from "tailwindcss-react-native";
import { AuthProvider } from "./hooks/useAuth";
import useColorScheme from "./hooks/useColorScheme";
import store from "./redux/store";
// import { AuthProvider } from "./hooks/useAuth";

export default function Layout() {
    const colorScheme: any = useColorScheme();

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
                        {/* Wrap your application with AuthProvider */}
                        <Stack>
                            {/* Default route is now (auth)/welcome_screen */}
                            {/* <Stack.Screen
                                name="./(auth)/welcome_screen.tsx"
                                options={{ headerShown: false }}
                            />
                            <Stack.Screen
                                name="(auth)"
                                options={{ headerShown: false }}
                            /> */}
                            <Stack.Screen
                                name="(home)"
                                options={{ headerShown: false }}
                            />
                        </Stack>
                    </AuthProvider>
                </ThemeProvider>
            </TailwindProvider>
        </ReduxProvider>
    );
}
