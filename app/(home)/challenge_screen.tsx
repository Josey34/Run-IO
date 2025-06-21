import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Animated,
    Easing,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useRunHistory } from "../../hooks/runHistoryContext";
import { useAuth } from "../../hooks/useAuth";
import useFetch from "../../hooks/useFetch";
import CustomModal from "../components/CustomModal";

interface Challenge {
    id: number;
    userId: string;
    type: string;
    distance: number;
    speed: number;
    duration: number;
    completed: boolean;
}

interface SingleMetricChallenge extends Challenge {
    metricType: "Distance" | "Speed" | "Duration";
    value: any;
    unit: string;
    icon: string;
    singleMetricId: string;
    singleCompleted: boolean;
}

const splitChallenges = (challenges: Challenge[]): SingleMetricChallenge[] => {
    const result: SingleMetricChallenge[] = [];
    challenges.forEach((c) => {
        result.push({
            ...c,
            metricType: "Distance",
            value: c.distance.toFixed(1),
            unit: "km",
            icon: "map-marker-distance",
            singleMetricId: `${c.id}-distance`,
            singleCompleted: false,
        });
        result.push({
            ...c,
            metricType: "Speed",
            value: c.speed.toFixed(2),
            unit: "km/h",
            icon: "speedometer",
            singleMetricId: `${c.id}-speed`,
            singleCompleted: false,
        });
        result.push({
            ...c,
            metricType: "Duration",
            value: c.duration,
            unit: "min",
            icon: "timer-outline",
            singleMetricId: `${c.id}-duration`,
            singleCompleted: false,
        });
    });
    return result;
};

const ChallengeScreen = () => {
    const { user } = useAuth();
    const router = useRouter();
    const {
        data: challenges,
        loading,
        refreshing,
        error,
        refetch,
        fetchFromBackend,
        updateChallenge,
    } = useFetch<Challenge>("");

    const [filter, setFilter] = useState("All");
    const translateX = useRef(new Animated.Value(0)).current;
    const [updatingChallengeId, setUpdatingChallengeId] = useState<
        number | null
    >(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalMessage, setModalMessage] = useState("");
    const [pendingAction, setPendingAction] = useState<(() => void) | null>(
        null
    );

    const userChallenges: Challenge[] = challenges.filter(
        (challenge: Challenge): boolean => challenge?.userId === user?.uid
    );

    const { runHistory } = useRunHistory();

    const filters = ["All", "On Going", "Completed"];
    
    const RESET_KEY = "challenge_last_reset_date";

    const [singleMetricChallenges, setSingleMetricChallenges] = useState<
        SingleMetricChallenge[]
    >(splitChallenges(userChallenges));

    const areAllMetricsCompleted = (parentId: number) => {
        return (
            singleMetricChallenges.filter(
                (c) => c.id === parentId && c.singleCompleted
            ).length === 3
        );
    };

    useEffect(() => {
        setSingleMetricChallenges(splitChallenges(userChallenges));
    }, [challenges]);

    const filteredChallenges = singleMetricChallenges.filter((challenge) => {
        if (filter === "All") return true;
        return filter === "Completed"
            ? challenge.singleCompleted
            : !challenge.singleCompleted;
    });

    useEffect(() => {
        setSingleMetricChallenges((prev) =>
            prev.map((c) => {
                const progress = getChallengeProgress(c);
                if (!c.singleCompleted && progress >= 1) {
                    return { ...c, singleCompleted: true };
                }
                // Optionally, if you want to auto-uncomplete if progress drops below 1:
                // if (c.singleCompleted && progress < 1) {
                //     return { ...c, singleCompleted: false };
                // }
                return c;
            })
        );
    }, [runHistory]);
    
    useEffect(() => {
        const parentIds = [
            ...new Set(singleMetricChallenges.map((c) => c.id)),
        ];

        parentIds.forEach((parentId) => {
            const allCompleted = singleMetricChallenges.filter(
                (c) => c.id === parentId && c.singleCompleted
            ).length === 3;

            const parentChallenge = challenges.find((ch) => ch.id === parentId);

            if (parentChallenge && parentChallenge.completed !== allCompleted) {
                updateChallenge(parentId, allCompleted);
            }
        });
    }, [singleMetricChallenges]);
    
    useEffect(() => {
        const resetIfNewDay = async () => {
            const today = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
            const lastReset = await AsyncStorage.getItem(RESET_KEY);

            if (lastReset !== today) {
                setSingleMetricChallenges((prev) =>
                    prev.map((c) => ({ ...c, singleCompleted: false }))
                );
                await AsyncStorage.setItem(RESET_KEY, today);
            }
        };

        resetIfNewDay();
    }, []);

    // Add new animation values
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const slideAnim = useRef(new Animated.Value(-100)).current;
    const bounceAnim = useRef(new Animated.Value(0)).current;
    const refreshRotate = useRef(new Animated.Value(0)).current;
    const rotateAnim = useRef(new Animated.Value(0)).current;

    // Animation setup
    useEffect(() => {
        fetchFromBackend();
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
            Animated.spring(bounceAnim, {
                toValue: 1,
                friction: 3,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    useEffect(() => {
        const index = filters.indexOf(filter);
        Animated.timing(translateX, {
            toValue: index * 100,
            duration: 300,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
        }).start();
    }, [filter]);

    const buttonPressAnimation = () => {
        Animated.sequence([
            Animated.timing(scaleAnim, {
                toValue: 0.9,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
            }),
        ]).start();
    };

    const startRefreshAnimation = () => {
        refreshRotate.setValue(0);
        Animated.timing(refreshRotate, {
            toValue: 1,
            duration: 1000,
            easing: Easing.linear,
            useNativeDriver: true,
        }).start();
    };

    const startRotationAnimation = () => {
        rotateAnim.setValue(0);
        Animated.loop(
            Animated.timing(rotateAnim, {
                toValue: 1,
                duration: 1000,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        ).start();
    };

    const spin = refreshRotate.interpolate({
        inputRange: [0, 1],
        outputRange: ["0deg", "360deg"],
    });

    const rotation = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ["0deg", "360deg"],
    });

    const showModal = (message: string, confirmAction?: () => void) => {
        setModalMessage(message);
        setPendingAction(() => confirmAction || null);
        setModalVisible(true);
    };

    const handleUpdateChallenge = async (
        singleMetricId: string,
        completed: boolean
    ) => {
        setSingleMetricChallenges((prev) =>
            prev.map((c) =>
                c.singleMetricId === singleMetricId
                    ? { ...c, singleCompleted: completed }
                    : c
            )
        );
        showModal(
            `Challenge ${completed ? "completed" : "cancelled"} successfully!`
        );
    };

    const handleComplete = (singleMetricId: string) => {
        showModal(
            "Are you sure you want to mark this challenge as completed?",
            () => handleUpdateChallenge(singleMetricId, true)
        );
    };

    const handleCancel = (singleMetricId: string) => {
        showModal("Are you sure you want to un-complete this challenge?", () =>
            handleUpdateChallenge(singleMetricId, false)
        );
    };

    const getChallengeProgress = (challenge: SingleMetricChallenge) => {
        if (runHistory.length === 0) return 0;

        if (challenge.metricType === "Distance") {
            const totalDistance = runHistory.reduce(
                (sum, run) => sum + run.distance,
                0
            );
            return Math.min(totalDistance / challenge.distance, 1);
        }

        if (challenge.metricType === "Duration") {
            const totalDuration = runHistory.reduce(
                (sum, run) => sum + run.duration,
                0
            );
            return Math.min(totalDuration / challenge.duration, 1);
        }

        if (challenge.metricType === "Speed") {
            const latestRun = runHistory[runHistory.length - 1];
            return Math.min(latestRun.speed / challenge.speed, 1);
        }

        return 0;
    };

    return (
        <View style={styles.container}>
            {/* Header Section */}
            <Animated.View
                style={[
                    styles.header,
                    { transform: [{ translateY: slideAnim }] },
                ]}
            >
                <Text style={styles.headerText}>Challenges</Text>
            </Animated.View>

            {/* Progress Box with Loading State */}
            <Animated.View style={[styles.progressBox, { opacity: fadeAnim }]}>
                <Text style={styles.progressTitle}>Completed Challenges</Text>
                <View style={styles.progressContent}>
                    {loading ? (
                        <ActivityIndicator size="small" color="#007bff" />
                    ) : (
                        <Text style={styles.progressText}>
                            {
                                singleMetricChallenges.filter(
                                    (challenge) => challenge.singleCompleted
                                ).length
                            }
                            <Text style={{ color: "#000", fontSize: 18 }}>
                                {" "}
                                / {singleMetricChallenges.length}
                            </Text>
                        </Text>
                    )}
                    <Ionicons name="fitness" size={28} color="black" />
                </View>
            </Animated.View>

            {/* Filter Buttons with Loading State */}
            <View style={styles.filterContainer}>
                <Animated.View
                    style={[
                        styles.filterIndicator,
                        { transform: [{ translateX }] },
                    ]}
                />
                {filters.map((option) => (
                    <TouchableOpacity
                        testID={`filter-button-${option}`}
                        key={option}
                        style={styles.filterButton}
                        onPress={() => setFilter(option)}
                        disabled={loading}
                    >
                        <Text
                            style={[
                                styles.filterText,
                                filter === option && styles.activeFilterText,
                                loading && styles.disabledText,
                            ]}
                        >
                            {option}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Challenge List */}
            {loading && !refreshing ? (
                <ActivityIndicator
                    size="large"
                    color="#007bff"
                    style={styles.loadingIndicator}
                />
            ) : (
                <FlatList
                    data={filteredChallenges}
                    keyExtractor={(item) => item.singleMetricId}
                    renderItem={({ item }) => (
                        <Animated.View
                            style={[
                                { flexDirection: "row", marginBottom: 20 },
                                {
                                    opacity: fadeAnim,
                                    transform: [
                                        {
                                            translateX: fadeAnim.interpolate({
                                                inputRange: [0, 1],
                                                outputRange: [50, 0],
                                            }),
                                        },
                                    ],
                                },
                            ]}
                        >
                            <View
                                style={styles.challengeItem}
                                testID={`challenge-${item.singleMetricId}`}
                            >
                                <Animated.View
                                    style={[
                                        styles.iconContainer,
                                        {
                                            transform: [
                                                {
                                                    scale: bounceAnim,
                                                },
                                            ],
                                        },
                                    ]}
                                >
                                    <MaterialCommunityIcons
                                        name={item.icon}
                                        size={24}
                                        color="#fff"
                                    />
                                </Animated.View>
                                <View style={styles.challengeInfo}>
                                    <Text style={styles.challengeType}>
                                        {item.metricType} Challenge
                                    </Text>
                                    <Text style={styles.statValue}>
                                        {item.value} {item.unit}
                                    </Text>
                                    <View style={{ marginTop: 8 }}>
                                        {getChallengeProgress(item) >= 1 ? (
                                            <Text
                                                style={{
                                                    color: "#4CAF50",
                                                    fontWeight: "bold",
                                                    fontSize: 14,
                                                }}
                                            >
                                                Completed
                                            </Text>
                                        ) : (
                                            <View style={styles.progressBar}>
                                                <View
                                                    style={{
                                                        width: `${
                                                            getChallengeProgress(
                                                                item
                                                            ) * 100
                                                        }%`,
                                                        height: 8,
                                                        backgroundColor:
                                                            "#4CAF50",
                                                        borderRadius: 4,
                                                    }}
                                                />
                                            </View>
                                        )}
                                    </View>
                                </View>
                            </View>
                            <Animated.View
                                style={[
                                    styles.actionButtons,
                                    { transform: [{ scale: scaleAnim }] },
                                ]}
                            >
                                <TouchableOpacity
                                    style={[
                                        styles.checkButton,
                                        item.singleCompleted &&
                                            styles.buttonDisabled,
                                    ]}
                                    onPress={() => {
                                        buttonPressAnimation();
                                        handleComplete(item.singleMetricId);
                                    }}
                                >
                                    {item.singleCompleted ? (
                                        <Ionicons
                                            name="checkmark-done"
                                            size={18}
                                            color="#fff"
                                        />
                                    ) : (
                                        <Ionicons
                                            testID="checkmark-button"
                                            name="checkmark"
                                            size={18}
                                            color="#fff"
                                        />
                                    )}
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.cancelButton]}
                                    onPress={() => {
                                        buttonPressAnimation();
                                        handleCancel(item.singleMetricId);
                                    }}
                                >
                                    <Ionicons
                                        testID="cancel-button"
                                        name="close"
                                        size={18}
                                        color="#fff"
                                    />
                                </TouchableOpacity>
                            </Animated.View>
                        </Animated.View>
                    )}
                    onRefresh={() => {
                        startRefreshAnimation();
                        fetchFromBackend(true);
                    }}
                    refreshing={refreshing}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={() => {
                                startRotationAnimation();
                                fetchFromBackend(true);
                            }}
                            tintColor="#007bff"
                            colors={["#007bff"]}
                            progressViewOffset={20}
                            progressBackgroundColor="#fff"
                            title="Refreshing..."
                            titleColor="#007bff"
                        />
                    }
                />
            )}
            <CustomModal
                visible={modalVisible}
                message={modalMessage}
                onConfirm={() => {
                    pendingAction?.();
                    setModalVisible(false);
                }}
                onClose={() => setModalVisible(false)}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#333446",
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#7F8CAA",
        padding: 20,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    headerText: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#fff",
    },
    progressBox: {
        backgroundColor: "#EAEFEF",
        padding: 15,
        borderRadius: 10,
        marginVertical: 15,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
    },
    progressTitle: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#333",
    },
    progressContent: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    progressText: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#000",
    },
    filterContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-around",
        backgroundColor: "#B8CFCE",
        borderRadius: 25,
        width: 300,
        height: 50,
        alignSelf: "center",
        position: "relative",
        overflow: "hidden",
    },
    filterIndicator: {
        position: "absolute",
        backgroundColor: "#7F8CAA",
        height: 40,
        width: 100,
        borderRadius: 20,
        top: 5,
        left: 0,
    },
    filterButton: {
        flex: 1,
        height: 50,
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1,
    },
    filterText: {
        color: "#888",
        fontSize: 14,
        fontWeight: "600",
        textAlign: "center",
    },
    activeFilterText: {
        color: "#fff",
        fontWeight: "700",
    },
    challengeItem: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#EAEFEF",
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
        marginTop: 10,
        flex: 1,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
    },
    iconContainer: {
        backgroundColor: "#7F8CAA",
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
    },
    challengeInfo: {
        flex: 1,
        marginLeft: 10,
    },
    infoTop: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    challengeType: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#000",
    },
    challengeDistance: {
        fontSize: 16,
        color: "#000",
    },
    separator: {
        height: 1,
        backgroundColor: "#ddd",
        marginVertical: 5,
    },
    infoBottom: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    challengeDetails: {
        fontSize: 12,
        color: "#555",
    },
    actionButtons: {
        flexDirection: "column",
        justifyContent: "center",
        marginTop: 10,
        marginLeft: 10,
    },
    checkButton: {
        backgroundColor: "#4CAF50",
        width: 30,
        height: 30,
        borderRadius: 15,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 10,
    },
    cancelButton: {
        backgroundColor: "#e74c3c",
        width: 30,
        height: 30,
        borderRadius: 15,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 10,
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    disabledText: {
        opacity: 0.5,
    },
    loadingIndicator: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    cardRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 10,
    },
    statCard: {
        flex: 1,
        backgroundColor: "#fff",
        borderRadius: 8,
        padding: 10,
        marginHorizontal: 3,
        alignItems: "center",
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 2,
    },
    statLabel: {
        fontSize: 12,
        color: "#7F8CAA",
        marginTop: 4,
    },
    statValue: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#333",
        marginTop: 2,
    },
    progressBar: {
        height: 8,
        backgroundColor: "#eee",
        borderRadius: 4,
    },
});

export default ChallengeScreen;
