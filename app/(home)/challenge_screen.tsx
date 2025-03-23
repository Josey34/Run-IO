import { FontAwesome5 } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SceneMap, TabView } from "react-native-tab-view"; // Import TabView and SceneMap
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
    const [index, setIndex] = useState(0); // To manage selected tab index
    const [routes] = useState([
        { key: "all", title: "All" },
        { key: "ongoing", title: "On Going" },
        { key: "completed", title: "Completed" },
    ]);

    useEffect(() => {
        fetchFromBackend();
    }, []);

    const filteredChallenges = challenges.filter((challenge) => {
        if (index === 0) return true;
        return index === 1 ? !challenge.completed : challenge.completed;
    });

    const FirstRoute = () => (
        <FlatList
            data={filteredChallenges}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
                <View style={{ flexDirection: "row", marginBottom: 20 }}>
                    <View style={styles.challengeItem}>
                        <View style={styles.iconContainer}>
                            <FontAwesome5
                                name="running"
                                size={20}
                                color="#FFF"
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
    );

    const SecondRoute = () => (
        <FlatList
            data={filteredChallenges}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
                <View style={{ flexDirection: "row", marginBottom: 20 }}>
                    <View style={styles.challengeItem}>
                        <View style={styles.iconContainer}>
                            <FontAwesome5
                                name="running"
                                size={20}
                                color="#FFF"
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
    );

    const ThirdRoute = () => (
        <FlatList
            data={filteredChallenges}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
                <View style={{ flexDirection: "row", marginBottom: 20 }}>
                    <View style={styles.challengeItem}>
                        <View style={styles.iconContainer}>
                            <FontAwesome5
                                name="running"
                                size={20}
                                color="#FFF"
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
    );

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

            {/* Tab View for Filter Buttons */}
            <TabView
                navigationState={{ index, routes }}
                renderScene={SceneMap({
                    all: FirstRoute,
                    ongoing: SecondRoute,
                    completed: ThirdRoute,
                })}
                onIndexChange={setIndex}
                initialLayout={{ width: 300 }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#1A1A1A", // Dark background
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
        backgroundColor: "#007bff", // Icon background color
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
        backgroundColor: "#007bff",
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
