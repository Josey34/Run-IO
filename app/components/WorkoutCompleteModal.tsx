import { FontAwesome5 } from "@expo/vector-icons";
import React from "react";
import {
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
        steps: number;
    };
}

const WorkoutCompleteModal: React.FC<WorkoutCompleteModalProps> = ({
    visible,
    onClose,
    workoutData,
}) => {
    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <FontAwesome5 name="trophy" size={40} color="#FFD700" />
                        <Text style={styles.headerText}>Workout Complete!</Text>
                    </View>

                    <View style={styles.statsContainer}>
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

                        <View style={styles.statRow}>
                            <Text style={styles.statLabel}>Distance:</Text>
                            <Text style={styles.statValue}>
                                {workoutData.distance.toFixed(2)} km
                            </Text>
                        </View>
                        <View style={styles.statRow}>
                            <Text style={styles.statLabel}>Duration:</Text>
                            <Text style={styles.statValue}>
                                {workoutData.duration}
                            </Text>
                        </View>
                        <View style={styles.statRow}>
                            <Text style={styles.statLabel}>Avg Pace:</Text>
                            <Text style={styles.statValue}>
                                {workoutData.averagePace} /km
                            </Text>
                        </View>
                        {/* <View style={styles.statRow}>
                            <Text style={styles.statLabel}>Steps:</Text>
                            <Text style={styles.statValue}>
                                {workoutData.steps}
                            </Text>
                        </View> */}
                    </View>

                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={onClose}
                    >
                        <Text style={styles.closeButtonText}>Close</Text>
                    </TouchableOpacity>
                </View>
            </View>
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
    statRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#333",
    },
    statLabel: {
        fontSize: 16,
        color: "#888",
    },
    statValue: {
        fontSize: 16,
        color: "#FFF",
        fontWeight: "600",
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
