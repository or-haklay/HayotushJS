import React from "react";
import { View, Image } from "react-native";
import { Text, Button, TextInput } from "react-native-paper";
import ProgressDots from "../../../components/createPet/ProgressDots";
import PetIllustration from "../../../components/createPet/PetIllustration";
import { useRouter } from "expo-router";
import { usePetCreation } from "../../../context/PetCreationContext";

export default function Step2() {
  const router = useRouter();
  const { petData, setPetData } = usePetCreation();

  return (
    <View className="flex-1 justify-between items-center bg-white p-6">
      <Image
        source={require("../../../assets/images/logo.png")}
        style={{ width: 48, height: 48, marginTop: 20 }}
      />

      <PetIllustration
        source={require("../../../assets/images/dogs/dog-sick.png")}
      />

      <View style={{ alignItems: "center", paddingHorizontal: 16 }}>
        <Text variant="titleLarge" style={{ fontWeight: "bold" }}>
          בריאות לפני הכול 🩺
        </Text>
        <Text
          variant="bodyMedium"
          style={{ marginTop: 8, textAlign: "center" }}
        >
          הזן משקל ומספר שבב (אם יש)
        </Text>
      </View>

      {/* טופס */}
      <View style={{ width: "100%", marginTop: 16 }}>
        <TextInput
          label="משקל (ק״ג)"
          mode="outlined"
          keyboardType="numeric"
          value={petData.weight}
          onChangeText={(text) => setPetData({ ...petData, weight: text })}
          style={{ marginBottom: 12 }}
        />

        <TextInput
          label="מספר שבב"
          mode="outlined"
          value={petData.chipNumber}
          onChangeText={(text) => setPetData({ ...petData, chipNumber: text })}
        />
      </View>

      <ProgressDots step={2} total={5} />

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
          onPress={() => router.push("/pets/create/Step3")}
        >
          הבא
        </Button>
      </View>
    </View>
  );
}
