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
        backgroundColor: "#333",
        padding: 20,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
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
        flexDirection: "row",
        justifyContent: "space-between",
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
        marginBottom: 10,
    },
    mapContainer: {
        width: "50%",
        height: 120,
        borderRadius: 10,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "#dcdcdc",
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
        borderRadius: 15,
        padding: 20,
        alignItems: "center",
        flex: 1,
        marginRight: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
    },
    weatherTemp: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#000",
    },
    weatherDate: {
        fontSize: 14,
        color: "#777",
    },
    weatherIcon: {
        width: 60,
        height: 60,
    },
    weatherCity: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 8,
        color: "#000",
    },
    weatherSection: {
        flexDirection: "row",
        alignItems: "center",
    },
    weatherText: {
        fontSize: 14,
        color: "#666",
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
