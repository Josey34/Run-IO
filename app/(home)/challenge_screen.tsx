import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Animated,
    Easing,
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import useFetch from "../hooks/useFetch";

interface Challenge {
    id: number;
    type: string;
    distance: number;
    pace: number;
    duration: number;
    completed: boolean;
}

const ChallengeScreen = () => {
    const {
        data: challenges,
        loading,
        refreshing,
        error,
        refetch,
        fetchFromBackend,
    } = useFetch<Challenge>("");

    const [filter, setFilter] = useState("All");
    const translateX = useRef(new Animated.Value(0)).current;

    // Definisikan array filter
    const filters = ["All", "On Going", "Completed"];

    useEffect(() => {
        fetchFromBackend();
    }, []);

    const filteredChallenges = challenges.filter((challenge) => {
        if (filter === "All") return true;
        return filter === "Completed"
            ? challenge.completed
            : !challenge.completed;
    });

    useEffect(() => {
        const index = filters.indexOf(filter);
        Animated.timing(translateX, {
            toValue: index * 100, // Setiap tab memiliki lebar 100
            duration: 300,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
        }).start();
    }, [filter]);

    return (
        <View style={styles.container}>
            {/* Header Section */}
            <View style={styles.header}>
                <Text style={styles.headerText}>Challenges</Text>
                <Image
                    source={{ uri: "https://i.pravatar.cc/300" }}
                    style={styles.profileImage}
                />
            </View>

            {/* Progress Box */}
            <View style={styles.progressBox}>
                <Text style={styles.progressTitle}>Completed Challenges</Text>
                <View style={styles.progressContent}>
                    <Text style={styles.progressText}>
                        {
                            filteredChallenges.filter(
                                (challenge) => challenge.completed
                            ).length
                        }
                        <Text style={{ color: "#000", fontSize: 18 }}>
                            {" "}
                            / {challenges.length}
                        </Text>
                    </Text>
                    <Ionicons name="fitness" size={28} color="black" />
                </View>
            </View>

            {/* Filter Buttons with Animated Indicator */}
            <View style={styles.filterContainer}>
                {/* Animated Sliding Indicator */}
                <Animated.View
                    style={[
                        styles.filterIndicator,
                        { transform: [{ translateX }] },
                    ]}
                />
                {filters.map((option) => (
                    <TouchableOpacity
                        key={option}
                        style={styles.filterButton}
                        onPress={() => setFilter(option)}
                    >
                        <Text
                            style={[
                                styles.filterText,
                                filter === option && styles.activeFilterText,
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
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <View
                            style={{ flexDirection: "row", marginBottom: 20 }}
                        >
                            <View style={styles.challengeItem}>
                                <View style={styles.iconContainer}>
                                    <Ionicons
                                        name="fitness"
                                        size={20}
                                        color="#fff"
                                    />
                                </View>
                                <View style={styles.challengeInfo}>
                                    <View style={styles.infoTop}>
                                        <Text style={styles.challengeType}>
                                            {item.type}
                                        </Text>
                                        <Text style={styles.challengeDistance}>
                                            {item.distance} km
                                        </Text>
                                    </View>
                                    <View style={styles.separator} />
                                    <View style={styles.infoBottom}>
                                        <Text style={styles.challengeDetails}>
                                            Pace: {item.pace} min/km
                                        </Text>
                                        <Text style={styles.challengeDetails}>
                                            Duration: {item.duration} min
                                        </Text>
                                    </View>
                                </View>
                            </View>
                            <View style={styles.actionButtons}>
                                <TouchableOpacity style={styles.checkButton}>
                                    <Ionicons
                                        name="checkmark"
                                        size={18}
                                        color="#fff"
                                    />
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.cancelButton}>
                                    <Ionicons
                                        name="close"
                                        size={18}
                                        color="#fff"
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                    onRefresh={() => fetchFromBackend(true)}
                    refreshing={refreshing}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#1A1A1A",
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#333",
        padding: 20,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    headerText: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#fff",
    },
    profileImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    progressBox: {
        backgroundColor: "#fff",
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
        backgroundColor: "#333",
        borderRadius: 25,
        width: 300,
        height: 50,
        alignSelf: "center",
        position: "relative",
        overflow: "hidden",
    },
    filterIndicator: {
        position: "absolute",
        backgroundColor: "#007bff",
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
        backgroundColor: "#fff",
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
        backgroundColor: "#007bff",
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
    loadingIndicator: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
});

export default ChallengeScreen;
