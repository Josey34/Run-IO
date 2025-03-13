import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Image,
    NativeScrollEvent,
    NativeSyntheticEvent,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import useFetch from "../hooks/useFetch";
import globalStyles from "../styles/global_styles"; // Import globalStyles

interface Article {
    title: string;
    description?: string;
    urlToImage?: string;
    source: { name: string };
}

const HomeScreen = () => {
    const router = useRouter();
    const [latitude, setLatitude] = useState<number | undefined>(0);
    const [longitude, setLongitude] = useState<number | undefined>(0);
    const [locationError, setLocationError] = useState<string | null>(null);
    const { data, weather, loading, error } = useFetch<Article[]>(
        "sports",
        true,
        latitude,
        longitude
    );
    const [visibleNews, setVisibleNews] = useState(2);

    useEffect(() => {
        const getLocation = async () => {
            try {
                const { status } =
                    await Location.requestForegroundPermissionsAsync();
                if (status !== "granted") {
                    setLocationError(
                        "Permission to access location was denied."
                    );
                    return;
                }

                const location = await Location.getCurrentPositionAsync({});
                setLatitude(location.coords.latitude);
                setLongitude(location.coords.longitude);
            } catch (error) {
                setLocationError("Unable to retrieve location.");
            }
        };

        getLocation();
    }, []);

    // Function to load more articles when user scrolls down
    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const { layoutMeasurement, contentOffset, contentSize } =
            event.nativeEvent;

        // If user scrolls near the bottom, load more articles
        if (
            layoutMeasurement.height + contentOffset.y >=
            contentSize.height - 20
        ) {
            setVisibleNews((prev) => Math.min(prev + 2, data.length));
        }
    };

    return (
        <View style={globalStyles.container}>
            {" "}
            {/* Use global style here */}
            <ScrollView
                showsVerticalScrollIndicator={false}
                onScroll={handleScroll}
                scrollEventThrottle={400}
            >
                {/* Header Section */}
                <View style={globalStyles.header}>
                    <Text style={globalStyles.welcome}>Welcome</Text>
                    <Image
                        source={require("../assets/images/running.jpg")}
                        style={globalStyles.profileImage}
                    />
                </View>

                <View style={globalStyles.card}>
                    <Text style={globalStyles.greeting}>Hi, User 👋</Text>
                    <Text style={globalStyles.subGreeting}>
                        Let's see your progress
                    </Text>
                </View>

                {/* Running Section */}
                <View style={globalStyles.runContainer}>
                    <View>
                        <Text style={globalStyles.runTitle}>Today's Run</Text>
                        <Text style={globalStyles.runDistance}>0 Km</Text>
                    </View>
                    <Image
                        source={require("../assets/images/running.jpg")}
                        style={globalStyles.mapImage}
                    />
                </View>

                {/* Weather Section */}
                <View style={globalStyles.weatherContainer}>
                    {loading ? (
                        <ActivityIndicator size="large" color="#1e90ff" />
                    ) : error ? (
                        <Text style={globalStyles.errorText}>
                            Error: {error}
                        </Text>
                    ) : locationError ? (
                        <Text style={globalStyles.errorText}>
                            {locationError}
                        </Text>
                    ) : weather ? (
                        <>
                            <Text style={globalStyles.weatherTemp}>
                                {(weather.temp - 273.15).toFixed(1)} °C
                            </Text>
                            <Text style={globalStyles.weatherDate}>
                                {weather.weather[0].description}
                            </Text>
                        </>
                    ) : (
                        <Text style={globalStyles.errorText}>
                            No weather data available
                        </Text>
                    )}
                </View>

                {/* News Section */}
                <View style={globalStyles.newsContainer}>
                    <Text style={globalStyles.newsTitle}>
                        Latest Sports News
                    </Text>

                    {loading ? (
                        <ActivityIndicator size="large" color="#1e90ff" />
                    ) : error ? (
                        <Text style={globalStyles.errorText}>
                            Error: {error}
                        </Text>
                    ) : data.length > 0 ? (
                        <FlatList
                            data={data.slice(0, visibleNews)}
                            keyExtractor={(item, index) => index.toString()}
                            renderItem={({ item }) => (
                                <View style={globalStyles.newsItem}>
                                    {item.urlToImage && (
                                        <Image
                                            source={{ uri: item.urlToImage }}
                                            style={globalStyles.newsImage}
                                        />
                                    )}
                                    <View>
                                        <Text style={globalStyles.newsHeadline}>
                                            {item.title}
                                        </Text>
                                        <Text style={globalStyles.newsSource}>
                                            Source:{" "}
                                            {item.source?.name || "Unknown"}
                                        </Text>
                                        <Text style={globalStyles.newsText}>
                                            {item.description ||
                                                "No description available"}
                                        </Text>
                                    </View>
                                </View>
                            )}
                        />
                    ) : (
                        <Text style={globalStyles.errorText}>
                            No articles available
                        </Text>
                    )}
                </View>

                {/* Navigation Button */}
                <TouchableOpacity
                    style={globalStyles.button}
                    onPress={() => router.push("/(auth)/welcome_screen")}
                >
                    <Text style={globalStyles.buttonText}>
                        Go to Welcome Screen
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
};

export default HomeScreen;
