import React, { useState } from "react";
import { View, Image } from "react-native";
import { Text, Button, TextInput, Menu } from "react-native-paper";
import ProgressDots from "../../../components/createPet/ProgressDots";
import PetIllustration from "../../../components/createPet/PetIllustration";
import { useRouter } from "expo-router";
import { usePetCreation } from "../../../context/PetCreationContext";

export default function Step1() {
  const router = useRouter();
  const { petData, setPetData } = usePetCreation();

  const [menuVisible, setMenuVisible] = useState(false);

  return (
    <View className="flex-1 justify-between items-center bg-white p-6">
      {/* לוגו */}
      <Image
        source={require("../../../assets/images/logo.png")}
        style={{ width: 48, height: 48, marginTop: 20 }}
      />

      {/* איור */}
      <PetIllustration
        source={require("../../../assets/images/dogs/dog-play.png")}
      />

      {/* טקסט */}
      <View style={{ alignItems: "center", paddingHorizontal: 16 }}>
        <Text variant="titleLarge" style={{ fontWeight: "bold" }}>
          בוא נכיר את חיית המחמד שלך 🐶
        </Text>
        <Text
          variant="bodyMedium"
          style={{ marginTop: 8, textAlign: "center" }}
        >
          הזן את השם, סוג וגיל החיה שלך
        </Text>
      </View>

      {/* טופס */}
      <View style={{ width: "100%", marginTop: 16 }}>
        <TextInput
          label="שם החיה"
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
            <Button
              mode="outlined"
              onPress={() => setMenuVisible(true)}
              style={{ marginBottom: 12 }}
            >
              {petData.type || "בחר סוג חיה"}
            </Button>
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
        />

        <TextInput
          label="תאריך לידה / גיל"
          mode="outlined"
          value={petData.birthDate}
          onChangeText={(text) => setPetData({ ...petData, birthDate: text })}
          placeholder="לדוגמה: 01/01/2020 או 3 שנים"
        />
      </View>

      {/* אינדיקטור שלבים */}
      <ProgressDots step={1} total={5} />

      {/* כפתורים */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          width: "100%",
          marginBottom: 20,
        }}
      >
        <Button mode="outlined" onPress={() => router.back()}>
          דלג
        </Button>
        <Button
          mode="contained"
          onPress={() => router.push("/pets/create/Step2")}
        >
          הבא
        </Button>
      </View>
    </View>
  );
}
