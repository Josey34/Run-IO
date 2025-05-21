import { Ionicons } from "@expo/vector-icons";
import { Redirect, Tabs } from "expo-router";
import { useRef, useState } from "react";
import {
    Animated,
    Dimensions,
    Pressable,
    StyleSheet,
    View,
} from "react-native";
import { useAuth } from "../hooks/useAuth";

const { width } = Dimensions.get("window");
const TAB_WIDTH = (width - 48) / 4;

export default function HomeLayout() {
    const { user, isLoading } = useAuth();
    const [activeIndex, setActiveIndex] = useState(0);
    const translateX = useRef(new Animated.Value(0)).current;
    const scaleValues = useRef([
        new Animated.Value(1),
        new Animated.Value(1),
        new Animated.Value(1),
        new Animated.Value(1),
    ]).current;

    if (!user) {
        return <Redirect href="/(auth)/welcome_screen" />;
    }

    const animateTab = (index: number) => {
        Animated.spring(translateX, {
            toValue: index * TAB_WIDTH,
            useNativeDriver: true,
        }).start();

        scaleValues.forEach((scale, i) => {
            Animated.spring(scale, {
                toValue: i === index ? 1.2 : 1,
                useNativeDriver: true,
                speed: 12,
                bounciness: 8,
            }).start();
        });

        setActiveIndex(index);
    };

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: styles.tabBar,
                tabBarShowLabel: false,
            }}
            tabBar={({ navigation, state, descriptors }) => (
                <View style={styles.tabBarContainer}>
                    {/* Sliding Indicator */}
                    <Animated.View
                        style={[
                            styles.slider,
                            {
                                transform: [{ translateX }],
                            },
                        ]}
                    />

                    {/* Tab Buttons */}
                    {state.routes.map((route, index) => {
                        const isFocused = state.index === index;

                        return (
                            <Pressable
                                key={route.key}
                                style={styles.tabButton}
                                onPress={() => {
                                    const event = navigation.emit({
                                        type: "tabPress",
                                        target: route.key,
                                        canPreventDefault: true,
                                    });

                                    if (!isFocused && !event.defaultPrevented) {
                                        navigation.navigate(route.name);
                                        animateTab(index);
                                    }
                                }}
                            >
                                <Animated.View
                                    style={[
                                        styles.iconContainer,
                                        {
                                            transform: [
                                                { scale: scaleValues[index] },
                                            ],
                                        },
                                    ]}
                                >
                                    <Ionicons
                                        name={getIconName(
                                            route.name as
                                                | "index"
                                                | "statistics_screen"
                                                | "running_screen"
                                                | "challenge_screen",
                                            isFocused
                                        )}
                                        size={24}
                                        color={
                                            isFocused ? "#FFFFFF" : "#666666"
                                        }
                                    />
                                </Animated.View>
                            </Pressable>
                        );
                    })}
                </View>
            )}
        >
            <Tabs.Screen name="index" />
            <Tabs.Screen name="statistics_screen" />
            <Tabs.Screen name="running_screen" />
            <Tabs.Screen name="challenge_screen" />
        </Tabs>
    );
}

const getIconName = (routeName: string, isFocused: boolean): string => {
    const icons: { [key: string]: string } = {
        index: isFocused ? "home-sharp" : "home-outline",
        statistics_screen: isFocused ? "stats-chart" : "stats-chart-outline",
        running_screen: isFocused ? "fitness" : "fitness-outline",
        challenge_screen: isFocused ? "trophy" : "trophy-outline",
    };
    return icons[routeName];
};

const styles = StyleSheet.create({
    tabBarContainer: {
        flexDirection: "row",
        position: "absolute",
        bottom: 24,
        left: 14,
        justifyContent: "center",
        alignItems: "center",
        height: 65,
        backgroundColor: "#F3F4F6",
        borderRadius: 20,
        padding: 10,
        elevation: 4,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.15,
        shadowRadius: 8,
    },
    tabBar: {
        display: "none",
    },
    slider: {
        position: "absolute",
        width: TAB_WIDTH - 20,
        height: 45,
        backgroundColor: "#007AFF",
        borderRadius: 15,
        top: 10,
        left: 20,
    },

    tabButton: {
        width: TAB_WIDTH,
        justifyContent: "center",
        alignItems: "center",
    },
    iconContainer: {
        width: 45,
        height: 45,
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1,
    },
});
