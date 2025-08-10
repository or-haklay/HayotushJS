import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { Text, TextInput, Button, RadioButton } from "react-native-paper";
import { COLORS, SIZING, FONTS } from "../theme/theme";
import { useRouter } from "expo-router";

export default function AddEventModal() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [repeat, setRepeat] = useState("none");
  const saving = false;

  const onSave = async () => {
    // TODO: לחבר לשירות תזכורות בפועל ולהציג Push
    console.log({ title, date, repeat });
    router.back();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>תזכורת חדשה</Text>
      <TextInput
        label="שם התזכורת"
        value={title}
        onChangeText={setTitle}
        mode="outlined"
        style={styles.input}
      />
      <TextInput
        label="תאריך (YYYY-MM-DD)"
        value={date}
        keyboardType="numeric"
        onChangeText={setDate}
        mode="outlined"
        style={styles.input}
      />
      <RadioButton.Group onValueChange={setRepeat} value={repeat}>
        <View style={styles.row}>
          <RadioButton value="none" />
          <Text>ללא חזרה</Text>
        </View>
        <View style={styles.row}>
          <RadioButton value="monthly" />
          <Text>חודשי</Text>
        </View>
        <View style={styles.row}>
          <RadioButton value="yearly" />
          <Text>שנתי</Text>
        </View>
      </RadioButton.Group>
      <Button
        mode="contained"
        onPress={onSave}
        disabled={!title || !date}
        style={styles.button}
      >
        שמור
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SIZING.padding,
    backgroundColor: COLORS.background,
  },
  title: { ...FONTS.h2, color: COLORS.neutral, marginBottom: SIZING.margin },
  input: { marginBottom: SIZING.base },
  row: { flexDirection: "row", alignItems: "center" },
  button: { marginTop: SIZING.margin, backgroundColor: COLORS.dark },
});
