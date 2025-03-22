import { FontAwesome5 } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from "react-native-reanimated";
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
    const translateX = useSharedValue(0);

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
        if (filter === "All") {
            translateX.value = withTiming(0, {
                duration: 300,
                easing: Easing.inOut(Easing.ease),
            });
        } else if (filter === "On Going") {
            translateX.value = withTiming(100, {
                duration: 300,
                easing: Easing.inOut(Easing.ease),
            });
        } else if (filter === "Completed") {
            translateX.value = withTiming(200, {
                duration: 300,
                easing: Easing.inOut(Easing.ease),
            });
        }
    }, [filter]);

    const animatedStyles = useAnimatedStyle(() => {
        return {
            transform: [{ translateX: translateX.value }],
        };
    });

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
                    <FontAwesome5 name="running" size={28} color="black" />
                </View>
            </View>

            {/* Filter Buttons */}
            <View style={styles.filterContainer}>
                <Animated.View
                    style={[styles.filterIndicator, animatedStyles]}
                />
                {["All", "On Going", "Completed"].map((option, index) => (
                    <TouchableOpacity
                        key={option}
                        style={[
                            styles.filterButton,
                            filter === option && styles.activeFilter,
                        ]}
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
                    color="#0000ff"
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
                                    <FontAwesome5
                                        name="running"
                                        size={20}
                                        color="#000"
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
                                    <FontAwesome5
                                        name="check"
                                        size={18}
                                        color="black"
                                    />
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.cancelButton}>
                                    <FontAwesome5
                                        name="times"
                                        size={18}
                                        color="black"
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
        backgroundColor: "#2C2C2C",
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#1A1A1A",
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
        justifyContent: "space-between",
        marginVertical: 10,
        position: "relative",
    },
    filterIndicator: {
        position: "absolute",
        backgroundColor: "#007bff",
        height: 40,
        width: "33%",
        borderRadius: 20,
        top: 5,
        left: 5,
        padding: 10,
    },
    filterButton: {
        padding: 10,
        borderRadius: 5,
        width: "33%",
        alignItems: "center",
    },
    activeFilter: {
        backgroundColor: "#ddd",
    },
    filterText: {
        color: "#000",
    },
    activeFilterText: {
        color: "#fff",
    },
    challengeListContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
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
    },
    iconContainer: {
        backgroundColor: "#ddd",
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
        backgroundColor: "#ddd",
        width: 30,
        height: 30,
        borderRadius: 15,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 10,
    },
    cancelButton: {
        backgroundColor: "#ddd",
        width: 30,
        height: 30,
        borderRadius: 15,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 10,
    },
    loadingIndicator: {
        flex: 1,
    },
    errorText: {
        fontSize: 16,
        color: "red",
    },
});

export default ChallengeScreen;
