import { Text, View } from "react-native";

export default function RunningScreen() {
    return (
        <View className="flex-1 justify-center items-center bg-white">
            <Text className="text-2xl font-bold">Running</Text>
            <Text>Manage your running sessions here.</Text>
        </View>
    );
}
