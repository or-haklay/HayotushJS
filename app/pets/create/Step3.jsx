import React from "react";
import { View, Image } from "react-native";
import { Text, Button } from "react-native-paper";
import ProgressDots from "../../../components/createPet/ProgressDots";
import PetIllustration from "../../../components/createPet/PetIllustration";
import { useRouter } from "expo-router";
import { usePetCreation } from "../../../context/PetCreationContext";

export default function Step3() {
  const router = useRouter();
  const { petData, setPetData } = usePetCreation();

  const handlePickImage = () => {
    // כאן נחבר בהמשך ל expo-image-picker
    setPetData({ ...petData, image: "demo-image.png" });
  };

  return (
    <View className="flex-1 justify-between items-center bg-white p-6">
      <Image
        source={require("../../../assets/images/logo.png")}
        style={{ width: 48, height: 48, marginTop: 20 }}
      />

      <PetIllustration
        source={require("../../../assets/images/cats/cat-play.png")}
      />

      <View style={{ alignItems: "center", paddingHorizontal: 16 }}>
        <Text variant="titleLarge" style={{ fontWeight: "bold" }}>
          בוא נוסיף תמונה 📷
        </Text>
        <Text
          variant="bodyMedium"
          style={{ marginTop: 8, textAlign: "center" }}
        >
          תעלה תמונה חמודה של חיית המחמד שלך
        </Text>
      </View>

      {/* כפתור העלאת תמונה */}
      <Button mode="outlined" onPress={handlePickImage}>
        בחר תמונה
      </Button>
      {petData.image && <Text style={{ marginTop: 8 }}>✔ תמונה נבחרה</Text>}

      <ProgressDots step={3} total={5} />

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          width: "100%",
          marginBottom: 20,
        }}
      >
        <Button mode="outlined" onPress={() => router.back()}>
          חזור
        </Button>
        <Button
          mode="contained"
          onPress={() => router.push("/pets/create/Step4")}
        >
          הבא
        </Button>
      </View>
    </View>
  );
}
