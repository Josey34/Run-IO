import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function HomeLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: "#007AFF",
                tabBarInactiveTintColor: "#8e8e93",
                tabBarStyle: { backgroundColor: "#fff", height: 60 },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: "Home",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons
                            name="home-outline"
                            size={size}
                            color={color}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="statistics_screen"
                options={{
                    title: "Statistics",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons
                            name="stats-chart-outline"
                            size={size}
                            color={color}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="running_screen"
                options={{
                    title: "Running",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons
                            name="walk-outline"
                            size={size}
                            color={color}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="challenge_screen"
                options={{
                    title: "Challenges",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons
                            name="trophy-outline"
                            size={size}
                            color={color}
                        />
                    ),
                }}
            />
        </Tabs>
    );
}
