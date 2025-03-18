import { createContext, ReactNode, useContext, useState } from "react";
import { login, register, saveFormInput } from "../api/api_service";

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

export const AuthContext = createContext<AuthContextType | undefined>(
    undefined
);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [user, setUser] = useState<any>(null);

    const registerUser = async (email: string, password: string) => {
        const response = await register(email, password);
        if (response.uid) {
            setUser({ uid: response.uid, email });
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
        // Clear any session-related data here (e.g., AsyncStorage, localStorage, etc.)
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
