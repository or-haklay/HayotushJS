import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { Text, TextInput, Button, List } from "react-native-paper";
import { COLORS, SIZING, FONTS } from "../../theme/theme";

export default function MedicalRecordsScreen() {
  const [records, setRecords] = useState([]);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");

  const addRecord = () => {
    if (!title || !date) return;
    setRecords((prev) => [
      ...prev,
      { id: String(prev.length + 1), title, date },
    ]);
    setTitle("");
    setDate("");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>היסטוריה רפואית</Text>
      {records.map((r) => (
        <List.Item
          key={r.id}
          title={r.title}
          description={r.date}
          style={styles.item}
        />
      ))}

      <Text style={styles.subtitle}>הוסף אירוע רפואי</Text>
      <TextInput
        label="שם האירוע"
        value={title}
        onChangeText={setTitle}
        mode="outlined"
        style={styles.input}
      />
      <TextInput
        label="תאריך (YYYY-MM-DD)"
        value={date}
        onChangeText={setDate}
        mode="outlined"
        style={styles.input}
      />
      <Button
        mode="contained"
        onPress={addRecord}
        style={{ marginTop: SIZING.base }}
      >
        הוסף
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
  subtitle: { ...FONTS.h3, color: COLORS.neutral, marginTop: SIZING.margin },
  item: {
    backgroundColor: COLORS.white,
    marginBottom: SIZING.base,
    borderRadius: SIZING.radius_md,
  },
  input: { marginBottom: SIZING.base },
});
