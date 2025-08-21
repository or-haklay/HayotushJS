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

  // פונקציה לקביעת מקור התמונה עם תמונת ברירת מחדל
  const getPetImageSource = () => {
    if (pet?.profilePictureUrl) {
      return { uri: pet.profilePictureUrl };
    }
    // תמונת ברירת מחדל לפי סוג החיה
    if (pet?.species === "cat") {
      return require("../../../assets/images/cats/cat-sit.png");
    } else {
      return require("../../../assets/images/dogs/dog-sit.jpg");
    }
  };

  return (
    <TouchableOpacity style={styles.petCard} onPress={handlePress}>
      <Image
        source={getPetImageSource()}
        style={styles.petImage}
        defaultSource={require("../../../assets/images/dogs/dog-think.png")}
        onError={(error) => {
          console.error("Error loading pet image:", error);
          // אם יש שגיאה בטעינת התמונה, השתמש בתמונת ברירת מחדל
        }}
        onLoad={() => {
          // תמונה נטענה בהצלחה
        }}
      />
      <View style={styles.petInfo}>
        <Text style={styles.petName}>{pet?.name || "No pet selected"}</Text>
        <Text style={styles.petType}>{pet?.species || pet?.type || ""}</Text>
      </View>
      <Ionicons name="chevron-forward" size={24} color={styles.chevron.color} />
    </TouchableOpacity>
  );
};

export default PetCard;
