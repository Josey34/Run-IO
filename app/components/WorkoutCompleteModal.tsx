import { FontAwesome5 } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import {
    Animated,
    Dimensions,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

interface WorkoutCompleteModalProps {
    visible: boolean;
    onClose: () => void;
    workoutData: {
        startTime: string;
        endTime: string;
        distance: number;
        duration: string;
        averagePace: string;
        averageSpeed: number;
    };
}

const WorkoutCompleteModal: React.FC<WorkoutCompleteModalProps> = ({
    visible,
    onClose,
    workoutData,
}) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    const scaleAnim = useRef(new Animated.Value(0.3)).current;
    const statsAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            fadeAnim.setValue(0);
            slideAnim.setValue(50);
            scaleAnim.setValue(0.3);
            statsAnim.setValue(0);

            Animated.sequence([
                Animated.parallel([
                    Animated.timing(fadeAnim, {
                        toValue: 1,
                        duration: 300,
                        useNativeDriver: true,
                    }),
                    Animated.spring(scaleAnim, {
                        toValue: 1,
                        tension: 60,
                        friction: 7,
                        useNativeDriver: true,
                    }),
                ]),
                Animated.stagger(100, [
                    Animated.spring(slideAnim, {
                        toValue: 0,
                        tension: 60,
                        friction: 8,
                        useNativeDriver: true,
                    }),
                    Animated.timing(statsAnim, {
                        toValue: 1,
                        duration: 400,
                        useNativeDriver: true,
                    }),
                ]),
            ]).start();
        }
    }, [visible]);

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <Animated.View style={[styles.modalOverlay, { opacity: fadeAnim }]}>
                <Animated.View
                    style={[
                        styles.modalContent,
                        {
                            transform: [{ scale: scaleAnim }],
                        },
                    ]}
                >
                    <View style={styles.modalHeader}>
                        <Animated.View
                            style={{
                                transform: [{ scale: scaleAnim }],
                            }}
                        >
                            <FontAwesome5
                                name="trophy"
                                size={40}
                                color="#FFD700"
                            />
                        </Animated.View>
                        <Text style={styles.headerText}>Workout Complete!</Text>
                    </View>

                    <Animated.View
                        style={[
                            styles.statsContainer,
                            {
                                transform: [{ translateY: slideAnim }],
                                opacity: statsAnim,
                            },
                        ]}
                    >
                        <View style={styles.timeContainer}>
                            <View style={styles.timeBlock}>
                                <Text style={styles.timeLabel}>Started</Text>
                                <Text style={styles.timeValue}>
                                    {workoutData.startTime}
                                </Text>
                            </View>
                            <FontAwesome5
                                name="arrow-right"
                                size={20}
                                color="#888"
                                style={styles.timeArrow}
                            />
                            <View style={styles.timeBlock}>
                                <Text style={styles.timeLabel}>Ended</Text>
                                <Text style={styles.timeValue}>
                                    {workoutData.endTime}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.statsGrid}>
                            {[
                                {
                                    icon: "route",
                                    value: `${workoutData.distance.toFixed(
                                        2
                                    )} km`,
                                    label: "Distance",
                                },
                                {
                                    icon: "clock",
                                    value: `${workoutData.duration}`,
                                    label: "Duration",
                                },
                                {
                                    icon: "tachometer-alt",
                                    value: `${workoutData.averageSpeed.toFixed(
                                        1
                                    )} km/h`,
                                    label: "Avg Speed",
                                },
                                {
                                    icon: "running",
                                    value: `${workoutData.averagePace} /km`,
                                    label: "Avg Pace",
                                },
                            ].map((stat, index) => (
                                <Animated.View
                                    key={stat.label}
                                    style={[
                                        styles.statItem,
                                        {
                                            transform: [
                                                {
                                                    translateY:
                                                        statsAnim.interpolate({
                                                            inputRange: [0, 1],
                                                            outputRange: [
                                                                50, 0,
                                                            ],
                                                        }),
                                                },
                                            ],
                                            opacity: statsAnim,
                                        },
                                    ]}
                                >
                                    <FontAwesome5
                                        name={stat.icon}
                                        size={24}
                                        color="#00B04D"
                                    />
                                    <Text style={styles.statValue}>
                                        {stat.value}
                                    </Text>
                                    <Text style={styles.statLabel}>
                                        {stat.label}
                                    </Text>
                                </Animated.View>
                            ))}
                        </View>
                    </Animated.View>

                    <Animated.View
                        style={{
                            opacity: statsAnim,
                            transform: [{ translateY: slideAnim }],
                        }}
                    >
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={onClose}
                        >
                            <Text style={styles.closeButtonText}>Close</Text>
                        </TouchableOpacity>
                    </Animated.View>
                </Animated.View>
            </Animated.View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContent: {
        width: Dimensions.get("window").width * 0.85,
        backgroundColor: "#1A1A1A",
        borderRadius: 20,
        padding: 20,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    modalHeader: {
        alignItems: "center",
        marginBottom: 20,
    },
    headerText: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#FFF",
        marginTop: 10,
    },
    statsContainer: {
        width: "100%",
        marginVertical: 10,
    },
    timeContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: "#333",
        marginBottom: 10,
    },
    timeBlock: {
        alignItems: "center",
    },
    timeLabel: {
        fontSize: 14,
        color: "#888",
        marginBottom: 5,
    },
    timeValue: {
        fontSize: 20,
        color: "#FFF",
        fontWeight: "600",
    },
    timeArrow: {
        marginHorizontal: 15,
    },
    statsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        paddingVertical: 15,
    },
    statItem: {
        width: "48%",
        backgroundColor: "#2A2A2A",
        borderRadius: 12,
        padding: 15,
        alignItems: "center",
        marginBottom: 15,
    },
    statLabel: {
        fontSize: 14,
        color: "#888",
        marginTop: 8,
    },
    statValue: {
        fontSize: 18,
        color: "#FFF",
        fontWeight: "600",
        marginTop: 8,
    },
    closeButton: {
        backgroundColor: "#00B04D",
        paddingHorizontal: 40,
        paddingVertical: 12,
        borderRadius: 25,
        marginTop: 20,
    },
    closeButtonText: {
        color: "#FFF",
        fontSize: 16,
        fontWeight: "600",
    },
});

export default WorkoutCompleteModal;
