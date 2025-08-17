import React from "react";
import { View, TouchableOpacity, Image } from "react-native";
import { Text } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import styles from "./styles";

const PetCard = ({ pet, onPress = null }) => {
  const router = useRouter();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else if (pet?._id || pet?.id) {
      // ניווט לעמוד הפרופיל של החיה הספציפית
      const petId = pet._id || pet.id;
      router.push(`/pets/${petId}`);
    } else {
      // אם אין ID, נשאר בפרופיל הכללי
      router.push("/profile");
    }
  };

  return (
    <TouchableOpacity style={styles.petCard} onPress={handlePress}>
      <Image
        source={
          pet?.profilePictureUrl
            ? { uri: pet.profilePictureUrl }
            : require("../../../assets/images/dog-think.png")
        }
        style={styles.petImage}
      />
      <View style={styles.petInfo}>
        <Text style={styles.petName}>{pet?.name || "No pet selected"}</Text>
        <Text style={styles.petType}>{pet?.type || ""}</Text>
      </View>
      <Ionicons name="chevron-forward" size={24} color={styles.chevron.color} />
    </TouchableOpacity>
  );
};

export default PetCard;
