import { BlurView } from "expo-blur";
import React from "react";
import { StyleSheet } from "react-native";

export const BlurBackground = () => {
    return <BlurView intensity={20} style={StyleSheet.absoluteFill} />;
};
