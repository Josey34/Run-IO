import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

const Loading = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Loading...</Text>
            <ActivityIndicator size="large" color="#007AFF" />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff",
    },
    title: {
        fontSize: 24,
        marginBottom: 20,
    },
});

export default Loading;
