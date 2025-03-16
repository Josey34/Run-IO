import axios from "axios";
import { useEffect, useState } from "react";

const API_KEY_NEWS = `${process.env.EXPO_PUBLIC_NEWS_API_KEY}`;
const BASE_URL_NEWS = `${process.env.EXPO_PUBLIC_NEWS_API_URL}`;
const API_KEY_WEATHER = `${process.env.EXPO_PUBLIC_WEATHER_API_KEY}`;
const BASE_URL_WEATHER = `https://api.weatherapi.com/v1/current.json`;

interface Article {
    title: string;
    description?: string;
    urlToImage?: string;
    source: { name: string };
}

interface WeatherData {
    temp_c: number;
    feelslike_c: number;
    humidity: number;
    condition: { text: string; icon: string };
    location: { name: string }; // Include city name
    // Add other weather fields if needed
}

const useFetch = <T>(
    query: string,
    fetchWeather: boolean = false,
    lat?: number,
    lon?: number
) => {
    const [data, setData] = useState<T[]>([]);
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
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

        fetchData();
    }, [query, fetchWeather, lat, lon]);

    return { data, weather, loading, error };
};

export default useFetch;
