import React, { useState } from "react";
import {
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import {
  Text,
  TextInput,
  Button,
  ProgressBar,
  Portal,
  Dialog,
  IconButton,
} from "react-native-paper";
import PetIllustration from "../../../components/createPet/PetIllustration";
import { useRouter } from "expo-router";
import { usePetCreation } from "../../../context/PetCreationContext";
import { StepNavigationHeader } from "./_layout";
import * as ImagePicker from "expo-image-picker";
import { Platform } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import uploadService from "../../../services/uploadService";
import petService from "../../../services/petService";
import { createMedicalRecord } from "../../../services/medicalRecordsService";
import { COLORS } from "../../../constants/Colors";

export default function Step4() {
  const router = useRouter();
  const { petData, setPetData } = usePetCreation();
  const insets = useSafeAreaInsets();
  const [selectedVaccineBookImage, setSelectedVaccineBookImage] =
    useState(null);
  const [loading, setLoading] = useState(false);
  const [updateProgress, setUpdateProgress] = useState(0);
  const [updateStatus, setUpdateStatus] = useState("");

  // מצב לעריכת תמונות
  const [showImageOptions, setShowImageOptions] = useState(false);
  const [showUploadOptions, setShowUploadOptions] = useState(false);

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

  const handlePickVaccineBookImage = async () => {
    let image;

    try {
      image = await uploadService.pickCoverImage(); // שימוש ב-cover image כי זה מלבני

      if (image) {
        setSelectedVaccineBookImage(image);
        setShowImageOptions(false);
        setShowUploadOptions(false); // הסתר את אפשרויות ההעלאה

        try {
          // העלאת המסמך הרפואי באמצעות uploadService
          const uploadResult = await uploadService.uploadMedicalDocument(image);

          console.log("📋 תוצאת העלאת המסמך הרפואי:", uploadResult);

          if (uploadResult && uploadResult.success) {
            // עדכון ה-context עם התמונה
            setPetData({
              ...petData,
              vaccineBookImage: uploadResult.fileUrl,
              vaccineBookMime:
                uploadResult.fileMime || image.mimeType || "image/jpeg",
            });

            console.log("📋 עדכון ה-context עם התמונה:", {
              vaccineBookImage: uploadResult.fileUrl,
              vaccineBookMime:
                uploadResult.fileMime || image.mimeType || "image/jpeg",
            });

            Alert.alert("הצלחה", "תמונת פנקס החיסונים נבחרה בהצלחה!");
          }
        } catch (error) {
          Alert.alert("שגיאה", "אירעה שגיאה בהעלאת התמונה");
          console.error("Error uploading medical document:", error);
        }
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("שגיאה", "אירעה שגיאה בבחירת התמונה");
    }
  };

  // פונקציה חדשה לבחירת מסמך PDF
  const handlePickPDFDocument = async () => {
    try {
      const document = await uploadService.pickDocument();

      if (document) {
        setSelectedVaccineBookImage(document);
        setShowImageOptions(false);
        setShowUploadOptions(false); // הסתר את אפשרויות ההעלאה

        try {
          // העלאת המסמך הרפואי באמצעות uploadService
          const uploadResult = await uploadService.uploadMedicalDocument(
            document
          );

          console.log("📋 תוצאת העלאת המסמך PDF:", uploadResult);

          if (uploadResult && uploadResult.success) {
            // עדכון ה-context עם המסמך
            setPetData({
              ...petData,
              vaccineBookImage: uploadResult.fileUrl,
              vaccineBookMime:
                uploadResult.fileMime || document.mimeType || "application/pdf",
            });

            console.log("📋 עדכון ה-context עם המסמך PDF:", {
              vaccineBookImage: uploadResult.fileUrl,
              vaccineBookMime:
                uploadResult.fileMime || document.mimeType || "application/pdf",
            });

            Alert.alert("הצלחה", "מסמך פנקס החיסונים נבחר בהצלחה!");
          }
        } catch (error) {
          Alert.alert("שגיאה", "אירעה שגיאה בהעלאת המסמך");
          console.error("Error uploading PDF document:", error);
        }
      }
    } catch (error) {
      console.error("Error picking PDF document:", error);
      Alert.alert("שגיאה", "אירעה שגיאה בבחירת המסמך");
    }
  };

  // פונקציה חדשה לצילום תמונה ישירה
  const handleTakePhoto = async () => {
    try {
      // בדיקת הרשאות למצלמה
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("אישור נדרש", "אנא אשר גישה למצלמה כדי לצלם תמונה");
        return;
      }

      // הפעלת המצלמה
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9], // יחס מלבני שמתאים לפנקס חיסונים
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const image = result.assets[0];
        setSelectedVaccineBookImage(image);
        setShowImageOptions(false);
        setShowUploadOptions(false); // הסתר את אפשרויות ההעלאה

        try {
          // העלאת התמונה שצולמה
          const uploadResult = await uploadService.uploadMedicalDocument(image);

          console.log("📋 תוצאת העלאת התמונה שצולמה:", uploadResult);

          if (uploadResult && uploadResult.success) {
            // עדכון ה-context עם התמונה
            setPetData({
              ...petData,
              vaccineBookImage: uploadResult.fileUrl,
              vaccineBookMime:
                uploadResult.fileMime || image.mimeType || "image/jpeg",
            });

            console.log("📋 עדכון ה-context עם התמונה שצולמה:", {
              vaccineBookImage: uploadResult.fileUrl,
              vaccineBookMime:
                uploadResult.fileMime || image.mimeType || "image/jpeg",
            });

            Alert.alert("הצלחה", "תמונת פנקס החיסונים צולמה והועלתה בהצלחה!");
          }
        } catch (error) {
          Alert.alert("שגיאה", "אירעה שגיאה בהעלאת התמונה");
          console.error("Error uploading captured image:", error);
        }
      }
    } catch (error) {
      console.error("Error taking photo:", error);
      Alert.alert("שגיאה", "אירעה שגיאה בצילום התמונה");
    }
  };

  const handleRemoveVaccineBookImage = async () => {
    Alert.alert(
      "הסרת תמונה",
      "האם אתה בטוח שברצונך להסיר את תמונת פנקס החיסונים?",
      [
        { text: "ביטול", style: "cancel" },
        {
          text: "הסר",
          style: "destructive",
          onPress: async () => {
            try {
              // עדכון ה-context
              setPetData({ ...petData, vaccineBookImage: null });
              setSelectedVaccineBookImage(null);

              setShowImageOptions(false);
              setShowUploadOptions(false); // הסתר את אפשרויות ההעלאה

              Alert.alert("הצלחה", "תמונת פנקס החיסונים הוסרה בהצלחה");
            } catch (error) {
              Alert.alert("שגיאה", "אירעה שגיאה בהסרת התמונה");
              console.error("Error removing medical document:", error);
            }
          },
        },
      ]
    );
  };

  const openImageOptions = () => {
    setShowImageOptions(true);
  };

  const toggleUploadOptions = () => {
    // אם יש כבר תמונה מועלית, הצג Alert עם אפשרויות עריכה
    if (petData.vaccineBookImage) {
      Alert.alert(
        "עריכת מסמך",
        "בחר מה ברצונך לעשות:",
        [
          {
            text: "שנה תמונה",
            onPress: () => {
              setShowUploadOptions(true);
            },
          },
          {
            text: "הסר מסמך",
            onPress: handleRemoveVaccineBookImage,
            style: "destructive",
          },
          {
            text: "ביטול",
            style: "cancel",
          },
        ]
      );
    } else {
      // אם אין תמונה, הצג את אפשרויות ההעלאה
      setShowUploadOptions(!showUploadOptions);
    }
  };

  const handleFinish = async () => {
    // בדיקה שיש createdPetId לפני הסיום
    if (!petData.createdPetId) {
      Alert.alert("שגיאה", "לא ניתן לסיים ללא יצירת חיה");
      return;
    }

    try {
      setLoading(true);
      setUpdateProgress(0);
      setUpdateStatus("מעדכן את החיה...");

      // הכנת נתונים לעדכון החיה
      const updateData = {};

      if (petData.weight && petData.weight.trim() !== "") {
        updateData.weight = parseFloat(petData.weight);
      }

      if (petData.chipNumber && petData.chipNumber.trim() !== "") {
        updateData.chipNumber = petData.chipNumber;
      }

      // עדכון החיה אם יש נתונים לעדכון
      if (Object.keys(updateData).length > 0) {
        setUpdateProgress(30);
        setUpdateStatus("מעדכן פרטי החיה...");

        await petService.updatePet(petData.createdPetId, updateData);
        console.log("✅ החיה עודכנה עם הפרטים הנוספים");
      }

      // יצירת רישום רפואי עם פנקס החיסונים אם נבחר
      if (petData.vaccineBookImage) {
        setUpdateProgress(60);
        setUpdateStatus("יוצר רישום רפואי...");

        // יצירת רישום רפואי עם פנקס החיסונים - בדומה לקובץ new.jsx
        const medicalRecordData = {
          petId: petData.createdPetId,
          recordName: "פנקס חיסונים", // או להשתמש ב-i18n
          recordType: "vaccination_record",
          date: new Date().toISOString(),
          fileUrl: petData.vaccineBookImage,
          fileMime: petData.vaccineBookMime || "image/jpeg", // שימוש ב-MIME type שנשמר
          description: "פנקס חיסונים של החיה",
          veterinarianName: undefined,
          clinic: undefined,
        };

        console.log("📋 יצירת רישום רפואי עם הנתונים:", medicalRecordData);

        await createMedicalRecord(medicalRecordData);
        console.log("✅ רישום רפואי נוצר בהצלחה");
      }

      setUpdateProgress(100);
      setUpdateStatus("הכל הושלם בהצלחה!");

      // הצגת הודעת הצלחה
      Alert.alert("הצלחה! 🎉", "החיה נוצרה בהצלחה עם כל הפרטים!", [
        {
          text: "המשך",
          onPress: () => router.push("/home"),
        },
      ]);
    } catch (error) {
      console.error("❌ שגיאה בעדכון החיה:", error);
      Alert.alert("שגיאה", "אירעה שגיאה בעדכון החיה. תוכל להמשיך הביתה.");
      // מעבר הביתה גם אם יש שגיאה
      router.push("/home");
    } finally {
      setLoading(false);
      setTimeout(() => {
        setUpdateProgress(0);
        setUpdateStatus("");
      }, 2000);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const canGoNext = !loading;

  const vaccineBookUrl = petData.vaccineBookImage || null;
  const isPDF = petData.vaccineBookMime === "application/pdf";

  const vaccineBookImage = (
    <View style={{ alignItems: "center" }}>
      {vaccineBookUrl ? (
        <View style={{ alignItems: "center" }}>
          {isPDF ? (
            // הצגת PDF
            <View
              style={{
                width: 200,
                height: 150,
                backgroundColor: "#f8f9fa",
                borderWidth: 2,
                borderColor: "#dee2e6",
                borderRadius: 8,
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 12,
              }}
            >
              <Text style={{ fontSize: 48, marginBottom: 8 }}>📄</Text>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: "#333",
                  marginBottom: 4,
                  textAlign: "center",
                }}
              >
                מסמך PDF
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  color: "#666",
                  textAlign: "center",
                }}
              >
                פנקס חיסונים
              </Text>
            </View>
          ) : (
            // הצגת תמונה
            <Image
              source={{ uri: vaccineBookUrl }}
              style={{
                width: 200,
                height: 150,
                borderRadius: 8,
                marginBottom: 12,
              }}
              resizeMode="cover"
            />
          )}

          {/* כפתור עריכה */}
          <Button
            mode="outlined"
            onPress={openImageOptions}
            icon="pencil"
            style={{ marginBottom: 8 }}
          >
            ערוך מסמך
          </Button>

          {/* כפתור הסרה */}
          <Button
            mode="outlined"
            onPress={handleRemoveVaccineBookImage}
            icon="delete"
            textColor={COLORS.error}
          >
            הסר מסמך
          </Button>
        </View>
      ) : (
        <View
          style={{
            width: 200,
            height: 150,
            backgroundColor: "#f8f9fa",
            borderWidth: 2,
            borderColor: "#dee2e6",
            borderStyle: "dashed",
            borderRadius: 8,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <TouchableOpacity
            onPress={toggleUploadOptions}
            style={{
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              height: "100%",
            }}
          >
            <Text style={{ fontSize: 24, marginBottom: 4 }}>📋</Text>
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: "#333",
                marginBottom: 2,
              }}
            >
              העלה פנקס חיסונים
            </Text>
            <Text
              style={{
                fontSize: 12,
                color: "#666",
                textAlign: "center",
              }}
            >
              לחץ כאן לבחירת אפשרויות
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            justifyContent: "flex-start",
            alignItems: "center",
            paddingHorizontal: 24,
            paddingTop: insets.top + 10,
          }}
        >
          <PetIllustration
            source={require("../../../assets/images/dogs/dog-sick.png")}
          />

          <View
            style={{
              alignItems: "center",
              paddingHorizontal: 16,
              marginTop: 20,
            }}
          >
            <Text variant="titleLarge" style={{ fontWeight: "bold" }}>
              פרטים נוספים 📋
            </Text>
            <Text
              variant="bodyMedium"
              style={{ marginTop: 8, textAlign: "center" }}
            >
              הזן משקל ומספר שבב, והעלה פנקס חיסונים (לא חובה)
            </Text>
          </View>

          <View style={{ width: "100%", marginTop: 32 }}>
            <TextInput
              label="משקל (ק״ג)"
              mode="outlined"
              keyboardType="numeric"
              value={petData.weight}
              onChangeText={(text) => setPetData({ ...petData, weight: text })}
              style={{ marginBottom: 12 }}
              placeholder="לא חובה"
            />

            <TextInput
              label="מספר שבב"
              mode="outlined"
              value={petData.chipNumber}
              onChangeText={(text) =>
                setPetData({ ...petData, chipNumber: text })
              }
              style={{ marginBottom: 16 }}
              placeholder="לא חובה"
            />

            <View style={{ marginTop: 16, marginBottom: 16 }}>
              <Text
                variant="titleSmall"
                style={{
                  fontWeight: "600",
                  marginBottom: 8,
                  textAlign: "center",
                  color: "#333",
                }}
              >
                📋 פנקס חיסונים (אופציונלי)
              </Text>

              <Text
                variant="bodySmall"
                style={{
                  textAlign: "center",
                  marginBottom: 12,
                  color: "#666",
                  paddingHorizontal: 8,
                  fontSize: 12,
                }}
              >
                העלה תמונה או מסמך PDF של פנקס החיסונים של החיה שלך
              </Text>

              {/* כפתורים נפרדים לכל אפשרות */}
              {showUploadOptions && (
                <View style={{ alignItems: "center", marginBottom: 16 }}>
                  <Button
                    mode="contained"
                    onPress={handlePickVaccineBookImage}
                    icon="image"
                    style={{ marginBottom: 8, width: 200 }}
                  >
                    בחר תמונה מהגלריה
                  </Button>

                  <Button
                    mode="contained"
                    onPress={handleTakePhoto}
                    icon="camera"
                    style={{ marginBottom: 8, width: 200 }}
                  >
                    צלם תמונה
                  </Button>

                  <Button
                    mode="contained"
                    onPress={handlePickPDFDocument}
                    icon="file-pdf-box"
                    style={{ marginBottom: 8, width: 200 }}
                  >
                    בחר מסמך PDF
                  </Button>
                </View>
              )}

              {/* הצגת המסמך שנבחר */}
              <View style={{ alignItems: "center" }}>{vaccineBookImage}</View>
            </View>

            {/* Progress Bar */}
            {loading && (
              <View
                style={{
                  marginTop: 20,
                  padding: 16,
                  backgroundColor: COLORS.surface,
                  borderRadius: 8,
                }}
              >
                <Text
                  style={{
                    textAlign: "center",
                    marginBottom: 8,
                    fontWeight: "600",
                  }}
                >
                  {updateStatus}
                </Text>
                <ProgressBar
                  progress={updateProgress / 100}
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
                    {Math.round(updateProgress)}%
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Image Options Modal */}
      <Portal>
        <Dialog
          visible={showImageOptions}
          onDismiss={() => setShowImageOptions(false)}
        >
          <Dialog.Title>
            {petData.vaccineBookImage ? "ערוך מסמך" : "בחר מסמך"}
          </Dialog.Title>
          <Dialog.Content>
            <View style={{ padding: 16 }}>
              <Button
                mode="contained"
                onPress={handlePickVaccineBookImage}
                icon="image"
                style={{ marginBottom: 16 }}
              >
                {petData.vaccineBookImage
                  ? "שנה לתמונה מהגלריה"
                  : "בחר תמונה מהגלריה"}
              </Button>

              <Button
                mode="contained"
                onPress={handleTakePhoto}
                icon="camera"
                style={{ marginBottom: 16 }}
              >
                {petData.vaccineBookImage ? "צלם תמונה חדשה" : "צלם תמונה"}
              </Button>

              <Button
                mode="contained"
                onPress={handlePickPDFDocument}
                icon="file-pdf-box"
                style={{ marginBottom: 16 }}
              >
                {petData.vaccineBookImage ? "שנה למסמך PDF" : "בחר מסמך PDF"}
              </Button>

              <Button
                mode="outlined"
                onPress={() => setShowImageOptions(false)}
              >
                ביטול
              </Button>
            </View>
          </Dialog.Content>
        </Dialog>
      </Portal>

      <StepNavigationHeader
        step={4}
        total={4}
        onBack={handleBack}
        onNext={handleFinish}
        canGoBack={true}
        canGoNext={canGoNext}
        backText="חזור"
        nextText={loading ? "מעדכן..." : "סיים"}
        nextDisabled={loading}
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
