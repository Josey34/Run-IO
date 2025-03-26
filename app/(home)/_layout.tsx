import Tabbar from "@mindinventory/react-native-tab-bar-interaction";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

export default function HomeLayout() {
    const router = useRouter();

    const screens = {
        home: "/(home)/index",
        statistics: "/(home)/statistics_screen",
        running: "/(home)/running_screen",
        challenges: "/(home)/challenge_screen",
    };

    const tabs = [
        {
            name: "Home",
            activeIcon: <Icon name="home" color="#fff" size={25} />,
            inactiveIcon: (
                <Icon name="home-outline" color="#4d4d4d" size={25} />
            ),
            screen: screens.home,
        },
        {
            name: "Statistics",
            activeIcon: <Icon name="stats-chart" color="#fff" size={25} />,
            inactiveIcon: (
                <Icon name="stats-chart-outline" color="#4d4d4d" size={25} />
            ),
            screen: screens.statistics,
        },
        {
            name: "Running",
            activeIcon: <Icon name="walk" color="#fff" size={25} />,
            inactiveIcon: (
                <Icon name="walk-outline" color="#4d4d4d" size={25} />
            ),
            screen: screens.running,
        },
        {
            name: "Challenges",
            activeIcon: <Icon name="trophy" color="#fff" size={25} />,
            inactiveIcon: (
                <Icon name="trophy-outline" color="#4d4d4d" size={25} />
            ),
            screen: screens.challenges,
        },
    ];
    console.log("HomeLayout is rendering...");

    return (
        <View style={styles.container}>
            <Tabbar
                tabs={tabs}
                containerWidth={350}
                onTabChange={(tab, index) =>
                    router.push(tabs[index].screen as any)
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff",
    },
});
