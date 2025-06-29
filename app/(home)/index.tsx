import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Animated,
    Image,
    Linking,
    NativeScrollEvent,
    NativeSyntheticEvent,
    RefreshControl,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { useAuth } from "../../hooks/useAuth";
import useFetch from "../../hooks/useFetch";
import CustomButton from "../components/CustomButton";
import globalStyles from "../styles/global_styles";

interface Article {
    title: string;
    description?: string;
    urlToImage?: string;
    source?: { name: string };
    url?: string;
}

interface Run {
    distance: number;
    createdAt: string;
}

const HomeScreen = () => {
    const router = useRouter();
    const { user, logout } = useAuth();
    const [latitude, setLatitude] = useState<number | undefined>(0);
    const [longitude, setLongitude] = useState<number | undefined>(0);
    const [locationError, setLocationError] = useState<string | null>(null);
    const { data, weather, loading, error, refetch } = useFetch<Article[]>(
        "sports",
        true,
        latitude,
        longitude
    );
    const [visibleNews, setVisibleNews] = useState(2);
    const [refreshing, setRefreshing] = useState(false);
    const { fetchRun } = useFetch<Run[]>("");
    const [todayDistance, setTodayDistance] = useState(0);

    // Add animation values
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    const weatherAnim = useRef(new Animated.Value(0)).current;
    const newsAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Sequence of animations
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.sequence([
                Animated.delay(400),
                Animated.timing(weatherAnim, {
                    toValue: 1,
                    duration: 800,
                    useNativeDriver: true,
                }),
            ]),
            Animated.sequence([
                Animated.delay(800),
                Animated.timing(newsAnim, {
                    toValue: 1,
                    duration: 800,
                    useNativeDriver: true,
                }),
            ]),
        ]).start();

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
        loadTodayRuns();
        getLocation();
    }, []);

    const loadTodayRuns = async () => {
        if (!user?.uid) return;

        try {
            const runs = await fetchRun(user.uid);
            if (runs && Array.isArray(runs)) {
                const today = new Date().toISOString().split("T")[0];

                const todayRuns = runs.filter((run) => {
                    const runDate = new Date(run.createdAt)
                        .toISOString()
                        .split("T")[0];
                    return runDate === today;
                });

                const totalDistance = todayRuns.reduce(
                    (sum, run) => sum + (run.distance || 0),
                    0
                );

                setTodayDistance(Number(totalDistance.toFixed(2)));
            }
        } catch (error) {
            console.error("Error loading today's runs:", error);
        }
    };

    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const { layoutMeasurement, contentOffset, contentSize } =
            event.nativeEvent;

        if (
            layoutMeasurement.height + contentOffset.y >=
            contentSize.height - 20
        ) {
            setVisibleNews((prev) => Math.min(prev + 2, data.length));
        }
    };

    const resetAndPlayAnimations = () => {
        // Reset all animations to initial values
        fadeAnim.setValue(0);
        slideAnim.setValue(50);
        weatherAnim.setValue(0);
        newsAnim.setValue(0);

        // Play animations again
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.sequence([
                Animated.delay(400),
                Animated.timing(weatherAnim, {
                    toValue: 1,
                    duration: 800,
                    useNativeDriver: true,
                }),
            ]),
            Animated.sequence([
                Animated.delay(800),
                Animated.timing(newsAnim, {
                    toValue: 1,
                    duration: 800,
                    useNativeDriver: true,
                }),
            ]),
        ]).start();
    };

    const onRefresh = async () => {
        setRefreshing(true);
        try {
            await refetch();
            resetAndPlayAnimations();

            if (user?.uid) {
                const runs = await fetchRun(user.uid);
                if (runs && Array.isArray(runs)) {
                    const today = new Date().toISOString().split("T")[0];
                    const todayRuns = runs.filter((run) => {
                        const runDate = new Date(run.createdAt)
                            .toISOString()
                            .split("T")[0];
                        return runDate === today;
                    });
                    const totalDistance = todayRuns.reduce(
                        (sum, run) => sum + (run.distance || 0),
                        0
                    );
                    setTodayDistance(Number(totalDistance.toFixed(2)));
                }
            }
        } catch (error) {
            console.error("Error refreshing data:", error);
        } finally {
            setRefreshing(false);
        }
    };

    const getTimeFromLocalTime = (localtime: string) => {
        const time = localtime.split(" ")[1];
        return time;
    };

    const handleLogout = () => {
        logout();
        router.replace("/(auth)/login_screen");
    };

    const handlePress = (url: string) => {
        Linking.openURL(url);
    };

    return (
        <View style={globalStyles.container}>
            <ScrollView
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                    />
                }
                showsVerticalScrollIndicator={false}
                onScroll={handleScroll}
                scrollEventThrottle={400}
            >
                <Animated.View
                    style={[
                        globalStyles.header,
                        {
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }],
                        },
                    ]}
                >
                    <Text style={globalStyles.welcome}>Welcome</Text>
                </Animated.View>

                <Animated.View
                    style={[
                        globalStyles.card,
                        {
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }],
                        },
                    ]}
                >
                    <Text style={globalStyles.greeting}>Hi, User 👋</Text>
                    <Text style={globalStyles.subGreeting}>
                        Let's see your progress
                    </Text>
                </Animated.View>

                <Animated.View
                    style={[
                        globalStyles.runContainer,
                        {
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }],
                        },
                    ]}
                >
                    <View>
                        <Text style={globalStyles.runTitle}>Today's Run</Text>
                        <Text style={globalStyles.runDistance}>
                            {todayDistance} Km{" "}
                        </Text>
                    </View>
                    {latitude && longitude ? (
                        <View style={globalStyles.mapContainer}>
                            <MapView
                                style={globalStyles.mapView}
                                initialRegion={{
                                    latitude: latitude,
                                    longitude: longitude,
                                    latitudeDelta: 0.01,
                                    longitudeDelta: 0.01,
                                }}
                            >
                                <Marker
                                    coordinate={{
                                        latitude: latitude,
                                        longitude: longitude,
                                    }}
                                    title={"Your Location"}
                                />
                            </MapView>
                        </View>
                    ) : (
                        <ActivityIndicator size="large" color="#1e90ff" />
                    )}
                </Animated.View>
                <Animated.View
                    style={[
                        globalStyles.weatherComingSoonContainer,
                        { opacity: weatherAnim },
                    ]}
                >
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
                                <View style={globalStyles.weatherSection}>
                                    <Image
                                        source={{
                                            uri: `https:${weather.current.condition.icon}`,
                                        }}
                                        style={globalStyles.weatherIcon}
                                    />
                                    <View>
                                        <Text style={globalStyles.weatherTemp}>
                                            {weather.current.temp_c} °C
                                        </Text>
                                        <Text style={globalStyles.weatherText}>
                                            {weather.current.condition.text}
                                        </Text>
                                    </View>
                                </View>
                                <Text style={globalStyles.weatherCity}>
                                    {weather.location.name}
                                </Text>
                                <Text style={globalStyles.weatherDate}>
                                    {getTimeFromLocalTime(
                                        weather.location.localtime
                                    )}
                                </Text>
                            </>
                        ) : (
                            <Text style={globalStyles.errorText}>
                                No weather data available
                            </Text>
                        )}
                    </View>
                    <View style={globalStyles.comingSoon}>
                        <Text>Coming Soon</Text>
                    </View>
                </Animated.View>

                <Animated.View
                    style={[globalStyles.newsContainer, { opacity: newsAnim }]}
                >
                    <Text style={globalStyles.newsTitle}>
                        Latest Sports News
                    </Text>

                    <ScrollView
                        nestedScrollEnabled
                        onScroll={handleScroll}
                        scrollEventThrottle={400}
                        style={{ maxHeight: 400 }}
                    >
                        {loading ? (
                            <ActivityIndicator size="large" color="#1e90ff" />
                        ) : error ? (
                            <Text style={globalStyles.errorText}>
                                Error: {error}
                            </Text>
                        ) : (
                            data.slice(0, visibleNews).map((item, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={globalStyles.newsItem}
                                    onPress={() => handlePress(item.url)}
                                >
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
                                </TouchableOpacity>
                            ))
                        )}
                    </ScrollView>
                </Animated.View>

                <Animated.View style={{ opacity: newsAnim }}>
                    <CustomButton
                        title="Logout"
                        onPress={handleLogout}
                        style={{ backgroundColor: "#FF0000" }}
                    />
                    <TouchableOpacity
                        style={globalStyles.button}
                        onPress={() => router.push("/(auth)/form_data_screen")}
                    >
                        <Text style={globalStyles.buttonText}>
                            Go Form Data
                        </Text>
                    </TouchableOpacity>
                </Animated.View>
            </ScrollView>
        </View>
    );
};

export default HomeScreen;
