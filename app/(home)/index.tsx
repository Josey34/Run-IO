import { useRouter } from "expo-router";
import { Button, Text, View } from "react-native";

export default function HomeLayout() {
    const router = useRouter();

    return (
        <View>
            <Text>HOMEEEE</Text>
            <Button
                title="Go to Welcome Screen"
                onPress={() => router.push("/(auth)/welcome_screen")}
            />
        </View>
    );
}
