// globalStyles.ts
import { StyleSheet } from "react-native";

const globalStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#000",
        padding: 20,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 15,
    },
    profileImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    welcome: {
        fontSize: 24,
        color: "#fff",
        fontWeight: "bold",
    },
    card: {
        backgroundColor: "#fff",
        borderRadius: 10,
        padding: 15,
        marginBottom: 20,
    },
    greeting: {
        fontSize: 20,
        fontWeight: "bold",
    },
    subGreeting: {
        fontSize: 16,
    },
    runContainer: {
        backgroundColor: "#fff",
        borderRadius: 10,
        paddingLeft: 40,
        marginBottom: 20,
        flexDirection: "row",  // Placing map and text side by side
        justifyContent: "space-between",  // Ensures space between text and map
        alignItems: "center",
    },
    runTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#333",
    },
    runDistance: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 10, // Added a bit of space below the distance
    },
    mapContainer: {
        width: "50%",  // Map takes 50% of the width
        height: 120,  // Adjusted height for a more compact map
        borderRadius: 10,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "#dcdcdc",  // Light border color for the map container
        backgroundColor: "#fff",
        alignItems: 'center',
    },
    mapView: {
        width: "100%",
        height: "100%",
        borderRadius: 10,
    },
    rowContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 20,
    },
    weatherComingSoonContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 20,
    },
    weatherContainer: {
        backgroundColor: "#fff",
        borderRadius: 10,
        padding: 15,
        alignItems: "center",
        flex: 1,
        marginRight: 10,
    },
    weatherTemp: {
        fontSize: 32,
        fontWeight: "bold",
    },
    weatherDate: {
        fontSize: 14,
    },
    weatherIcon: {
        width: 64,
        height: 64,
    },
    weatherCity: {
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 8,
    },
    comingSoon: {
        backgroundColor: "#fff",
        borderRadius: 10,
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 15,
        fontWeight: "bold",
    },
    comingSoonText: {
        fontSize: 16,
        fontWeight: "bold",
    },
    newsContainer: {
        backgroundColor: "#fff",
        borderRadius: 10,
        padding: 15,
        marginBottom: 20,
    },
    newsTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 10,
    },
    newsItem: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
    },
    newsImage: {
        width: 80,
        height: 80,
        borderRadius: 10,
        marginRight: 10,
    },
    newsHeadline: {
        fontSize: 16,
        fontWeight: "bold",
    },
    newsText: {
        fontSize: 14,
        color: "#666",
    },
    newsSource: {
        fontSize: 14,
        color: "#888",
    },
    errorText: {
        fontSize: 16,
        color: "red",
        textAlign: "center",
        marginVertical: 10,
    },
    button: {
        backgroundColor: "#1e90ff",
        padding: 15,
        borderRadius: 10,
        alignItems: "center",
        marginTop: 10,
    },
    buttonText: {
        fontSize: 16,
        color: "#fff",
        fontWeight: "bold",
    },
});

export default globalStyles;
