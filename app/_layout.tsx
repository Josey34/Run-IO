import {
    DarkTheme,
    DefaultTheme,
    ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Provider } from "react-redux";
import { TailwindProvider } from "tailwindcss-react-native";
import useColorScheme from "./hooks/useColorScheme";
import store from "./redux/store";

export default function Layout() {
    const colorScheme: any = useColorScheme();

    return (
        <Provider store={store}>
            <TailwindProvider>
                <ThemeProvider
                    value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
                >
                    <StatusBar
                        style={colorScheme === "dark" ? "light" : "dark"}
                    />
                    <Stack>
                        {/* Default route is now (auth)/welcome_screen */}
                        <Stack.Screen
                            name="./(auth)/welcome_screen.tsx"
                            options={{ headerShown: false }}
                        />
                        <Stack.Screen
                            name="(auth)"
                            options={{ headerShown: false }}
                        />
                        <Stack.Screen
                            name="(home)"
                            options={{ headerShown: false }}
                        />
                    </Stack>
                </ThemeProvider>
            </TailwindProvider>
        </Provider>
    );
}
