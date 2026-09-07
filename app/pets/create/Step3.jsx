import React, { useState } from "react";
import {
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Text, Button, ProgressBar } from "react-native-paper";
import PetIllustration from "../../../components/createPet/PetIllustration";
import { useRouter } from "expo-router";
import { usePetCreation } from "../../../context/PetCreationContext";
import { StepNavigationHeader } from "./_layout";
import * as ImagePicker from "expo-image-picker";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import uploadService from "../../../services/uploadService";
import petService from "../../../services/petService";
import { COLORS } from "../../../constants/Colors";

export default function Step3() {
  const router = useRouter();
  const { petData, setPetData } = usePetCreation();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState("");
  const [serverStatus, setServerStatus] = useState("unknown"); // "unknown", "connected", "disconnected"

  const requestPermissions = async () => {
    if (Platform.OS !== "web") {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "אישור נדרש",
          "אנא אשר גישה לגלריית התמונות כדי לבחור תמונה"
        );
        return false;
      }
    }
    return true;
  };

  const handlePickImage = async () => {
    if (!(await requestPermissions())) return;

    try {
      setLoading(true);
      setUploadProgress(0);
      setUploadStatus("בוחר תמונה...");

      const image = await uploadService.pickProfileImage();

      if (image) {
        // לוג כדי לראות מה יש לנו

        setUploadProgress(20);
        setUploadStatus("מעלה תמונה...");

        try {
          // בדיקה שהשרת זמין
          if (!petData.createdPetId) {
            throw new Error("לא ניתן להעלות תמונה ללא יצירת חיה");
          }

          const uploadResult = await uploadService.uploadPetPicture(image);

          if (uploadResult && uploadResult.success) {
            setUploadProgress(60);
            setUploadStatus("מעדכן את החיה...");
            setPetData({
              ...petData,
              image: uploadResult.fileUrl,
            });
            await petService.updatePetProfilePicture(
              petData.createdPetId,
              uploadResult.fileUrl
            );

            setUploadProgress(100);
            setUploadStatus("התמונה הועלתה בהצלחה!");

            Alert.alert("הצלחה", "תמונת החיה הועלתה בהצלחה!");
          } else {
            throw new Error("העלאת התמונה נכשלה");
          }
        } catch (error) {
          console.error("Error uploading pet image:", error);

          let errorMessage = "אירעה שגיאה בהעלאת התמונה";
          let shouldRetry = false;

          if (error.message.includes("timeout")) {
            errorMessage = "החיבור לשרת איטי מדי. אנא נסה שוב.";
            shouldRetry = true;
          }

          Alert.alert("שגיאה", errorMessage, [
            { text: "ביטול", style: "cancel" },
            ...(shouldRetry
              ? [{ text: "נסה שוב", onPress: () => handlePickImage() }]
              : []),
          ]);
        }
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("שגיאה", "אירעה שגיאה בבחירת התמונה");
    } finally {
      setLoading(false);
      setTimeout(() => {
        setUploadProgress(0);
        setUploadStatus("");
      }, 2000);
    }
  };

  const handleNext = async () => {
    if (!petData.createdPetId) {
      Alert.alert("שגיאה", "לא ניתן לעבור לשלב הבא ללא יצירת חיה");
      return;
    }
    router.push("/pets/create/Step4");
  };

  const handleBack = () => {
    router.back();
  };

  const canGoNext = true;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <ScrollView
          style={{ flex: 1, marginBottom: 60 }}
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="always"
        >
          <View
            style={{
              flex: 1,
              justifyContent: "flex-start",
              alignItems: "center",
              paddingHorizontal: 24,
              paddingTop: insets.top + 10,
            }}
          >
            <PetIllustration
              source={require("../../../assets/images/cats/cat-strach.png")}
            />

            <View
              style={{
                alignItems: "center",
                paddingHorizontal: 16,
                marginTop: 20,
              }}
            >
              <Text variant="titleLarge" style={{ fontWeight: "bold" }}>
                תמונה אחת שווה אלף מילים 📸
              </Text>
              <Text
                variant="bodyMedium"
                style={{ marginTop: 8, textAlign: "center" }}
              >
                בחר תמונת פרופיל לחיית המחמד שלך (אופציונלי)
              </Text>
            </View>

            <View style={{ width: "100%", marginTop: 32 }}>
              {petData.image ? (
                <View style={{ alignItems: "center", marginBottom: 20 }}>
                  <Image
                    source={{ uri: petData.image }}
                    style={{
                      width: 200,
                      height: 200,
                      borderRadius: 100,
                      marginBottom: 16,
                    }}
                    resizeMode="cover"
                  />
                  <Text style={{ color: "#666", textAlign: "center" }}>
                    תמונת הפרופיל נבחרה בהצלחה!
                  </Text>
                </View>
              ) : (
                <View style={{ alignItems: "center", marginBottom: 20 }}>
                  <Text style={{ color: "#666", textAlign: "center" }}>
                    לחץ על הכפתור למטה כדי לבחור תמונת פרופיל
                  </Text>
                </View>
              )}

              <Button
                mode="contained"
                onPress={handlePickImage}
                icon="camera"
                style={{ marginBottom: 40 }}
                loading={loading}
                disabled={loading}
              >
                {petData.image ? "שנה תמונה" : "בחר תמונת פרופיל"}
              </Button>

              {loading && (
                <View
                  style={{
                    marginTop: 20,
                    padding: 16,
                    backgroundColor: COLORS.surface,
                    borderRadius: 8,
                    width: "100%",
                  }}
                >
                  <Text
                    style={{
                      textAlign: "center",
                      marginBottom: 8,
                      fontWeight: "600",
                    }}
                  >
                    {uploadStatus}
                  </Text>
                  <ProgressBar
                    progress={uploadProgress / 100}
                    color={COLORS.primary}
                    style={{ height: 8, borderRadius: 4 }}
                  />
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      marginTop: 8,
                    }}
                  >
                    <Text style={{ fontSize: 12, color: "#666" }}>התקדמות</Text>
                    <Text style={{ fontSize: 12, fontWeight: "600" }}>
                      {Math.round(uploadProgress)}%
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <StepNavigationHeader
        step={3}
        total={4}
        onBack={handleBack}
        onNext={handleNext}
        canGoBack={true}
        canGoNext={canGoNext}
        backText="חזור"
        nextText="הבא"
        nextDisabled={!canGoNext}
        loading={loading}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 24,
  },
});
