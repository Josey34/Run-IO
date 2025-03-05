import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { useColorScheme as useSystemColorScheme } from "react-native";

export default useColorScheme = () => {
    const systemColorScheme = useSystemColorScheme();
    const [colorScheme, setColorScheme] = useState(systemColorScheme);

    useEffect(() => {
        const loadColorScheme = async () => {
            const storedScheme = await AsyncStorage.getItem("colorScheme");
            if (storedScheme) {
                setColorScheme(storedScheme);
            } else {
                setColorScheme(systemColorScheme);
            }
        };

        loadColorScheme();
    }, [systemColorScheme]);

    const toggleColorScheme = async () => {
        const newScheme = colorScheme === "dark" ? "light" : "dark";
        setColorScheme(newScheme);
        await AsyncStorage.setItem("colorScheme", newScheme);
    };

    return { colorScheme, toggleColorScheme };
};
