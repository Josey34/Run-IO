import { useRouter } from "expo-router";
import {
    ImageBackground,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function WelcomeScreen() {
    const router = useRouter();

    return (
        <ImageBackground
            source={require("../assets/images/running.jpg")}
            style={styles.background}
            resizeMode="cover"
        >
            <Text style={styles.title}>RUN-IO</Text>
            <View style={styles.container}>
                <Text style={styles.description}>
                    Running is like a box of chocolates. You never know what
                    you're gonna get.
                </Text>
                <TouchableOpacity
                    testID="start-running-button"
                    style={styles.button}
                    onPress={() => router.push("/(auth)/login_screen")}
                >
                    <Text style={styles.buttonText}>Start Running</Text>
                </TouchableOpacity>
            </View>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    background: {
        flex: 1,
    },
    container: {
        flex: 1,
        justifyContent: "space-between",
        alignItems: "center",
        paddingBottom: 50,
    },
    title: {
        fontSize: 24,
        color: "black",
        textAlign: "center",
        marginTop: 100,
        fontWeight: "bold",
        padding: 15,
    },
    button: {
        backgroundColor: "#ffffff",
        padding: 15,
        borderRadius: 15,
        width: "80%",
        alignItems: "center",
    },
    buttonText: {
        color: "#000000",
        fontSize: 18,
        fontWeight: "bold",
    },
    description: {
        color: "black",
        textAlign: "center",
        padding: 15,
    },
});
