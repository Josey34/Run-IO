import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { saveFormInput } from "../api/api_service";
import CustomButton from "../components/CustomButton";
import { useAuth } from "../hooks/useAuth"; // Import useAuth to get the user ID

const FormDataScreen: React.FC = () => {
    const router = useRouter();
    const { user } = useAuth(); // Get the user object from useAuth

    const [age, setAge] = useState<string>("");
    const [weight, setWeight] = useState<string>("");
    const [height, setHeight] = useState<string>("");
    const [gender, setGender] = useState<string>("");

    const [errors, setErrors] = useState<{
        age?: string;
        weight?: string;
        height?: string;
        gender?: string;
    }>({});

    const [modalVisible, setModalVisible] = useState(false);
    const [modalMessage, setModalMessage] = useState("");

    const handleSubmit = async () => {
        const newErrors: {
            age?: string;
            weight?: string;
            height?: string;
            gender?: string;
        } = {};

        if (!age) newErrors.age = "Age is required.";
        if (!weight) newErrors.weight = "Weight is required.";
        if (!height) newErrors.height = "Height is required.";
        if (!gender) newErrors.gender = "Please select your gender.";

        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setTimeout(() => {
                setErrors({});
            }, 3000);
        } else {
            try {
                if (!user) {
                    setModalMessage("User not authenticated");
                    setModalVisible(true);
                    return;
                }
                const response = await saveFormInput(user.uid, {
                    age,
                    weight,
                    height,
                    gender,
                });
                if (response.message === "Data stored successfully") {
                    setModalMessage("Data stored successfully");
                    setModalVisible(true);
                    router.replace("/(home)");
                } else {
                    setModalMessage(response.error || "Unknown error occurred");
                    setModalVisible(true);
                }
            } catch (error: any) {
                console.error("Error submitting form data:", error);
                setModalMessage(error.response?.data?.details || error.message);
                setModalVisible(true);
            }
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.wrapper}>
                <Text style={styles.title}>Fill in your data</Text>
                <Text style={styles.subtitle}>
                    Fill out this form to receive running workout
                    recommendations using the Random Forest method.
                </Text>

                <Text style={styles.inputText}>Age:</Text>
                <TextInput
                    style={styles.input}
                    value={age}
                    onChangeText={setAge}
                    keyboardType="numeric"
                />
                {errors.age && <Text style={styles.error}>{errors.age}</Text>}

                <Text style={styles.inputText}>Weight:</Text>
                <TextInput
                    style={styles.input}
                    value={weight}
                    onChangeText={setWeight}
                    keyboardType="numeric"
                />
                {errors.weight && (
                    <Text style={styles.error}>{errors.weight}</Text>
                )}

                <Text style={styles.inputText}>Height:</Text>
                <TextInput
                    style={styles.input}
                    value={height}
                    onChangeText={setHeight}
                    keyboardType="numeric"
                />
                {errors.height && (
                    <Text style={styles.error}>{errors.height}</Text>
                )}

                <Text style={styles.inputText}>Gender:</Text>
                <Picker
                    selectedValue={gender}
                    onValueChange={(itemValue) => setGender(itemValue)}
                    style={styles.picker}
                >
                    <Picker.Item label="Pick your gender" value="" />
                    <Picker.Item label="Man" value="man" />
                    <Picker.Item label="Woman" value="woman" />
                </Picker>
                {errors.gender && (
                    <Text style={styles.error}>{errors.gender}</Text>
                )}

                <CustomButton title={"PROCESS"} onPress={handleSubmit} />
            </View>

            {/* Modal for displaying messages */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                    setModalVisible(!modalVisible);
                }}
            >
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalText}>{modalMessage}</Text>
                        <Pressable
                            style={[styles.button, styles.buttonClose]}
                            onPress={() => setModalVisible(!modalVisible)}
                        >
                            <Text style={styles.textStyle}>Close</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: "#000",
    },
    wrapper: {
        height: "100%",
        backgroundColor: "#2d2d2d",
        padding: 30,
        borderRadius: 15,
    },
    title: {
        marginTop: 80,
        fontSize: 24,
        color: "#fff",
        marginBottom: 10,
        textAlign: "center",
        fontWeight: "bold",
    },
    subtitle: {
        color: "#fff",
        marginBottom: 20,
        textAlign: "center",
        paddingHorizontal: 15,
    },
    input: {
        width: "100%",
        padding: 10,
        borderRadius: 5,
        backgroundColor: "#fff",
        marginBottom: 15,
    },
    inputText: {
        color: "#fff",
        marginBottom: 15,
    },
    picker: {
        height: 55,
        width: "100%",
        color: "#fff",
        marginBottom: 70,
    },
    error: {
        color: "red",
        fontSize: 12,
    },
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 22,
    },
    modalView: {
        margin: 20,
        backgroundColor: "white",
        borderRadius: 20,
        padding: 35,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    button: {
        borderRadius: 20,
        padding: 10,
        elevation: 2,
    },
    buttonClose: {
        backgroundColor: "#2196F3",
    },
    textStyle: {
        color: "white",
        fontWeight: "bold",
        textAlign: "center",
    },
    modalText: {
        marginBottom: 15,
        textAlign: "center",
    },
});

export default FormDataScreen;
