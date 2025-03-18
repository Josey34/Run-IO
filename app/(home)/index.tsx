import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Image,
    NativeScrollEvent,
    NativeSyntheticEvent,
    RefreshControl,
    ScrollView,
    Text,
    View,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import CustomButton from "../components/CustomButton";
import { useAuth } from "../hooks/useAuth";
import useFetch from "../hooks/useFetch";
import globalStyles from "../styles/global_styles";

interface Article {
    title: string;
    description?: string;
    urlToImage?: string;
    source: { name: string };
}

const HomeScreen = () => {
    const router = useRouter();
    const { logout } = useAuth();
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

    const onRefresh = async () => {
        setRefreshing(true);
        await refetch();
        setRefreshing(false);
    };

    const getTimeFromLocalTime = (localtime: string) => {
        const time = localtime.split(" ")[1];
        return time;
    };

    const handleLogout = () => {
        logout();
        router.replace("/(auth)/login_screen");
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
                </View>
                <View style={globalStyles.weatherComingSoonContainer}>
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
                </View>

                <View style={globalStyles.newsContainer}>
                    <Text style={globalStyles.newsTitle}>
                        Latest Sports News
                    </Text>

                    <ScrollView
                        nestedScrollEnabled
                        onScroll={handleScroll}
                        scrollEventThrottle={400}
                        style={{ maxHeight: 400 }} // Adjust the height as needed
                    >
                        {loading ? (
                            <ActivityIndicator size="large" color="#1e90ff" />
                        ) : error ? (
                            <Text style={globalStyles.errorText}>
                                Error: {error}
                            </Text>
                        ) : (
                            data.slice(0, visibleNews).map((item, index) => (
                                <View key={index} style={globalStyles.newsItem}>
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
                            ))
                        )}
                    </ScrollView>
                </View>

                {/* Logout Button */}
                <CustomButton
                    title="Logout"
                    onPress={handleLogout}
                    style={{ backgroundColor: "#FF0000" }}
                />
            </ScrollView>
        </View>
    );
};

export default HomeScreen;
