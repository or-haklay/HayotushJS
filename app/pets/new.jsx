import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Text, TextInput, Button, Snackbar } from "react-native-paper";
import { petService } from "../../services/petService";
import { COLORS, FONTS } from "../../theme/theme";

export default function PetForm() {
  const { petId } = useLocalSearchParams(); // אם קיים → עריכה
  const router = useRouter();
  const [name, setName] = useState("");
  const [species, setSpecies] = useState("dog");
  const [breed, setBreed] = useState("");
  const [chipNumber, setChipNumber] = useState("");
  const [profilePictureUrl, setProfilePictureUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      if (!petId) return;
      try {
        const p = await petService.getPetById(petId);
        setName(p.name || "");
        setSpecies(p.species || "dog");
        setBreed(p.breed || "");
        setChipNumber(p.chipNumber || "");
        setProfilePictureUrl(
          p.profilePictureUrl || p.photoUrl || p.imageUrl || ""
        );
      } catch {
        setErr("שגיאה בטעינת חיה לעריכה");
      }
    })();
  }, [petId]);

  const submit = async () => {
    if (!name.trim()) return setErr("שם חובה");
    if (!species.trim()) return setErr("סוג חובה");

    setLoading(true);
    try {
      const payload = {
        name: name.trim(),
        species: species.trim(),
        breed: breed?.trim() || undefined,
        chipNumber: chipNumber?.trim() || undefined,
        profilePictureUrl: profilePictureUrl?.trim() || undefined,
      };
      if (petId) await petService.updatePet(petId, payload);
      else await petService.createPet(payload);
      router.back();
    } catch {
      setErr("שמירה נכשלה");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.white, padding: 16 }}>
      <Text style={FONTS.h2}>{petId ? "עריכת חיה" : "הוספת חיה"}</Text>

      <TextInput
        label="שם"
        value={name}
        onChangeText={setName}
        mode="outlined"
        style={{ marginTop: 12 }}
      />
      <TextInput
        label="סוג (dog/cat/...)"
        value={species}
        onChangeText={setSpecies}
        mode="outlined"
        style={{ marginTop: 12 }}
      />
      <TextInput
        label="גזע (אופציונלי)"
        value={breed}
        onChangeText={setBreed}
        mode="outlined"
        style={{ marginTop: 12 }}
      />
      <TextInput
        label="מס׳ שבב (אופציונלי)"
        value={chipNumber}
        onChangeText={setChipNumber}
        mode="outlined"
        style={{ marginTop: 12 }}
      />
      <TextInput
        label="תמונת פרופיל (URL)"
        value={profilePictureUrl}
        onChangeText={setProfilePictureUrl}
        mode="outlined"
        style={{ marginTop: 12 }}
      />

      <Button
        mode="contained"
        onPress={submit}
        loading={loading}
        style={{ marginTop: 16, backgroundColor: COLORS.primary }}
      >
        {petId ? "שמור שינויים" : "שמור"}
      </Button>

      <Snackbar
        visible={!!err}
        onDismiss={() => setErr("")}
        duration={2500}
        style={{ backgroundColor: COLORS.error }}
      >
        {err}
      </Snackbar>
    </View>
  );
}
