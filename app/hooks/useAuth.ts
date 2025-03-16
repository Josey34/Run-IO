import { useState, useContext, createContext, ReactNode } from "react";
import { register, login, saveFormInput } from "../api"; // Import the API functions

interface AuthContextType {
    user: any;
    registerUser: (
        email: string,
        password: string,
        displayName: string
    ) => Promise<void>;
    loginUser: (email: string, password: string) => Promise<void>;
    saveForm: (uid: string, formData: any) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<any>(null);

    const registerUser = async (
        email: string,
        password: string,
        displayName: string
    ) => {
        const response = await register(email, password, displayName);
        if (response.uid) {
            setUser({ uid: response.uid, email, displayName });
        } else {
            throw new Error(response.error || "Registration failed");
        }
    };

    const loginUser = async (email: string, password: string) => {
        const response = await login(email, password);
        if (response.uid) {
            setUser({ uid: response.uid, email });
        } else {
            throw new Error(response.error || "Login failed");
        }
    };

    const saveForm = async (uid: string, formData: any) => {
        const response = await saveFormInput(uid, formData);
        if (!response.id) {
            throw new Error(response.error || "Failed to save form data");
        }
    };

    const logout = () => {
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{ user, registerUser, loginUser, saveForm, logout }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
