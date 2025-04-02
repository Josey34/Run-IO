import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import { ErrorModalEmitter } from "../api/api_service";
import { useAuth } from "../hooks/useAuth";
import useFetch from "../hooks/useFetch";

interface Run {
    id?: string;
    averagePace: string;
    averageSpeed: number;
    createdAt: string;
    currentPace: string;
    currentSpeed: number;
    distance: number;
    duration: string;
    endTime: string;
    startTime: string;
    steps: number;
    timeElapsed: string;
    userId: string;
    route: Array<{
        latitude: number;
        longitude: number;
        timestamp: string;
    }>;
}

interface StatisticsData {
    totalDistance: number;
    totalTime: string;
    avgPace: string;
    avgSpeed: number;
    totalSteps: number;
    chartData: {
        labels: string[];
        datasets: {
            data: number[];
            strokeWidth: number;
        }[];
    };
    lastRunDate: string;
}

const EmptyState = () => (
    <View style={styles.emptyContainer}>
        <MaterialCommunityIcons name="run" size={64} color="#FF4B4B" />
        <Text style={styles.emptyTitle}>No Runs Yet</Text>
        <Text style={styles.emptyText}>
            Start your first run to see your statistics!
        </Text>
    </View>
);

const StatisticsScreen = () => {
    const [statistics, setStatistics] = useState<StatisticsData | null>(null);
    const { user } = useAuth();
    const { loading, error, fetchRun } = useFetch<Run[]>("");
    const [refreshing, setRefreshing] = useState(false);
    const router = useRouter();

    const loadRuns = async () => {
        if (!user?.uid) return;

        try {
            const runs = await fetchRun(user.uid);
            if (runs && Array.isArray(runs)) {
                const stats = calculateStatistics(runs);
                setStatistics(stats);
            }
        } catch (error) {
            console.error("Error loading runs:", error);
            ErrorModalEmitter.emit(
                "SHOW_ERROR",
                "Failed to load statistics. Please try again."
            );
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadRuns();
        setRefreshing(false);
    };

    const loginError = () => {
        if (!user?.uid) {
            return (
                <View style={styles.errorContainer}>
                    <MaterialCommunityIcons
                        name="account-alert"
                        size={48}
                        color="#FF4B4B"
                    />
                    <Text style={styles.errorText}>
                        Please log in to view statistics
                    </Text>
                </View>
            );
        }
    };

    useEffect(() => {
        loginError();
        loadRuns();
    }, [user]);

    const calculateStatistics = (runs: Run[]): StatisticsData => {
        if (!runs || runs.length === 0) {
            return {
                totalDistance: 0,
                totalTime: "0h 0m",
                avgPace: "--:--",
                avgSpeed: 0,
                totalSteps: 0,
                lastRunDate: "No runs yet",
                chartData: {
                    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
                    datasets: [
                        {
                            data: [0, 0, 0, 0, 0, 0, 0],
                            strokeWidth: 2,
                        },
                    ],
                },
            };
        }

        // Sort runs by date to get the latest
        const sortedRuns = [...runs].sort(
            (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
        );
        const lastRun = sortedRuns[0];
        const lastRunDate = new Date(lastRun.createdAt).toLocaleDateString(
            "en-US",
            {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            }
        );

        // Calculate total distance
        const totalDistance = runs.reduce(
            (sum, run) => sum + (run.distance || 0),
            0
        );

        // Calculate total time
        const totalSeconds = runs.reduce((sum, run) => {
            if (!run.timeElapsed) return sum;
            const [minutes, seconds] = run.timeElapsed.split(":").map(Number);
            return sum + minutes * 60 + (seconds || 0);
        }, 0);

        const totalHours = Math.floor(totalSeconds / 3600);
        const totalMinutes = Math.floor((totalSeconds % 3600) / 60);
        const totalTime = `${totalHours}h ${totalMinutes}m`;

        // Calculate average speed
        const validSpeeds = runs
            .filter((run) => run.currentSpeed > 0)
            .map((run) => run.currentSpeed);
        const avgSpeed =
            validSpeeds.length > 0
                ? validSpeeds.reduce((sum, speed) => sum + speed, 0) /
                  validSpeeds.length
                : 0;

        // Calculate average pace
        const validPaces = runs
            .filter((run) => run.currentPace && run.currentPace !== "--:--")
            .map((run) => {
                const [mins, secs] = run.currentPace.split(":").map(Number);
                return mins * 60 + (secs || 0);
            });

        let avgPace = "--:--";
        if (validPaces.length > 0) {
            const avgSeconds =
                validPaces.reduce((a, b) => a + b) / validPaces.length;
            const avgMinutes = Math.floor(avgSeconds / 60);
            const avgSecs = Math.round(avgSeconds % 60);
            avgPace = `${avgMinutes}:${avgSecs.toString().padStart(2, "0")}`;
        }

        // Calculate total steps
        const totalSteps = runs.reduce((sum, run) => sum + (run.steps || 0), 0);

        // Get last 7 days
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const d = new Date("2025-04-01"); // Using your current date
            d.setDate(d.getDate() - i);
            return d.toISOString().split("T")[0];
        }).reverse();

        const dailyDistances = last7Days.map((date) => {
            const dayRuns = runs.filter((run) => {
                const runDate = new Date(run.createdAt)
                    .toISOString()
                    .split("T")[0];
                return runDate === date;
            });
            return Number(
                dayRuns
                    .reduce((sum, run) => sum + (run.distance || 0), 0)
                    .toFixed(2)
            );
        });

        return {
            totalDistance: Number(totalDistance.toFixed(2)),
            totalTime,
            avgPace,
            avgSpeed: Number(avgSpeed.toFixed(2)),
            totalSteps,
            lastRunDate,
            chartData: {
                labels: last7Days.map((date) => {
                    const day = new Date(date).toLocaleDateString("en-US", {
                        weekday: "short",
                    });
                    return day.substring(0, 3);
                }),
                datasets: [
                    {
                        data: dailyDistances,
                        strokeWidth: 2,
                    },
                ],
            },
        };
    };

    if (loading && !refreshing) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FF4B4B" />
                <Text style={styles.loadingText}>
                    Loading your statistics...
                </Text>
            </View>
        );
    }

    if (!statistics) {
        return <EmptyState />;
    }

    return (
        <ScrollView
            style={styles.container}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    tintColor="#FF4B4B"
                    colors={["#FF4B4B"]}
                />
            }
        >
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>Statistics</Text>
                </View>
            </View>

            {/* Last Run Info */}
            <View style={styles.lastRunContainer}>
                <Text style={styles.lastRunText}>
                    Last Run: {statistics.lastRunDate}
                </Text>
            </View>

            {/* Chart */}
            <View style={styles.chartContainer}>
                <Text style={styles.chartTitle}>Last 7 Days Distance (km)</Text>
                <LineChart
                    data={statistics.chartData}
                    width={350}
                    height={200}
                    chartConfig={{
                        backgroundColor: "#1E2923",
                        backgroundGradientFrom: "#1E2923",
                        backgroundGradientTo: "#08130D",
                        decimalPlaces: 1,
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
                    bezier
                />
            </View>

            {/* Statistics Boxes */}
            <View style={styles.statsContainer}>
                <View style={styles.statBox}>
                    <MaterialCommunityIcons
                        name="map-marker-distance"
                        size={24}
                        color="#FF4B4B"
                    />
                    <Text style={styles.statTitle}>Total Distance</Text>
                    <Text style={styles.statValue}>
                        {statistics.totalDistance} km
                    </Text>
                </View>
                <View style={styles.statBox}>
                    <MaterialCommunityIcons
                        name="clock-outline"
                        size={24}
                        color="#FF4B4B"
                    />
                    <Text style={styles.statTitle}>Total Time</Text>
                    <Text style={styles.statValue}>{statistics.totalTime}</Text>
                </View>
                <View style={styles.statBox}>
                    <MaterialCommunityIcons
                        name="speed-meter"
                        size={24}
                        color="#FF4B4B"
                    />
                    <Text style={styles.statTitle}>Avg. Speed</Text>
                    <Text style={styles.statValue}>
                        {statistics.avgSpeed} km/h
                    </Text>
                    <Text style={styles.speedValue}>
                        {statistics.avgPace} min/km
                    </Text>
                </View>
                <View style={styles.statBox}>
                    <MaterialCommunityIcons
                        name="shoe-print"
                        size={24}
                        color="#FF4B4B"
                    />
                    <Text style={styles.statTitle}>Total Steps</Text>
                    <Text style={styles.statValue}>
                        {statistics.totalSteps}
                    </Text>
                </View>
            </View>

            {/* Add some bottom padding for better scrolling */}
            <View style={styles.bottomPadding} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#000",
        padding: 20,
    },
    bottomPadding: {
        height: 20,
    },
    dateContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#1E2923",
        borderRadius: 16,
        padding: 12,
        marginBottom: 15,
    },
    dateText: {
        color: "#888",
        fontSize: 14,
        marginLeft: 8,
    },
    loadingContainer: {
        flex: 1,
        backgroundColor: "#000",
        justifyContent: "center",
        alignItems: "center",
    },
    loadingText: {
        color: "#fff",
        fontSize: 16,
        marginTop: 16,
    },
    emptyContainer: {
        flex: 1,
        backgroundColor: "#000",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    emptyTitle: {
        color: "#fff",
        fontSize: 24,
        fontWeight: "bold",
        marginTop: 16,
    },
    emptyText: {
        color: "#888",
        fontSize: 16,
        textAlign: "center",
        marginTop: 8,
    },
    errorContainer: {
        flex: 1,
        backgroundColor: "#000",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    errorText: {
        color: "#FF4B4B",
        fontSize: 20,
        fontWeight: "bold",
        marginTop: 16,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 15,
        backgroundColor: "#333",
        padding: 20,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    title: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#fff",
    },
    lastRunContainer: {
        backgroundColor: "#1E2923",
        borderRadius: 16,
        padding: 12,
        marginBottom: 15,
    },
    lastRunText: {
        color: "#fff",
        fontSize: 14,
    },
    chartContainer: {
        backgroundColor: "#1E2923",
        borderRadius: 16,
        padding: 15,
        alignItems: "center",
        marginBottom: 20,
    },
    chartTitle: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 10,
    },
    statsContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
    },
    statBox: {
        backgroundColor: "#1E2923",
        borderRadius: 16,
        padding: 15,
        width: "48%",
        alignItems: "center",
        marginBottom: 10,
    },
    statTitle: {
        fontSize: 14,
        fontWeight: "600",
        color: "#888",
        marginTop: 8,
        marginBottom: 4,
    },
    statValue: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#fff",
    },
    speedValue: {
        fontSize: 14,
        color: "#888",
        marginTop: 4,
    },
});

export default StatisticsScreen;
