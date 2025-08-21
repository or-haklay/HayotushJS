import React, { useState } from "react";
import { View, Image, ScrollView, ActivityIndicator } from "react-native";
import { Text, Button, Card } from "react-native-paper";
import ProgressDots from "../../../components/createPet/ProgressDots";
import PetIllustration from "../../../components/createPet/PetIllustration";
import { useRouter } from "expo-router";
import { usePetCreation } from "../../../context/PetCreationContext";
import petService from "../../../services/petService";
import UploadService from "../../../services/uploadService";

export default function Step5() {
  const router = useRouter();
  const { petData } = usePetCreation();
  const [loading, setLoading] = useState(false);

  const handleCreatePet = async () => {
    try {
      setLoading(true);

      let profilePictureUrl = null;

      // אם המשתמש בחר תמונה → נעלה אותה קודם
      if (petData.image && petData.image.uri) {
        const uploaded = await UploadService.uploadPetPicture(petData.image);
        profilePictureUrl = uploaded?.fileUrl ?? null;
      }

      // נשלח לשרת את המידע
      const newPet = await petService.createPet({
        name: petData.name,
        type: petData.type,
        breed: petData.breed,
        birthDate: petData.birthDate,
        weight: petData.weight,
        chipNumber: petData.chipNumber,
        personality: petData.personality,
        favoriteFood: petData.favoriteFood,
        notes: petData.notes,
        profilePictureUrl,
      });

      console.log("✅ חיה נוצרה:", newPet);
      router.push("/home");
    } catch (error) {
      console.error("❌ שגיאה ביצירת חיה:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 justify-between items-center bg-white p-6">
      <Image
        source={require("../../../assets/images/logo.png")}
        style={{ width: 48, height: 48, marginTop: 20 }}
      />

      <PetIllustration
        source={require("../../../assets/images/cats/cat-happy.png")}
      />

      <Text variant="titleLarge" style={{ fontWeight: "bold", marginTop: 12 }}>
        סיימנו! 🎉
      </Text>
      <Text variant="bodyMedium" style={{ marginTop: 8, textAlign: "center" }}>
        בדוק את הפרטים ולחץ על "צור חיית מחמד"
      </Text>

      <ScrollView style={{ width: "100%", marginTop: 16, marginBottom: 16 }}>
        <Card style={{ marginBottom: 8, padding: 12 }}>
          <Text>שם: {petData.name}</Text>
          <Text>סוג: {petData.type}</Text>
          <Text>גזע: {petData.breed}</Text>
          <Text>תאריך לידה: {petData.birthDate}</Text>
          <Text>משקל: {petData.weight}</Text>
          <Text>מספר שבב: {petData.chipNumber}</Text>
          <Text>אופי: {petData.personality}</Text>
          <Text>מזון מועדף: {petData.favoriteFood}</Text>
          <Text>הערות: {petData.notes}</Text>
          <Text>📷 תמונה: {petData.image ? "נבחרה" : "לא נבחרה"}</Text>
        </Card>
      </ScrollView>

      <ProgressDots step={5} total={5} />

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
        <Button mode="contained" onPress={handleCreatePet} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : "צור חיית מחמד"}
        </Button>
      </View>
    </View>
  );
}
