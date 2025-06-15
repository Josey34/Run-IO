import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { Pedometer } from "expo-sensors";
import React, { useEffect, useRef, useState } from "react";
import {
    Animated,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import { mapStyle } from "../../constants/Map";
import { useAuth } from "../../hooks/useAuth";
import useFetch from "../../hooks/useFetch";
import { ErrorModalEmitter } from "../api/api_service";
import WorkoutCompleteModal from "../components/WorkoutCompleteModal";
import { haversineDistance } from "../utils/distanceCalculations";
import { calculatePaceFromTimeAndDistance, formatDuration } from "../utils/paceCalculations";
import { formatDateTime, formatLocalTime } from "../utils/timeFormat";

const MIN_DISTANCE_FOR_PACE = 0.001; // 1 meter in kilometers
const MIN_TOTAL_DISTANCE = 0.01; // 10 meters before showing average pace
const MAX_VALID_PACE = 30; // Maximum valid pace in min/km
const MIN_VALID_PACE = 1; // Minimum valid pace in min/km
const GPS_ACCURACY_THRESHOLD = 20; // meters
const LOCATION_UPDATE_INTERVAL = 1000; // 1 second
const PACE_AVERAGE_WINDOW = 5; // Number of readings for rolling average
const UPDATE_INTERVAL = 5000; // Update average pace every 5 seconds

interface WorkoutStats {
    currentSpeed: number;
    averageSpeed: number;
    distance: number;
    duration: number;
    startTime: string;
    rawStartTime: string;
    lastAverageUpdate: number;
}

interface RouteCoordinate {
    latitude: number;
    longitude: number;
    timestamp?: string;
}

const calculateSpeed = (
    timeInSeconds: number,
    distanceInKm: number
): number => {
    if (distanceInKm < MIN_DISTANCE_FOR_PACE || timeInSeconds === 0) return 0;
    return (distanceInKm / timeInSeconds) * 3600;
};

const calculateAverageSpeed = (
    distanceKm: number,
    timeSeconds: number
): number => {
    if (!distanceKm || timeSeconds === 0) return 0;
    return (distanceKm / timeSeconds) * 3600;
};

const calculateCurrentPace = (
    timeInSeconds: number,
    distanceInKm: number
): string => {
    if (distanceInKm < MIN_DISTANCE_FOR_PACE) return "--:--";
    
    const pace = calculatePaceFromTimeAndDistance(timeInSeconds, distanceInKm);
    
    const paceSeconds = timeInSeconds / distanceInKm;
    const paceMinutes = paceSeconds / 60;
    
    if (paceMinutes > MAX_VALID_PACE || paceMinutes < MIN_VALID_PACE) {
        return "--:--";
    }
    
    return pace;
};

const getRouteEndpoints = (coordinates: RouteCoordinate[]): RouteCoordinate[] => {
    if (coordinates.length < 2) return coordinates;
    
    return [
        {
            ...coordinates[0],
            latitude: Number(coordinates[0].latitude.toFixed(6)),
            longitude: Number(coordinates[0].longitude.toFixed(6)),
            timestamp: coordinates[0].timestamp
        },
        {
            ...coordinates[coordinates.length - 1],
            latitude: Number(coordinates[coordinates.length - 1].latitude.toFixed(6)),
            longitude: Number(coordinates[coordinates.length - 1].longitude.toFixed(6)),
            timestamp: coordinates[coordinates.length - 1].timestamp
        }
    ];
};

const RunningScreen = () => {
    const { user } = useAuth();
    const [isTracking, setIsTracking] = useState(false);
    const [location, setLocation] =
        useState<Location.LocationObjectCoords | null>(null);
    const [workoutStats, setWorkoutStats] = useState<WorkoutStats>({
        currentSpeed: 0,
        averageSpeed: 0,
        distance: 0,
        duration: 0,
        startTime: formatLocalTime(new Date()),
        rawStartTime: new Date().toISOString(),
        lastAverageUpdate: Date.now(),
    });
    const [routeCoordinates, setRouteCoordinates] = useState<RouteCoordinate[]>(
        []
    );
    const [region, setRegion] = useState<any>(null);
    const [showCompleteModal, setShowCompleteModal] = useState(false);
    const [workoutCompleteData, setWorkoutCompleteData] = useState({
        startTime: "",
        endTime: "",
        distance: 0,
        duration: "",
        averagePace: "",
        averageSpeed: 0,
    });
    const { saveRun, saving } = useFetch("");

    const mapRef = useRef<MapView>(null);
    const locationSubscription = useRef<Location.LocationSubscription | null>(
        null
    );
    const pedometerSubscription = useRef<Pedometer.Subscription | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const startTimeRef = useRef<number | null>(null);
    const lastLocationRef = useRef<Location.LocationObjectCoords | null>(null);
    const lastUpdateTimeRef = useRef<number | null>(null);
    const speedReadings = useRef<number[]>([]);

    const router = useRouter();

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(20)).current;

    const updateWorkoutStats = (
        newLocation: Location.LocationObjectCoords,
        currentTime: number
    ) => {
        if (
            !lastLocationRef.current ||
            !lastUpdateTimeRef.current ||
            !startTimeRef.current
        ) {
            lastLocationRef.current = newLocation;
            lastUpdateTimeRef.current = currentTime;
            return;
        }

        const timeElapsed = (currentTime - lastUpdateTimeRef.current) / 1000;
        if (timeElapsed < 1) return;

        const newDistance = haversineDistance(
            lastLocationRef.current,
            newLocation
        );
        const totalDuration = (currentTime - startTimeRef.current) / 1000;

        let currentSpeed = 0;
        if (newDistance >= MIN_DISTANCE_FOR_PACE && newDistance < 0.1) {
            currentSpeed = calculateSpeed(timeElapsed, newDistance);
        } else {
            const lastSpeed =
                speedReadings.current[speedReadings.current.length - 1] || 0;
            currentSpeed = Math.max(0, lastSpeed * 0.8);
        }

        if (speedReadings.current.length > 0 || currentSpeed > 0) {
            speedReadings.current.push(currentSpeed);
            if (speedReadings.current.length > PACE_AVERAGE_WINDOW) {
                speedReadings.current.shift();
            }
        }

        setWorkoutStats((prev) => {
            const updatedDistance = prev.distance + newDistance;
            const smoothCurrentSpeed =
                speedReadings.current.length > 0
                    ? speedReadings.current.reduce((a, b) => a + b) /
                      speedReadings.current.length
                    : 0;

            const shouldUpdateAverage =
                currentTime - prev.lastAverageUpdate >= UPDATE_INTERVAL;
            const averageSpeed = shouldUpdateAverage
                ? calculateAverageSpeed(updatedDistance, totalDuration)
                : prev.averageSpeed;

            return {
                ...prev,
                currentSpeed: Number(smoothCurrentSpeed.toFixed(1)),
                averageSpeed: shouldUpdateAverage
                    ? Number(averageSpeed.toFixed(1))
                    : prev.averageSpeed,
                distance: updatedDistance,
                duration: totalDuration,
                lastAverageUpdate: shouldUpdateAverage
                    ? currentTime
                    : prev.lastAverageUpdate,
            };
        });

        lastLocationRef.current = newLocation;
        lastUpdateTimeRef.current = currentTime;
    };

    const startTracking = async () => {
        try {
            const { status } =
                await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") {
                ErrorModalEmitter.emit(
                    "SHOW_ERROR",
                    "Location permission is required to track your run."
                );
                return;
            }

            const now = new Date();
            const formattedStartTime = formatLocalTime(now);

            setWorkoutStats((prev) => ({
                ...prev,
                currentSpeed: 0,
                averageSpeed: 0,
                currentPace: 0,
                averagePace: 0,
                distance: 0,
                duration: 0,
                steps: 0,
                startTime: formattedStartTime,
                rawStartTime: now.toISOString(),
                lastAverageUpdate: Date.now(),
            }));

            setRouteCoordinates([]);
            speedReadings.current = [];
            startTimeRef.current = Date.now();
            lastUpdateTimeRef.current = Date.now();
            lastLocationRef.current = null;

            const pedometerAvailable = await Pedometer.isAvailableAsync();
            if (pedometerAvailable) {
                pedometerSubscription.current = Pedometer.watchStepCount(
                    (result) => {
                        setWorkoutStats((prev) => ({
                            ...prev,
                            steps: result.steps,
                        }));
                    }
                );
            }

            locationSubscription.current = await Location.watchPositionAsync(
                {
                    accuracy: Location.Accuracy.BestForNavigation,
                    timeInterval: LOCATION_UPDATE_INTERVAL,
                    distanceInterval: 1,
                },
                (newLocation) => {
                    if (
                        newLocation.coords.accuracy != null &&
                        newLocation.coords.accuracy <= GPS_ACCURACY_THRESHOLD
                    ) {
                        setLocation(newLocation.coords);
                        setRouteCoordinates((prev) => [
                            ...prev,
                            {
                                latitude: newLocation.coords.latitude,
                                longitude: newLocation.coords.longitude,
                                timestamp: formatDateTime(new Date()),
                            },
                        ]);
                        updateWorkoutStats(newLocation.coords, Date.now());

                        setRegion({
                            latitude: newLocation.coords.latitude,
                            longitude: newLocation.coords.longitude,
                            latitudeDelta: 0.005,
                            longitudeDelta: 0.005,
                        });
                    }
                }
            );

            timerRef.current = setInterval(() => {
                if (startTimeRef.current) {
                    const duration = (Date.now() - startTimeRef.current) / 1000;
                    setWorkoutStats((prev) => ({
                        ...prev,
                        duration,
                    }));
                }
            }, 1000);

            setIsTracking(true);
        } catch (error) {
            ErrorModalEmitter.emit(
                "SHOW_ERROR",
                "Failed to start tracking. Please try again."
            );
        }
    };

    const stopTracking = async () => {
        if (!user?.uid) {
            ErrorModalEmitter.emit(
                "SHOW_ERROR",
                "Please log in to save your runs"
            );
            return;
        }

        locationSubscription.current?.remove();
        pedometerSubscription.current?.remove();
        if (timerRef.current) clearInterval(timerRef.current);
        setIsTracking(false);

        if (workoutStats.distance > 0) {
            const now = new Date();
            const endTime = formatLocalTime(now);

            const timeElapsed = formatDuration(workoutStats.duration);


            const workoutData = {
                startTime: workoutStats.startTime,
                endTime: endTime,
                timeElapsed: timeElapsed,
                duration: formatDuration(workoutStats.duration),

                distance: Number(workoutStats.distance.toFixed(2)),
                speed: workoutStats.currentSpeed,
                currentSpeed: Number(workoutStats.currentSpeed.toFixed(1)),
                averageSpeed: calculateAverageSpeed(
                    workoutStats.distance,
                    workoutStats.duration
                ),

                currentPace: calculateCurrentPace(
                    workoutStats.duration,
                    workoutStats.distance
                ),
                averagePace: calculateCurrentPace(
                    workoutStats.duration,
                    workoutStats.distance
                ),
                steps: 1,
                route: getRouteEndpoints(routeCoordinates).map(coord => ({
                    latitude: Number(coord.latitude.toFixed(6)),
                    longitude: Number(coord.longitude.toFixed(6)),
                    timestamp: formatDateTime(new Date(coord.timestamp || Date.now()))
                })),
            };
            
            setWorkoutCompleteData(workoutData);
            setShowCompleteModal(true);

            try {
                await saveRun(user.uid, workoutData);
            } catch (error) {
                ErrorModalEmitter.emit(
                    "SHOW_ERROR",
                    "Failed to save workout data. Please try again."
                );
            }
        }
    };

    const onUserLocationChange = (event: any) => {
        const { latitude, longitude } = event.nativeEvent.coordinate;
        const newRegion = {
            latitude,
            longitude,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
        };

        setRegion(newRegion);
        mapRef.current?.animateToRegion(newRegion, 1000);
    };

    const animateStats = () => {
        fadeAnim.setValue(0);
        slideAnim.setValue(20);

        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 500,
                useNativeDriver: true,
            }),
        ]).start();
    };

    useEffect(() => {
        return () => {
            locationSubscription.current?.remove();
            pedometerSubscription.current?.remove();
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    useEffect(() => {
        animateStats();
    }, []);

    return (
        <View style={styles.container}>
            <MapView
                ref={mapRef}
                style={styles.map}
                region={region}
                customMapStyle={mapStyle}
                showsUserLocation={true}
                followsUserLocation={true}
                showsMyLocationButton={true}
                showsCompass={true}
                showsScale={true}
                onUserLocationChange={onUserLocationChange}
                mapPadding={{ top: 100, right: 0, bottom: 0, left: 0 }}
            >
                {routeCoordinates.length > 1 && (
                    <>
                        <Polyline
                            coordinates={routeCoordinates}
                            strokeColor="#FF4B4B"
                            strokeWidth={4}
                            lineDashPattern={[0]}
                        />
                        <Marker coordinate={routeCoordinates[0]} title="Start">
                            <View style={styles.markerStart}>
                                <MaterialIcons
                                    name="trip-origin"
                                    size={24}
                                    color="#4CAF50"
                                />
                            </View>
                        </Marker>
                        {routeCoordinates.length > 2 && (
                            <Marker
                                coordinate={
                                    routeCoordinates[
                                        routeCoordinates.length - 1
                                    ]
                                }
                                title="Current"
                            >
                                <View style={styles.markerCurrent}>
                                    <MaterialIcons
                                        name="location-on"
                                        size={24}
                                        color="#FF4B4B"
                                    />
                                </View>
                            </Marker>
                        )}
                    </>
                )}
            </MapView>

            <Animated.View
                style={[
                    styles.statsContainer,
                    {
                        opacity: fadeAnim,
                        transform: [{ translateY: slideAnim }],
                    },
                ]}
            >
                <View style={styles.statRow}>
                    <View style={styles.statItem}>
                        <View style={styles.iconContainer}>
                            <MaterialIcons
                                name="directions-run"
                                size={20}
                                color="#fff"
                            />
                        </View>
                        <View style={styles.statValueContainer}>
                            <Text style={styles.statValue}>
                                {workoutStats.distance.toFixed(1)}
                            </Text>
                            <Text style={styles.statUnit}>Km</Text>
                        </View>
                        <Text style={styles.statLabel}>Distance</Text>
                    </View>
                    <View style={styles.statItem}>
                        <View style={styles.iconContainer}>
                            <MaterialIcons
                                name="timer"
                                size={20}
                                color="#fff"
                            />
                        </View>
                        <View style={styles.statValueContainer}>
                            <Text style={styles.statValue}>
                                {formatDuration(workoutStats.duration)}
                            </Text>
                        </View>
                        <Text style={styles.statLabel}>Duration</Text>
                    </View>
                    <View style={styles.statItem}>
                        <View style={styles.iconContainer}>
                            <MaterialIcons
                                name="speed"
                                size={20}
                                color="#fff"
                            />
                        </View>
                        <View style={styles.statValueContainer}>
                            <Text style={styles.statValue}>
                                {workoutStats.currentSpeed.toFixed(1)}
                            </Text>
                            <Text style={styles.statUnit}>km/h</Text>
                        </View>
                        <Text style={styles.statLabel}>Speed</Text>
                    </View>
                </View>
            </Animated.View>

            <TouchableOpacity
                style={[
                    styles.fab,
                    { backgroundColor: isTracking ? "#FF4B4B" : "#7F8CAA" },
                ]}
                onPress={() => (isTracking ? stopTracking() : startTracking())}
            >
                <FontAwesome5
                    name={isTracking ? "stop" : "play"}
                    size={24}
                    color="white"
                />
            </TouchableOpacity>

            <WorkoutCompleteModal
                visible={showCompleteModal}
                onClose={() => setShowCompleteModal(false)}
                workoutData={workoutCompleteData}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#333446",
    },
    map: {
        flex: 1,
    },
    statsContainer: {
        position: "absolute",
        top: 50,
        left: 16,
        right: 16,
        backgroundColor: "#7F8CAA",
        borderRadius: 15,
        padding: 15,
    },
    statRow: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    statItem: {
        flex: 1,
        alignItems: "center",
        paddingHorizontal: 8,
    },
    iconContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: "#B8CFCE",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 4,
    },
    statValueContainer: {
        flexDirection: "row",
        alignItems: "baseline",
        marginVertical: 4,
    },
    statValue: {
        color: "#fff",
        fontSize: 24,
        fontWeight: "600",
    },
    statUnit: {
        color: "#fff",
        fontSize: 14,
        marginLeft: 4,
        opacity: 0.8,
    },
    statLabel: {
        color: "#fff",
        fontSize: 12,
        opacity: 0.8,
    },
    fab: {
        position: "absolute",
        bottom: 30,
        alignSelf: "center",
        width: 64,
        height: 64,
        borderRadius: 32,
        alignItems: "center",
        justifyContent: "center",
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        marginBottom: 100,
    },
    markerStart: {
        padding: 5,
        backgroundColor: "white",
        borderRadius: 20,
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    markerCurrent: {
        padding: 5,
        backgroundColor: "white",
        borderRadius: 20,
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
});

export default RunningScreen;
