import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import { Platform } from "react-native";
import { BACKGROUND_LOCATION_TASK } from "../_layout";
import { haversineDistance } from "./distanceCalculations";

interface TrackingPoint {
    latitude: number;
    longitude: number;
    speed: number;
    timestamp: string;
    distance: number;
}

export class BackgroundLocationService {
    private lastLocation: Location.LocationObject | null = null;
    private readonly STORAGE_KEY = '@RunIO_BackgroundLocations';
    private isTracking = false;

    async registerBackgroundTask() {
        try {
            console.log('[BackgroundLocationService] Starting location tracking...');
            
            // Check if already tracking
            if (this.isTracking) {
                console.log('[BackgroundLocationService] Already tracking, skipping...');
                return;
            }

            // Request permissions
            console.log('[BackgroundLocationService] Requesting permissions...');
            const { status: foregroundStatus } = 
                await Location.requestForegroundPermissionsAsync();
            
            if (foregroundStatus !== 'granted') {
                throw new Error('Foreground location permission denied');
            }

            if (Platform.OS === 'android') {
                const { status: backgroundStatus } = 
                    await Location.requestBackgroundPermissionsAsync();
                if (backgroundStatus !== 'granted') {
                    throw new Error('Background location permission denied');
                }
            }

            // Start location updates
            console.log('[BackgroundLocationService] Starting location updates...');
            await Location.startLocationUpdatesAsync(BACKGROUND_LOCATION_TASK, {
                accuracy: Location.Accuracy.BestForNavigation,
                timeInterval: 15000,
                distanceInterval: 10,
                foregroundService: {
                    notificationTitle: "Run-IO is tracking your location",
                    notificationBody: "Location tracking is active",
                    notificationColor: "#FF0000",
                },
                activityType: Location.ActivityType.Fitness,
                showsBackgroundLocationIndicator: true,
            });

            this.isTracking = true;
            console.log('[BackgroundLocationService] Location tracking started successfully');
        } catch (error) {
            console.error('[BackgroundLocationService] Failed to start tracking:', error);
            throw error;
        }
    }

    async unregisterBackgroundTask() {
        try {
            console.log('[BackgroundLocationService] Stopping location tracking...');
            
            if (await Location.hasStartedLocationUpdatesAsync(BACKGROUND_LOCATION_TASK)) {
                await Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
                this.isTracking = false;
                console.log('[BackgroundLocationService] Location tracking stopped');
            } else {
                console.log('[BackgroundLocationService] No active location tracking found');
            }
        } catch (error) {
            console.error('[BackgroundLocationService] Failed to stop tracking:', error);
            throw error;
        }
    }

    async saveLocationPoint(location: Location.LocationObject) {
        try {
            console.log(`[BackgroundLocationService] Saving location: ${JSON.stringify({
                lat: location.coords.latitude,
                lng: location.coords.longitude,
                speed: location.coords.speed,
                time: new Date(location.timestamp).toISOString()
            })}`);

            let distance = 0;
            if (this.lastLocation) {
                distance = haversineDistance(
                    this.lastLocation.coords,
                    location.coords
                );
            }

            const trackingPoint: TrackingPoint = {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                speed: location.coords.speed || 0,
                timestamp: new Date().toISOString(),
                distance: distance * 1000
            };

            const existingPointsString = await AsyncStorage.getItem(this.STORAGE_KEY);
            const existingPoints: TrackingPoint[] = existingPointsString 
                ? JSON.parse(existingPointsString) 
                : [];

            existingPoints.push(trackingPoint);
            await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(existingPoints));

            this.lastLocation = location;
            console.log(`[BackgroundLocationService] Location saved, total points: ${existingPoints.length}`);
        } catch (error) {
            console.error('[BackgroundLocationService] Error saving location:', error);
            throw error;
        }
    }

    async isTrackingActive(): Promise<boolean> {
        try {
            return await Location.hasStartedLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
        } catch (error) {
            console.error('[BackgroundLocationService] Error checking tracking status:', error);
            return false;
        }
    }

    async getSavedLocations(): Promise<TrackingPoint[]> {
        try {
            const pointsString = await AsyncStorage.getItem(this.STORAGE_KEY);
            const points = pointsString ? JSON.parse(pointsString) : [];
            console.log(`Retrieved ${points.length} saved location points`);
            return points;
        } catch (error) {
            console.error("Error getting saved locations:", error);
            return [];
        }
    }

    async clearSavedLocations() {
        try {
            await AsyncStorage.removeItem(this.STORAGE_KEY);
            this.lastLocation = null;
            console.log("Cleared all saved location points");
        } catch (error) {
            console.error("Error clearing saved locations:", error);
            throw error; // Propagate error for handling in UI
        }
    }

}

export const backgroundLocationService = new BackgroundLocationService();
