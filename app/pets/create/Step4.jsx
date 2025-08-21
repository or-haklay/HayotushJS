import React from "react";
import { View, Image } from "react-native";
import { Text, Button, TextInput, Chip } from "react-native-paper";
import ProgressDots from "../../../components/createPet/ProgressDots";
import PetIllustration from "../../../components/createPet/PetIllustration";
import { useRouter } from "expo-router";
import { usePetCreation } from "../../../context/PetCreationContext";

export default function Step4() {
  const router = useRouter();
  const { petData, setPetData } = usePetCreation();

  const personalities = ["חברותי", "שובב", "רגוע", "שומר"];

  return (
    <View className="flex-1 justify-between items-center bg-white p-6">
      <Image
        source={require("../../../assets/images/logo.png")}
        style={{ width: 48, height: 48, marginTop: 20 }}
      />

      <PetIllustration
        source={require("../../../assets/images/dogs/dog-play.png")}
      />

      <View style={{ alignItems: "center", paddingHorizontal: 16 }}>
        <Text variant="titleLarge" style={{ fontWeight: "bold" }}>
          מי החיה שלך באמת? 🐾
        </Text>
        <Text
          variant="bodyMedium"
          style={{ marginTop: 8, textAlign: "center" }}
        >
          בחר אופי, מזון מועדף והוסף הערות
        </Text>
      </View>

      {/* טופס */}
      <View style={{ width: "100%", marginTop: 16 }}>
        <View
          style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 12 }}
        >
          {personalities.map((p) => (
            <Chip
              key={p}
              selected={petData.personality === p}
              onPress={() => setPetData({ ...petData, personality: p })}
              style={{ marginRight: 8, marginBottom: 8 }}
            >
              {p}
            </Chip>
          ))}
        </View>

        <TextInput
          label="מזון מועדף"
          mode="outlined"
          value={petData.favoriteFood}
          onChangeText={(text) =>
            setPetData({ ...petData, favoriteFood: text })
          }
          style={{ marginBottom: 12 }}
        />

        <TextInput
          label="הערות כלליות"
          mode="outlined"
          multiline
          value={petData.notes}
          onChangeText={(text) => setPetData({ ...petData, notes: text })}
        />
      </View>

      <ProgressDots step={4} total={5} />

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
          onPress={() => router.push("/pets/create/Step5")}
        >
          הבא
        </Button>
      </View>
    </View>
  );
}
