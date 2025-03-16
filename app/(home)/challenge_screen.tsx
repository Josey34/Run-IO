import { FontAwesome5 } from "@expo/vector-icons";
import React, { useState } from "react";
import {
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const challengesData = [
    {
        id: "1",
        type: "Running",
        distance: "11.9 Km",
        pace: "10 Km/h",
        duration: "1 Hr",
        completed: true,
    },
    {
        id: "2",
        type: "Running",
        distance: "11.9 Km",
        pace: "10 Km/h",
        duration: "1 Hr",
        completed: false,
    },
    {
        id: "3",
        type: "Running",
        distance: "11.9 Km",
        pace: "10 Km/h",
        duration: "1 Hr",
        completed: true,
    },
    {
        id: "4",
        type: "Running",
        distance: "11.9 Km",
        pace: "10 Km/h",
        duration: "1 Hr",
        completed: false,
    },
];

const ChallengeScreen = () => {
    const [filter, setFilter] = useState("All");

    const filteredChallenges = challengesData.filter((challenge) => {
        if (filter === "All") return true;
        return filter === "Completed"
            ? challenge.completed
            : !challenge.completed;
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
                            / {challengesData.length}
                        </Text>
                    </Text>
                    <FontAwesome5 name="running" size={28} color="black" />
                </View>
            </View>

            {/* Filter Buttons */}
            <View style={styles.filterContainer}>
                {["All", "On Going", "Completed"].map((option) => (
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
            <FlatList
                data={filteredChallenges}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={{ flexDirection: "row", marginBottom: 20 }}>
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
                                        {item.distance}
                                    </Text>
                                </View>
                                <View style={styles.separator} />
                                <View style={styles.infoBottom}>
                                    <Text style={styles.challengeDetails}>
                                        Pace: {item.pace}
                                    </Text>
                                    <Text style={styles.challengeDetails}>
                                        Duration: {item.duration}
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
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#000",
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#222",
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
        justifyContent: "space-around",
        backgroundColor: "#333",
        paddingVertical: 10,
        borderRadius: 10,
        marginBottom: 10,
    },
    filterButton: {
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    activeFilter: {
        backgroundColor: "#fff",
    },
    filterText: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "bold",
    },
    activeFilterText: {
        color: "#000",
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
});

export default ChallengeScreen;
