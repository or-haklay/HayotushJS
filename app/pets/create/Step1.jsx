import React, { useState } from "react";
import { View, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { Text, TextInput, Menu } from "react-native-paper";
import PetIllustration from "../../../components/createPet/PetIllustration";
import { useRouter } from "expo-router";
import { usePetCreation } from "../../../context/PetCreationContext";
import { StepNavigationHeader } from "./_layout";
import DateTimePicker from "@react-native-community/datetimepicker";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Step1() {
  const router = useRouter();
  const { petData, setPetData } = usePetCreation();

  const [menuVisible, setMenuVisible] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleNext = () => {
    if (petData.name && petData.type && petData.birthDate) {
      router.push("/pets/create/Step2");
    } else {
      Alert.alert("שדות נדרשים", "אנא מלא את השדות: שם, סוג ותאריך לידה");
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setPetData({ ...petData, birthDate: selectedDate });
    }
  };

  const canGoNext = petData.name && petData.type && petData.birthDate;

  return (
    <SafeAreaView style={styles.container}>
      {/* תוכן המסך */}
      <View
        style={{
          flex: 1,
          justifyContent: "flex-start",
          alignItems: "center",
          paddingHorizontal: 24,
          paddingTop: 20,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {/* איור */}
        <PetIllustration
          source={require("../../../assets/images/dogs/dog-play.png")}
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
            בוא נכיר את חיית המחמד שלך 🐶
          </Text>
          <Text
            variant="bodyMedium"
            style={{ marginTop: 8, textAlign: "center" }}
          >
            הזן את הפרטים הבסיסיים על החיה שלך
          </Text>
        </View>

        {/* טופס */}
        <View style={{ width: "100%", marginTop: 32, marginBottom: 140 }}>
          <TextInput
            label="שם החיה *"
            mode="outlined"
            value={petData.name}
            onChangeText={(text) => setPetData({ ...petData, name: text })}
            style={{ marginBottom: 12 }}
          />

          {/* Dropdown סוג חיה */}
          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            anchor={
              <TouchableOpacity
                onPress={() => setMenuVisible(true)}
                style={{
                  borderWidth: 1,
                  borderColor: "#E0E0E0",
                  borderRadius: 8,
                  padding: 16,
                  marginBottom: 12,
                  backgroundColor: "white",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text style={{ color: petData.type ? "#000" : "#999" }}>
                  {petData.type || "בחר סוג חיה *"}
                </Text>
                <Text style={{ color: "#666" }}>▼</Text>
              </TouchableOpacity>
            }
          >
            {["כלב", "חתול", "תוכי", "אחר"].map((type) => (
              <Menu.Item
                key={type}
                onPress={() => {
                  setPetData({ ...petData, type });
                  setMenuVisible(false);
                }}
                title={type}
              />
            ))}
          </Menu>

          <TextInput
            label="גזע"
            mode="outlined"
            value={petData.breed}
            onChangeText={(text) => setPetData({ ...petData, breed: text })}
            style={{ marginBottom: 12 }}
            placeholder="לא חובה"
          />

          {/* בחירת תאריך */}
          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            style={{
              borderWidth: 1,
              borderColor: "#E0E0E0",
              borderRadius: 8,
              padding: 16,
              backgroundColor: "white",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text style={{ color: petData.birthDate ? "#000" : "#999" }}>
              {petData.birthDate && petData.birthDate instanceof Date
                ? petData.birthDate.toLocaleDateString("he-IL")
                : "בחר תאריך לידה *"}
            </Text>
            <Text style={{ color: "#666" }}>📅</Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={
                petData.birthDate instanceof Date
                  ? petData.birthDate
                  : new Date()
              }
              mode="date"
              display="default"
              onChange={handleDateChange}
              maximumDate={new Date()}
            />
          )}
        </View>
      </View>

      {/* כפתורי ניווט */}
      <StepNavigationHeader
        step={1}
        total={4}
        onBack={handleBack}
        onNext={handleNext}
        canGoBack={true}
        canGoNext={canGoNext}
        backText="חזור"
        nextText="הבא"
        nextDisabled={!canGoNext}
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
