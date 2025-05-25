import { BlurView } from "expo-blur";
import { StyleSheet } from "react-native";

export const BlurBackground = () => {
    return <BlurView intensity={20} style={StyleSheet.absoluteFill} />;
};

export default BlurBackground;
