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

    const checkLoginState = async () => {
        try {
            console.log("Checking login state...");
            const token = await SecureStore.getItemAsync("userToken");
            const userData = await SecureStore.getItemAsync("userData");
            console.log(
                "Token exists:",
                !!token,
                "UserData exists:",
                !!userData
            );

            if (token && userData) {
                const parsedUserData = JSON.parse(userData);
                setUser(parsedUserData);
                console.log("User data parsed successfully");

                const hasFormData = await checkUserFormData(parsedUserData.uid);
                console.log("Has form data:", hasFormData);

                if (hasFormData) {
                    router.replace("/(home)");
                } else {
                    router.replace("/(auth)/warning_screen");
                }
            }
        } catch (error) {
            console.error("Login state check error:", error);
            // Don't rethrow - just log the error and continue
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        checkLoginState().catch((error) => {
            console.error("Effect error in AuthProvider:", error);
        });
    }, []);

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
