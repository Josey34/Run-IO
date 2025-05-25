import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useState,
} from "react";
import { checkUserFormData, login, register } from "../app/api/api_service";

interface User {
    uid: string;
    email: string;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    loginUser: (
        email: string,
        password: string
    ) => Promise<{ uid: any; email: string }>;
    registerUser: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const router = useRouter();

    useEffect(() => {
        checkLoginState();
    }, []);

    const checkLoginState = async () => {
        try {
            const token = await SecureStore.getItemAsync("userToken");
            const userData = await SecureStore.getItemAsync("userData");

            if (token && userData) {
                const parsedUserData = JSON.parse(userData);
                setUser(parsedUserData);

                const hasFormData = await checkUserFormData(parsedUserData.uid);

                if (hasFormData) {
                    router.replace("/(home)");
                } else {
                    router.replace("/(auth)/warning_screen");
                }
            }
        } catch (error) {
            console.error("Error checking login state:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const loginUser = async (email: string, password: string) => {
        try {
            const response = await login(email, password);
            if (response.uid) {
                const userData = { uid: response.uid, email };
                await SecureStore.setItemAsync(
                    "userToken",
                    response.token || ""
                );
                await SecureStore.setItemAsync(
                    "userData",
                    JSON.stringify(userData)
                );
                setUser(userData);
                return userData;
            }
            throw new Error("Login failed");
        } catch (error) {
            console.error("Login error:", error);
            throw error;
        }
    };

    const registerUser = async (email: string, password: string) => {
        try {
            const response = await register(email, password);
            if (response.uid) {
                const userData = { uid: response.uid, email };
                await SecureStore.setItemAsync(
                    "userToken",
                    response.token || ""
                );
                await SecureStore.setItemAsync(
                    "userData",
                    JSON.stringify(userData)
                );
                setUser(userData);
            }
        } catch (error) {
            console.error("Register error:", error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await SecureStore.deleteItemAsync("userToken");
            await SecureStore.deleteItemAsync("userData");
            setUser(null);
        } catch (error) {
            console.error("Logout error:", error);
            throw error;
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                loginUser,
                registerUser,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
