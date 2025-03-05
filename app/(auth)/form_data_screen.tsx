import { useRouter } from "expo-router";
import React from "react";
import { Button, Text, View } from "react-native";

const FormDataScreen = () => {
    const router = useRouter();

    return (
        <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
            <Text>Form Data Screen</Text>
            <Button
                title="Submit"
                onPress={() => router.push("/home_screen")}
            />
        </View>
    );
};

export default FormDataScreen;
