import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { LineChart } from "react-native-chart-kit";

interface StatisticsData {
    distance: number;
    totalTime: string;
    avgPace: string;
    stepCount: number;
    chartData: {
        labels: string[];
        datasets: {
            data: number[];
            strokeWidth: number;
        }[];
    };
}

const StatisticsScreen = () => {
    const [data, setData] = useState<StatisticsData | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            const fetchedData = {
                distance: 10.59,
                totalTime: "1h 30m",
                avgPace: "5:30 min/km",
                stepCount: 12000,
                chartData: {
                    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
                    datasets: [
                        {
                            data: [5, 10, 7, 8, 12, 15, 10],
                            strokeWidth: 2,
                        },
                    ],
                },
            };
            setData(fetchedData);
        };
        fetchData();
    }, []);

    if (!data) {
        return <Text style={styles.loadingText}>Loading...</Text>;
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Statistics</Text>
                <Image
                    source={{ uri: "https://i.pravatar.cc/100" }}
                    style={styles.profileImage}
                />
            </View>

            {/* Chart */}
            <View style={styles.chartContainer}>
                <LineChart
                    data={data.chartData}
                    width={350}
                    height={200}
                    chartConfig={{
                        backgroundColor: "#1E2923",
                        backgroundGradientFrom: "#1E2923",
                        backgroundGradientTo: "#08130D",
                        decimalPlaces: 2,
                        color: (opacity = 1) =>
                            `rgba(255, 255, 255, ${opacity})`,
                        labelColor: (opacity = 1) =>
                            `rgba(255, 255, 255, ${opacity})`,
                        style: { borderRadius: 16 },
                        propsForDots: {
                            r: "6",
                            strokeWidth: "2",
                            stroke: "#ffa726",
                        },
                    }}
                    style={{
                        marginVertical: 8,
                        borderRadius: 16,
                    }}
                />
            </View>

            {/* Statistics Boxes */}
            <View style={styles.statsContainer}>
                <View style={styles.statBox}>
                    <MaterialCommunityIcons
                        name="tag"
                        size={20}
                        color="black"
                    />
                    <Text style={styles.statTitle}>Distance covered</Text>
                    <Text style={styles.statValue}>{data.distance} Km</Text>
                </View>
                <View style={styles.statBox}>
                    <MaterialCommunityIcons
                        name="clock-outline"
                        size={20}
                        color="black"
                    />
                    <Text style={styles.statTitle}>Total Time</Text>
                    <Text style={styles.statValue}>{data.totalTime}</Text>
                </View>
                <View style={styles.statBox}>
                    <MaterialCommunityIcons
                        name="flash"
                        size={20}
                        color="black"
                    />
                    <Text style={styles.statTitle}>Avg. Pace</Text>
                    <Text style={styles.statValue}>{data.avgPace}</Text>
                </View>
                <View style={styles.statBox}>
                    <MaterialCommunityIcons
                        name="foot-print"
                        size={20}
                        color="black"
                    />
                    <Text style={styles.statTitle}>Step Count</Text>
                    <Text style={styles.statValue}>{data.stepCount}</Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#000",
        padding: 20,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 15,
    },
    title: {
        fontSize: 26,
        fontWeight: "bold",
        color: "#fff",
    },
    profileImage: {
        width: 40,
        height: 40,
        borderRadius: 50,
    },
    chartContainer: {
        backgroundColor: "#fff",
        borderRadius: 10,
        padding: 15,
        alignItems: "center",
        marginBottom: 20,
    },
    statsContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
    },
    statBox: {
        backgroundColor: "#fff",
        borderRadius: 10,
        padding: 15,
        width: "48%",
        alignItems: "center",
        marginVertical: 10,
    },
    statTitle: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#333",
        marginTop: 5,
    },
    statValue: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#000",
        marginTop: 5,
    },
    loadingText: {
        textAlign: "center",
        fontSize: 16,
        color: "gray",
        marginTop: 20,
    },
});

export default StatisticsScreen;
