import axios from "axios";

const API_URL = "http://192.168.40.103:3001/api";

export const register = async (email: string, password: string) => {
    try {
        const response = await axios.post(`${API_URL}/register`, {
            email,
            password,
        });
        return response.data;
    } catch (error) {
        handleAxiosError(error);
        throw error;
    }
};

export const login = async (email: string, password: string) => {
    console.log("Making login request to backend with:", email, password);
    try {
        const response = await axios.post(`${API_URL}/login`, {
            email,
            password,
        });
        console.log("Backend response:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error during login request:", error);
        handleAxiosError(error);
        throw error;
    }
};

export const saveFormInput = async (userId: string, data: object) => {
    try {
        const response = await axios.post(`${API_URL}/store-data`, {
            userId,
            data,
        });
        return response.data;
    } catch (error) {
        console.error("Error saving form data to backend:", error);
        throw new Error("Failed to save form data");
    }
};

export const fetchChallenges = async () => {
    try {
        const response = await axios.get(`${API_URL}/challenges`);
        return response.data;
    } catch (error) {
        console.error("Error fetching challenges from backend:", error);
        throw new Error("Failed to fetch challenges");
    }
};

export const updateChallengeStatus = async (
    challengeId: number,
    completed: boolean
) => {
    try {
        const response = await axios.put(`${API_URL}/challenges/status`, {
            challengeId,
            completed,
        });
        return response.data;
    } catch (error) {
        console.error("Error updating challenge status:", error);
        handleAxiosError(error);
        throw error;
    }
};

const handleAxiosError = (error: any) => {
    let errorMessage = "An unknown error occurred";
    if (error.response) {
        errorMessage = error.response.data.message || errorMessage;
    } else if (error.request) {
        errorMessage = "No response received from the server";
    } else {
        errorMessage = error.message;
    }

    ErrorModalEmitter.emit("SHOW_ERROR", errorMessage);
};

import { EventEmitter } from "events";
export const ErrorModalEmitter = new EventEmitter();
