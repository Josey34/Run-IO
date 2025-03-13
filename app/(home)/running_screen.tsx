import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { Pedometer } from "expo-sensors";
import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MapView, { Marker } from "react-native-maps";

const haversineDistance = (
    coords1: Location.LocationObjectCoords,
    coords2: Location.LocationObjectCoords
) => {
    const toRad = (angle: number) => (angle * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(coords2.latitude - coords1.latitude);
    const dLon = toRad(coords2.longitude - coords1.longitude);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(coords1.latitude)) *
            Math.cos(toRad(coords2.latitude)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

const MIN_MOVEMENT_DISTANCE = 0.005;

const RunningScreen = () => {
    const [isTracking, setIsTracking] = useState(false);
    const [location, setLocation] =
        useState<Location.LocationObjectCoords | null>(null);
    const [steps, setSteps] = useState(0);
    const [distance, setDistance] = useState(0);
    const [region, setRegion] = useState<any>(null);
    const [elapsedTime, setElapsedTime] = useState("0:00");
    const [pace, setPace] = useState("0.00 min/km");
    const prevLocationRef = useRef<Location.LocationObjectCoords | null>(null);
    const startTimeRef = useRef<number | null>(null);
    const pedometerSubscription = useRef<Pedometer.Subscription | null>(null);
    const locationSubscription = useRef<Location.LocationSubscription | null>(
        null
    );
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") {
                console.log("Permission to access location was denied");
                return;
            }
        })();
    }, []);

    useEffect(() => {
        if (isTracking) {
            startTracking();
        } else {
            stopTracking();
        }

        return () => stopTracking();
    }, [isTracking]);

    const startTracking = async () => {
        startTimeRef.current = Date.now();
        setDistance(0);
        setSteps(0);

        Pedometer.isAvailableAsync().then((available) => {
            if (available) {
                pedometerSubscription.current = Pedometer.watchStepCount(
                    ({ steps }) => {
                        setSteps(steps);
                    }
                );
            }
        });

        locationSubscription.current = await Location.watchPositionAsync(
            {
                accuracy: Location.Accuracy.High,
                distanceInterval: 2,
            },
            (newLocation) => {
                setLocation(newLocation.coords);
                setRegion({
                    latitude: newLocation.coords.latitude,
                    longitude: newLocation.coords.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                });

                if (prevLocationRef.current) {
                    const newDistance = haversineDistance(
                        prevLocationRef.current,
                        newLocation.coords
                    );
                    if (newDistance > MIN_MOVEMENT_DISTANCE) {
                        setDistance((prev) => prev + newDistance);
                    }
                }
                prevLocationRef.current = newLocation.coords;
            }
        );

        timerRef.current = setInterval(updateElapsedTime, 1000);
    };

    const stopTracking = () => {
        pedometerSubscription.current?.remove();
        locationSubscription.current?.remove();
        if (timerRef.current) clearInterval(timerRef.current);
    };

    const updateElapsedTime = () => {
        if (!startTimeRef.current) return;

        const secondsElapsed = Math.floor(
            (Date.now() - startTimeRef.current) / 1000
        );
        const minutes = Math.floor(secondsElapsed / 60);
        const seconds = secondsElapsed % 60;
        setElapsedTime(`${minutes}:${seconds < 10 ? "0" : ""}${seconds}`);

        setPace(calculatePace(secondsElapsed, distance));
    };

    const calculatePace = (timeInSeconds: number, dist: number) => {
        if (dist === 0) return "0.00 min/km";
        const pace = timeInSeconds / 60 / dist;
        return `${pace.toFixed(2)} min/km`;
    };

    const calibrateLocation = async () => {
        let loc = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High,
        });
        setLocation(loc.coords);
        setRegion({
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
        });
    };

    return (
        <View style={styles.container}>
            <MapView
                style={styles.map}
                region={region}
                showsUserLocation
                followsUserLocation
            >
                {location && (
                    <Marker
                        coordinate={{
                            latitude: location.latitude,
                            longitude: location.longitude,
                        }}
                    />
                )}
            </MapView>

            <View style={styles.statsContainer}>
                <Text style={styles.statText}>Steps: {steps}</Text>
                <Text style={styles.statText}>
                    Distance: {distance.toFixed(2)} km
                </Text>
                <Text style={styles.statText}>Pace: {pace}</Text>
                <Text style={styles.statText}>Time: {elapsedTime}</Text>
            </View>

            <TouchableOpacity
                style={styles.fab}
                onPress={() => setIsTracking((prev) => !prev)}
            >
                <FontAwesome5
                    name={isTracking ? "pause" : "play"}
                    size={24}
                    color="white"
                />
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.calibrateFab}
                onPress={calibrateLocation}
            >
                <MaterialIcons name="my-location" size={24} color="white" />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    map: { flex: 1 },
    statsContainer: {
        position: "absolute",
        top: 20,
        left: 20,
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        padding: 10,
        borderRadius: 8,
    },
    statText: { color: "white", fontSize: 16 },
    fab: {
        position: "absolute",
        bottom: 20,
        right: 20,
        backgroundColor: "blue",
        padding: 15,
        borderRadius: 50,
        alignItems: "center",
        justifyContent: "center",
        elevation: 5,
    },
    calibrateFab: {
        position: "absolute",
        bottom: 20,
        left: 20,
        backgroundColor: "green",
        padding: 15,
        borderRadius: 50,
        alignItems: "center",
        justifyContent: "center",
        elevation: 5,
    },
});

export default RunningScreen;
