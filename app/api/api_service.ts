// api_service.js

import axios from "axios";

const API_URL = "http://192.168.40.51:3001/api"; // Ensure this matches your backend URL

export const register = async (email: string, password: string) => {
    try {
        const response = await axios.post(`${API_URL}/register`, {
            email,
            password,
        });
        return response.data; // Make sure this is returning { uid: userId }
    } catch (error) {
        handleAxiosError(error);
        throw error;
    }
};

// api_service.js
export const login = async (email: string, password: string) => {
    console.log("Making login request to backend with:", email, password); // Debugging line
    try {
        const response = await axios.post(`${API_URL}/login`, {
            email,
            password,
        });
        console.log("Backend response:", response.data); // Log the response from the backend
        return response.data;
    } catch (error) {
        console.error("Error during login request:", error); // Error logging
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

// EventEmitter to handle showing the error modal
import { EventEmitter } from "events";
export const ErrorModalEmitter = new EventEmitter();
