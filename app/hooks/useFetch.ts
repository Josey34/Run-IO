import axios from "axios";
import { useEffect, useState } from "react";
import { fetchChallenges } from "../api/api_service"; // Adjust the import path as needed

const API_KEY_NEWS = `${process.env.EXPO_PUBLIC_NEWS_API_KEY}`;
const BASE_URL_NEWS = `${process.env.EXPO_PUBLIC_NEWS_API_URL}`;
const API_KEY_WEATHER = `${process.env.EXPO_PUBLIC_WEATHER_API_KEY}`;
const BASE_URL_WEATHER = `${process.env.EXPO_PUBLIC_WEATHER_API_URL}`;

console.log(API_KEY_NEWS, BASE_URL_NEWS, API_KEY_WEATHER, BASE_URL_WEATHER);

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

    const fetchData = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await axios.get(BASE_URL_NEWS, {
                params: {
                    q: query,
                    from: "2025-03-09",
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

    useEffect(() => {
        fetchData();
    }, [query, fetchWeather, lat, lon]);

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

    return {
        data,
        weather,
        loading,
        refreshing,
        error,
        refetch: fetchData,
        fetchFromBackend,
    };
};

export default useFetch;
