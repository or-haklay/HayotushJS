import React, { useState } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Text, Card, Chip, ProgressBar, TextInput } from "react-native-paper";
import PetIllustration from "../../../components/createPet/PetIllustration";
import { useRouter } from "expo-router";
import { usePetCreation } from "../../../context/PetCreationContext";
import { StepNavigationHeader } from "./_layout";
import petService from "../../../services/petService";
import { COLORS } from "../../../theme/theme";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

export default function Step2() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { petData, setPetData } = usePetCreation();
  const [loading, setLoading] = useState(false);
  const [createProgress, setCreateProgress] = useState(0);
  const [createStatus, setCreateStatus] = useState("");

  const personalityOptions = [
    "חברותי",
    "ביישן",
    "אנרגטי",
    "רגוע",
    "שובב",
    "חכם",
  ];

  const togglePersonality = (personality) => {
    const currentPersonalities = petData.personalities || [];
    let newPersonalities;

    if (currentPersonalities.includes(personality)) {
      newPersonalities = currentPersonalities.filter((p) => p !== personality);
    } else {
      newPersonalities = [...currentPersonalities, personality];
    }

    setPetData({ ...petData, personalities: newPersonalities });
  };

  const handleCreatePetAndContinue = async () => {
    try {
      setLoading(true);
      setCreateProgress(0);
      setCreateStatus("יוצר חיה חדשה...");

      // הכנת הנתונים לשליחה
      const petDataToSend = {
        name: petData.name,
        species: petData.type,
        breed: petData.breed || undefined,
        birthDate:
          petData.birthDate && petData.birthDate instanceof Date
            ? petData.birthDate.toISOString()
            : petData.birthDate,
        sex: petData.sex || "unknown",
      };

      // הוספת הערות על אופי, אוכל מועדף והערות נוספות ל-notes
      let additionalNotes = [];
      if (petData.personalities && petData.personalities.length > 0) {
        additionalNotes.push(
          `תכונות אופי: ${petData.personalities.join(", ")}`
        );
      }
      if (petData.favoriteFood && petData.favoriteFood.trim() !== "") {
        additionalNotes.push(`מזון מועדף: ${petData.favoriteFood}`);
      }
      if (petData.notes && petData.notes.trim() !== "") {
        additionalNotes.push(`הערות נוספות: ${petData.notes}`);
      }

      if (additionalNotes.length > 0) {
        petDataToSend.notes = additionalNotes.join("\n");
      }

      setCreateProgress(30);
      setCreateStatus("שולח נתונים לשרת...");

      const newPet = await petService.createPet(petDataToSend);

      // שמירת החיה שנוצרה ב-context
      setPetData({ ...petData, createdPetId: newPet._id || newPet.id });

      setCreateProgress(100);
      setCreateStatus("החיה נוצרה בהצלחה!");

      // מעבר אוטומטי לשלב הבא אחרי יצירה מוצלחת
      setTimeout(() => {
        router.push("/pets/create/Step3");
      }, 1000);
    } catch (error) {
      console.error("❌ שגיאה ביצירת חיה:", error);
      console.error("❌ פרטי השגיאה:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        config: error.config,
      });

      let errorMessage = "אירעה שגיאה ביצירת החיה. נסה שוב.";

      if (error.response?.status === 400) {
        errorMessage = "הנתונים שנשלחו לא תקינים. אנא בדוק את הפרטים ונסה שוב.";
      } else if (error.response?.status === 401) {
        errorMessage = "הסשן פג תוקף. אנא התחבר מחדש.";
      } else if (error.response?.status === 500) {
        errorMessage = "שגיאה בשרת. אנא נסה שוב מאוחר יותר.";
      }

      Alert.alert("שגיאה", errorMessage);
    } finally {
      setLoading(false);
      // איפוס ה-progress אחרי זמן קצר
      setTimeout(() => {
        setCreateProgress(0);
        setCreateStatus("");
      }, 2000);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const canGoNext = !loading; // הכפתור צריך להופיע תמיד כדי ליצור את החיה

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <ScrollView
          style={{ flex: 1, marginBottom: 60 }}
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="always"
        >
          {/* תוכן המסך */}
          <View
            style={{
              justifyContent: "flex-start",
              alignItems: "center",
              paddingHorizontal: 24,
              paddingTop: insets.top + 10,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            {/* איור */}
            <PetIllustration
              source={require("../../../assets/images/dogs/dog-happy.png")}
              style={{ width: 200, height: 200 }}
            />

            {/* טקסט */}
            <View
              style={{
                alignItems: "center",
                paddingHorizontal: 16,
                marginTop: 20,
              }}
            >
              <Text variant="titleLarge" style={{ fontWeight: "bold" }}>
                אופי החיה 🐾
              </Text>
              <Text
                variant="bodyMedium"
                style={{ marginTop: 8, textAlign: "center" }}
              >
                בחר תכונות שמתארות את החיה שלך (לא חובה)
              </Text>
            </View>

            {/* טופס */}
            <View style={{ width: "100%", marginTop: 32 }}>
              {/* תכונות אופי */}
              <Text
                variant="titleMedium"
                style={{ fontWeight: "600", marginBottom: 16, color: "#333" }}
              >
                תכונות אופי (לא חובה)
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  gap: 8,
                  justifyContent: "center",
                  marginBottom: 24,
                }}
              >
                {personalityOptions.map((personality) => (
                  <Chip
                    key={personality}
                    selected={(petData.personalities || []).includes(
                      personality
                    )}
                    onPress={() => togglePersonality(personality)}
                    style={{ marginBottom: 8 }}
                    textStyle={{ fontSize: 14 }}
                  >
                    {personality}
                  </Chip>
                ))}
              </View>

              {/* מזון מועדף */}
              <TextInput
                label="מזון מועדף (לא חובה)"
                mode="outlined"
                value={petData.favoriteFood}
                onChangeText={(text) =>
                  setPetData({ ...petData, favoriteFood: text })
                }
                style={{ marginBottom: 16 }}
                placeholder="למשל: אוכל יבש, אוכל רטוב"
                multiline
                numberOfLines={2}
              />

              {/* הערות נוספות */}
              <TextInput
                label="הערות נוספות (לא חובה)"
                mode="outlined"
                value={petData.notes}
                onChangeText={(text) => setPetData({ ...petData, notes: text })}
                style={{ marginBottom: 16 }}
                placeholder="כל מידע נוסף שתרצה להוסיף על החיה שלך"
                multiline
                numberOfLines={3}
              />

              {/* Progress Bar */}
              {loading && (
                <View
                  style={{
                    marginBottom: 16,
                    padding: 16,
                    backgroundColor: COLORS.background,
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
                    {createStatus}
                  </Text>
                  <ProgressBar
                    progress={createProgress / 100}
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
                      {Math.round(createProgress)}%
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* כפתורי ניווט */}
      <StepNavigationHeader
        step={2}
        total={4}
        onBack={handleBack}
        onNext={handleCreatePetAndContinue}
        canGoBack={true}
        canGoNext={canGoNext}
        backText="חזור"
        nextText="צור חיה והמשך"
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
