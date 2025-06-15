import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Animated,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import { useAuth } from "../../hooks/useAuth";
import useFetch from "../../hooks/useFetch";
import { ErrorModalEmitter } from "../api/api_service";

interface Run {
    id?: string;
    averagePace: string;
    averageSpeed: number;
    createdAt: string;
    currentPace: string;
    speed: number;
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
    // totalSteps: number;
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
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    const chartAnim = useRef(new Animated.Value(0)).current;
    const statsAnim = useRef(new Animated.Value(0)).current;
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

    const resetAndStartAnimations = () => {
        // Reset all animations
        fadeAnim.setValue(0);
        slideAnim.setValue(50);
        chartAnim.setValue(0);
        statsAnim.setValue(0);

        // Play animations in sequence
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.sequence([
                Animated.delay(400),
                Animated.timing(chartAnim, {
                    toValue: 1,
                    duration: 800,
                    useNativeDriver: true,
                }),
            ]),
            Animated.sequence([
                Animated.delay(800),
                Animated.timing(statsAnim, {
                    toValue: 1,
                    duration: 800,
                    useNativeDriver: true,
                }),
            ]),
        ]).start();
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadRuns();
        resetAndStartAnimations();
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
        resetAndStartAnimations();
    }, [user]);

    const calculateStatistics = (runs: Run[]): StatisticsData => {
        if (!runs || runs.length === 0) {
            return {
                totalDistance: 0,
                totalTime: "0h 0m",
                avgPace: "--:--",
                avgSpeed: 0,
                // totalSteps: 0,
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

        const totalDistance = runs.reduce(
            (sum, run) => sum + (run.distance || 0),
            0
        );

        const totalSeconds = runs.reduce((sum, run) => {
            if (!run.timeElapsed) return sum;
            const [minutes, seconds] = run.timeElapsed.split(":").map(Number);
            return sum + minutes * 60 + (seconds || 0);
        }, 0);

        const totalHours = Math.floor(totalSeconds / 3600);
        const totalMinutes = Math.floor((totalSeconds % 3600) / 60);
        const totalTime = `${totalHours}h ${totalMinutes}m`;

        const validSpeeds = runs
            .filter(run => run.averageSpeed > 0)
            .map(run => run.averageSpeed);
        
        const avgSpeed = validSpeeds.length > 0
            ? Number((validSpeeds.reduce((sum, speed) => sum + speed, 0) / validSpeeds.length).toFixed(2))
            : 0;

        const validPaces = runs
                .filter(run => run.averagePace !== "--:--")
                .map(run => run.averagePace);
    
        const avgPace = validPaces.length > 0 ? validPaces[validPaces.length - 1] : "--:--";

        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setHours(0, 0, 0, 0);
            d.setDate(d.getDate() - i);
            return d.toISOString().split("T")[0];
        }).reverse();

        const dailyDistances = last7Days.map((date) => {
            const dayRuns = runs.filter((run) => {
                const runDate = new Date(run.createdAt);
                runDate.setHours(0, 0, 0, 0);
                return runDate.toISOString().split("T")[0] === date;
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
            avgSpeed,
            // totalSteps,
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
            <Animated.View
                style={[
                    styles.header,
                    {
                        opacity: fadeAnim,
                        transform: [{ translateY: slideAnim }],
                    },
                ]}
            >
                <View>
                    <Text style={styles.title}>Statistics</Text>
                </View>
            </Animated.View>

            {/* Last Run Info */}
            <Animated.View
                style={[
                    styles.lastRunContainer,
                    {
                        opacity: fadeAnim,
                        transform: [{ translateY: slideAnim }],
                    },
                ]}
            >
                <Text style={styles.lastRunText}>
                    Last Run: {statistics.lastRunDate}
                </Text>
            </Animated.View>

            {/* Chart */}
            <Animated.View
                style={[styles.chartContainer, { opacity: chartAnim }]}
            >
                <Text style={styles.chartTitle}>Last 7 Days Distance (km)</Text>
                <LineChart
                    data={statistics.chartData}
                    width={300}
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
            </Animated.View>

            {/* Statistics Boxes */}
            <Animated.View
                style={[styles.statsContainer, { opacity: statsAnim }]}
            >
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
                        name="speedometer"
                        size={24}
                        color="#FF4B4B"
                    />
                    <Text style={styles.statTitle}>Avg. Speed</Text>
                    <Text style={styles.statValue}>
                        {statistics.avgSpeed} km/h
                    </Text>
                </View>
                <View style={styles.statBox}>
                    <MaterialCommunityIcons
                        name="shoe-print"
                        size={24}
                        color="#FF4B4B"
                    />
                    <Text style={styles.statTitle}>Avg. Pace</Text>
                    <Text style={styles.statValue}>
                        {statistics.avgPace} min/km
                    </Text>
                </View>
            </Animated.View>

            {/* Add some bottom padding for better scrolling */}
            <View style={styles.bottomPadding} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#333446",
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
        color: "#1E2923",
        fontSize: 20,
        fontWeight: "bold",
        marginTop: 16,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 15,
        backgroundColor: "#7F8CAA",
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
        backgroundColor: "#B8CFCE",
        borderRadius: 16,
        padding: 12,
        marginBottom: 15,
    },
    lastRunText: {
        color: "#888",
        fontSize: 14,
    },
    chartContainer: {
        backgroundColor: "#B8CFCE",
        borderRadius: 16,
        padding: 15,
        alignItems: "center",
        marginBottom: 20,
    },
    chartTitle: {
        color: "#888",
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
        backgroundColor: "#EAEFEF",
        borderRadius: 16,
        padding: 15,
        width: "48%",
        alignItems: "center",
        marginBottom: 10,
    },
    statTitle: {
        fontSize: 14,
        fontWeight: "600",
        color: "#1E2923",
        marginTop: 8,
        marginBottom: 4,
    },
    statValue: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#888",
    },
    speedValue: {
        fontSize: 14,
        color: "#888",
        marginTop: 4,
    },
});

export default StatisticsScreen;
