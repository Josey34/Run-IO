import axios from "axios";
import { useEffect, useState } from "react";
import {
    fetchChallenges,
    fetchUserRuns,
    predictRunMetrics,
    saveRunData,
    updateChallengeStatus,
} from "../api/api_service";

const API_KEY_NEWS = process.env.EXPO_PUBLIC_NEWS_API_KEY || "";
const BASE_URL_NEWS = process.env.EXPO_PUBLIC_NEWS_API_URL || "";
const API_KEY_WEATHER = process.env.EXPO_PUBLIC_WEATHER_API_KEY || "";
const BASE_URL_WEATHER = process.env.EXPO_PUBLIC_WEATHER_API_URL || "";

interface Article {
    title: string;
    description?: string;
    urlToImage?: string;
    source: { name: string };
}

interface WeatherCondition {
    text: string;
    icon: string;
}

interface WeatherData {
    temp_c: number;
    feelslike_c: number;
    humidity: number;
    condition: WeatherCondition;
}

interface LocationData {
    name: string;
    localtime: string;
}

interface WeatherResponse {
    current: WeatherData;
    location: LocationData;
}

interface RunData {
    id?: string;
    startTime: string;
    endTime: string;
    timeElapsed: string;
    distance: number;
    currentSpeed: number;
    averageSpeed: number;
    currentPace: string;
    averagePace: string;
    steps: number;
    route: Array<{
        latitude: number;
        longitude: number;
        timestamp: string;
    }>;
}

const useFetch = <T>(
    query: string,
    fetchWeather: boolean = false,
    lat?: number,
    lon?: number
) => {
    const [data, setData] = useState<T[]>([]);
    const [weather, setWeather] = useState<WeatherResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [updatingId, setUpdatingId] = useState<number | null>(null);
    const [saving, setSaving] = useState(false);

    const getYesterdayDate = () => {
        const date = new Date();
        date.setDate(date.getDate() - 1);
        return date.toISOString().split("T")[0];
    };

    const fetchData = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await axios.get(BASE_URL_NEWS, {
                params: {
                    q: query,
                    from: getYesterdayDate(),
                    sortBy: "popularity",
                    apiKey: API_KEY_NEWS,
                },
            });
            setData(response.data.articles || []);

            if (fetchWeather && lat && lon) {
                const weatherResponse = await axios.get(BASE_URL_WEATHER, {
                    params: {
                        key: API_KEY_WEATHER,
                        q: `${lat},${lon}`,
                    },
                });
                setWeather(weatherResponse.data);
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchFromBackend = async (refresh: boolean = false) => {
        if (refresh) {
            setRefreshing(true);
        } else {
            setLoading(true);
        }
        setError(null);

        try {
            const challenges = await fetchChallenges();
            setData(challenges || []);
        } catch (err: any) {
            setError(err.message);
        } finally {
            if (refresh) {
                setRefreshing(false);
            } else {
                setLoading(false);
            }
        }
    };

    const updateChallenge = async (
        challengeId: number,
        completed: boolean
    ): Promise<boolean> => {
        setUpdatingId(challengeId);
        setError(null);

        try {
            await updateChallengeStatus(challengeId, completed);
            await fetchFromBackend(true);
            return true;
        } catch (err: any) {
            setError(err.message);
            return false;
        } finally {
            setUpdatingId(null);
        }
    };

    const saveRun = async (userId: string, runData: RunData) => {
        setSaving(true);
        setError(null);
        try {
            const savedRun = await saveRunData(userId, runData);
            return savedRun;
        } catch (err: any) {
            setError(err.message);
            throw err;
        } finally {
            setSaving(false);
        }
    };

    const fetchRun = async (userId: string) => {
        if (!userId) return [];

        try {
            const response = await fetchUserRuns(userId);

            if (Array.isArray(response)) {
                return response;
            }

            if (response?.data && Array.isArray(response.data)) {
                return response.data;
            }

            return [];
        } catch (error) {
            console.error("Error fetching runs:", error);
            throw new Error("Failed to fetch runs");
        }
    };

    const predictRun = async (userId: string, userData: object) => {
        try {
            const predictions = await predictRunMetrics(userId, userData);
            return predictions;
        } catch (error) {
            console.error("Prediction error:", error);
            throw error;
        }
    };

    useEffect(() => {
        fetchData();
    }, [query, fetchWeather, lat, lon]);

    return {
        data,
        weather,
        loading,
        refreshing,
        error,
        refetch: fetchData,
        fetchFromBackend,
        updateChallenge,
        saveRun,
        saving,
        fetchRun,
        predictRun,
    };
};

export default useFetch;
