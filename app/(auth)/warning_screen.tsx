import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { checkUserFormData } from "../api/api_service";
import CustomButton from "../components/CustomButton";
import { useAuth } from "../hooks/useAuth";

const WarningScreen = () => {
    const router = useRouter();
    const { user } = useAuth();
    const [isChecking, setIsChecking] = useState(true);

    const [firstModalVisible, setFirstModalVisible] = useState(true);
    const [secondModalVisible, setSecondModalVisible] = useState(false);

    useEffect(() => {
        const checkData = async () => {
            if (user?.uid) {
                const hasFormData = await checkUserFormData(user.uid);
                if (hasFormData) {
                    router.replace("/(home)");
                } else {
                    setIsChecking(false);
                }
            }
        };
        checkData();
    }, [user]);

    if (isChecking) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    const handleFirstModalClose = () => {
        setFirstModalVisible(false);
        setSecondModalVisible(true);
    };

    const handleSecondModalCloseYes = () => {
        setSecondModalVisible(false);
        router.replace("/(home)");
    };

    const handleSecondModalCloseNo = () => {
        setSecondModalVisible(false);
        router.replace("/form_data_screen");
    };

    return (
        <View style={styles.container}>
            {/* First Modal */}
            <Modal
                visible={firstModalVisible}
                transparent={true}
                animationType="slide"
            >
                <View style={styles.modalContainer}>
                    <Text style={styles.modalTitle}>Warning!</Text>
                    <Text style={styles.modalText}>
                        This recommendation is intended for users without a
                        history of injuries. If you have any existing injuries,
                        please be aware that this program may not be suitable
                        for you. Proceed with caution and consider consulting a
                        healthcare professional before continuing.
                    </Text>
                    {/* <TouchableOpacity
                        style={styles.button}
                        onPress={handleFirstModalClose}
                    >
                        <Text style={styles.buttonText}>OK</Text>
                    </TouchableOpacity> */}
                    <CustomButton
                        title={"OK"}
                        onPress={handleFirstModalClose}
                    />
                </View>
            </Modal>

            {/* Second Modal */}
            <Modal
                visible={secondModalVisible}
                transparent={true}
                animationType="slide"
            >
                <View style={styles.modalContainer}>
                    <Text style={styles.modalTitle}>
                        Please Answer Honestly!
                    </Text>
                    <Text style={styles.modalText}>
                        Do you have any history of injuries or medical
                        conditions (such as asthma, heart disease, or other
                        health issues) that could affect your ability to
                        exercise safely?
                    </Text>
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={styles.button}
                            onPress={handleSecondModalCloseYes}
                        >
                            <Text style={styles.buttonText}>YES</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.button}
                            onPress={handleSecondModalCloseNo}
                        >
                            <Text style={styles.buttonText}>NO</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "black",
    },
    modalContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(255, 255, 255, 0.1)",
        padding: 20,
        marginVertical: 250,
        marginHorizontal: 20,
        borderRadius: 15,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: "bold",
        color: "red",
        marginBottom: 10,
    },
    modalText: {
        color: "white",
        textAlign: "center",
        marginBottom: 20,
        marginHorizontal: 15,
    },
    button: {
        backgroundColor: "#FFFFFF",
        padding: 15,
        paddingHorizontal: 25,
        borderRadius: 15,
        marginTop: 20,
    },
    buttonText: {
        color: "black",
        fontWeight: "bold",
        fontSize: 16,
    },
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
        width: "100%",
    },
});

export default WarningScreen;
