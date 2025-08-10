import React, { useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Text, TextInput, Button, HelperText } from "react-native-paper";
import { COLORS, SIZING, FONTS } from "../theme/theme"; // ברמת app/ → ../
import { useRouter } from "expo-router";
import petService from "../services/petService";

export default function AddPetScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [type, setType] = useState("כלב");
  const [birthDate, setBirthDate] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [saving, setSaving] = useState(false);

  const canSave = name?.trim().length > 0 && type?.trim().length > 0;

  const onSave = async () => {
    if (!canSave) return;
    setSaving(true);
    try {
      await petService.createPet({
        name,
        type,
        birthDate,
        profilePictureUrl: imageUrl,
      });
      router.back();
    } catch (e) {
      console.error("Failed to create pet", e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>הוספת חיית מחמד</Text>
      <TextInput
        label="שם"
        value={name}
        onChangeText={setName}
        mode="outlined"
        style={styles.input}
      />
      <TextInput
        label="סוג (כלב/חתול)"
        value={type}
        onChangeText={setType}
        mode="outlined"
        style={styles.input}
      />
      <TextInput
        label="תאריך לידה (YYYY-MM-DD)"
        value={birthDate}
        onChangeText={setBirthDate}
        mode="outlined"
        style={styles.input}
      />
      <TextInput
        label="תמונת פרופיל (URL)"
        value={imageUrl}
        onChangeText={setImageUrl}
        mode="outlined"
        style={styles.input}
      />
      <HelperText type="info">
        אפשר להעלות תמונות אמיתיות בגרסאות הבאות.
      </HelperText>
      <Button
        mode="contained"
        onPress={onSave}
        disabled={!canSave || saving}
        style={styles.button}
      >
        {saving ? "שומר..." : "שמור"}
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: SIZING.padding,
    backgroundColor: COLORS.background,
  },
  title: { ...FONTS.h2, color: COLORS.neutral, marginBottom: SIZING.margin },
  input: { marginBottom: SIZING.base },
  button: { marginTop: SIZING.margin, backgroundColor: COLORS.dark },
});
