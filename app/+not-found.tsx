import { StyleSheet, Text, View } from "react-native";

export default function NotFound() {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>404 - Not Found</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    text: {
        fontSize: 24,
        fontWeight: "bold",
    },
});
