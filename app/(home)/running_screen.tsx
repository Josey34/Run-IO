import { mapStyle } from "@/constants/Map";
import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { Pedometer } from "expo-sensors";
import React, { useEffect, useRef, useState } from "react";
import {
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import { ErrorModalEmitter } from "../api/api_service";
import WorkoutCompleteModal from "../components/WorkoutCompleteModal";
import { useAuth } from "../hooks/useAuth";
import useFetch from "../hooks/useFetch";
import { haversineDistance } from "../utils/distanceCalculations";
import {
    formatDuration,
    formatPace,
    paceToSpeed,
} from "../utils/paceCalculations";
import { formatDateTime, formatLocalTime } from "../utils/timeFormat";

// Constants
const MIN_DISTANCE_FOR_PACE = 0.001; // 1 meter in kilometers
const MIN_TOTAL_DISTANCE = 0.01; // 10 meters before showing average pace
const MAX_VALID_PACE = 30; // Maximum valid pace in min/km
const MIN_VALID_PACE = 2; // Minimum valid pace in min/km
const GPS_ACCURACY_THRESHOLD = 20; // meters
const LOCATION_UPDATE_INTERVAL = 1000; // 1 second
const PACE_AVERAGE_WINDOW = 5; // Number of readings for rolling average
const UPDATE_INTERVAL = 5000; // Update average pace every 5 seconds

interface WorkoutStats {
    currentPace: number;
    averagePace: number;
    distance: number;
    duration: number;
    steps: number;
    startTime: string;
    rawStartTime: string;
    lastAverageUpdate: number;
}

interface RouteCoordinate {
    latitude: number;
    longitude: number;
    timestamp?: string;
}

const calculatePace = (timeInSeconds: number, distanceInKm: number): number => {
    if (distanceInKm < MIN_DISTANCE_FOR_PACE || timeInSeconds === 0) return 0;

    // Calculate pace in minutes per kilometer
    const paceMinKm = timeInSeconds / 60 / distanceInKm;

    // Validate the pace is within reasonable bounds
    if (paceMinKm >= MIN_VALID_PACE && paceMinKm <= MAX_VALID_PACE) {
        return paceMinKm;
    }
    return 0;
};

const calculateAveragePace = (
    totalDistanceKm: number,
    totalTimeSeconds: number
): number => {
    if (totalDistanceKm < MIN_TOTAL_DISTANCE || totalTimeSeconds === 0)
        return 0;

    // Calculate average pace in minutes per kilometer
    const avgPace = totalTimeSeconds / 60 / totalDistanceKm;

    // Validate the average pace
    if (avgPace >= MIN_VALID_PACE && avgPace <= MAX_VALID_PACE) {
        return avgPace;
    }
    return 0;
};

const RunningScreen = () => {
    // State
    const { user } = useAuth();
    const [isTracking, setIsTracking] = useState(false);
    const [location, setLocation] =
        useState<Location.LocationObjectCoords | null>(null);
    const [workoutStats, setWorkoutStats] = useState<WorkoutStats>({
        currentPace: 0,
        averagePace: 0,
        distance: 0,
        duration: 0,
        steps: 0,
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
        steps: 0,
    });
    const { saveRun, saving } = useFetch("");

    // Refs
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

        if (newDistance >= MIN_DISTANCE_FOR_PACE && newDistance < 0.1) {
            const currentPace = calculatePace(timeElapsed, newDistance);

            if (currentPace > 0) {
                speedReadings.current.push(currentPace);
                if (speedReadings.current.length > PACE_AVERAGE_WINDOW) {
                    speedReadings.current.shift();
                }
            }

            setWorkoutStats((prev) => {
                const updatedDistance = prev.distance + newDistance;
                const smoothCurrentPace =
                    speedReadings.current.length > 0
                        ? speedReadings.current.reduce((a, b) => a + b) /
                          speedReadings.current.length
                        : 0;

                const shouldUpdateAverage =
                    currentTime - prev.lastAverageUpdate >= UPDATE_INTERVAL;
                const averagePace = shouldUpdateAverage
                    ? calculateAveragePace(updatedDistance, totalDuration)
                    : prev.averagePace;

                return {
                    ...prev,
                    currentPace: smoothCurrentPace,
                    averagePace: shouldUpdateAverage
                        ? averagePace
                        : prev.averagePace,
                    distance: updatedDistance,
                    duration: totalDuration,
                    lastAverageUpdate: shouldUpdateAverage
                        ? currentTime
                        : prev.lastAverageUpdate,
                };
            });
        }

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

            // Calculate total time elapsed
            const timeElapsed = formatDuration(workoutStats.duration);

            // Calculate speeds (km/h)
            const currentSpeed =
                workoutStats.currentPace > 0
                    ? 60 / workoutStats.currentPace
                    : 0;
            const averageSpeed =
                workoutStats.averagePace > 0
                    ? 60 / workoutStats.averagePace
                    : 0;

            const workoutData = {
                // Timestamps
                startTime: workoutStats.startTime,
                endTime: endTime,
                timeElapsed: timeElapsed,
                duration: formatDuration(workoutStats.duration),

                // Distance and Speed
                distance: Number(workoutStats.distance.toFixed(2)),
                currentSpeed: Number(currentSpeed.toFixed(2)),
                averageSpeed: Number(averageSpeed.toFixed(2)),

                // Pace
                currentPace: formatPace(workoutStats.currentPace),
                averagePace: formatPace(workoutStats.averagePace),

                // Steps and Route
                steps: workoutStats.steps,
                route: routeCoordinates.map((coord) => ({
                    ...coord,
                    timestamp: formatDateTime(
                        new Date(coord.timestamp || Date.now())
                    ),
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

    useEffect(() => {
        return () => {
            locationSubscription.current?.remove();
            pedometerSubscription.current?.remove();
            if (timerRef.current) clearInterval(timerRef.current);
        };
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

            <View style={styles.statsContainer}>
                <View style={styles.statRow}>
                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>DISTANCE</Text>
                        <Text style={styles.statValue}>
                            {workoutStats.distance.toFixed(2)}
                            <Text style={styles.statUnit}> km</Text>
                        </Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>TIME</Text>
                        <Text style={styles.statValue}>
                            {formatDuration(workoutStats.duration)}
                        </Text>
                    </View>
                </View>
                <View style={styles.statRow}>
                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>CURRENT PACE</Text>
                        <Text style={styles.statValue}>
                            {formatPace(workoutStats.currentPace)}
                            <Text style={styles.statUnit}> /km</Text>
                        </Text>
                        <Text style={styles.speedValue}>
                            {paceToSpeed(workoutStats.currentPace)}
                            <Text style={styles.speedUnit}> km/h</Text>
                        </Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>AVG PACE</Text>
                        <Text style={styles.statValue}>
                            {formatPace(workoutStats.averagePace)}
                            <Text style={styles.statUnit}> /km</Text>
                        </Text>
                        {workoutStats.distance < MIN_TOTAL_DISTANCE && (
                            <Text style={styles.paceNote}>
                                Starts after{" "}
                                {(MIN_TOTAL_DISTANCE * 1000).toFixed(0)}m
                            </Text>
                        )}
                    </View>
                </View>
            </View>

            <TouchableOpacity
                style={[
                    styles.fab,
                    { backgroundColor: isTracking ? "#FF4B4B" : "#00B04D" },
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
        backgroundColor: "#000",
    },
    map: {
        flex: 1,
    },
    statsContainer: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        padding: 20,
        paddingTop: Platform.OS === "ios" ? 50 : 20,
    },
    statRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 15,
    },
    statItem: {
        flex: 1,
        alignItems: "center",
    },
    statLabel: {
        color: "#888",
        fontSize: 12,
        fontWeight: "600",
        marginBottom: 4,
    },
    statValue: {
        color: "#fff",
        fontSize: 24,
        fontWeight: "700",
    },
    statUnit: {
        fontSize: 16,
        color: "#888",
    },
    speedValue: {
        color: "#888",
        fontSize: 10,
        marginTop: 2,
        textAlign: "center",
    },
    speedUnit: {
        fontSize: 10,
        color: "#888",
    },
    paceNote: {
        color: "#888",
        fontSize: 10,
        marginTop: 2,
        textAlign: "center",
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
