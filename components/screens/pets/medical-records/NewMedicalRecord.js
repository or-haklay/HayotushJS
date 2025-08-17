import React, { useState } from "react";
import { View, Platform } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { TextInput, Button, Text, Snackbar } from "react-native-paper";
import DateTimePicker from "@react-native-community/datetimepicker";
import { createMedicalRecord } from "../../../../services/medicalRecordsService";
import { styles } from "./styles";

const NewMedicalRecord = () => {
  const { petId } = useLocalSearchParams();
  const router = useRouter();
  const [recordName, setRecordName] = useState("");
  const [recordType, setRecordType] = useState("vaccine");
  const [date, setDate] = useState(new Date());
  const [fileUrl, setFileUrl] = useState("");
  const [err, setErr] = useState("");
  const [showPicker, setShowPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSave = async () => {
    if (!recordName.trim()) return setErr("שם מסמך חובה");
    setLoading(true);
    try {
      await createMedicalRecord({
        petId: petId,
        recordName: recordName.trim(),
        recordType,
        date: date.toISOString(),
        fileUrl: fileUrl || undefined,
      });
      router.back();
    } catch {
      setErr("שמירה נכשלה");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>מסמך רפואי חדש</Text>

      <TextInput
        label="שם המסמך"
        value={recordName}
        onChangeText={setRecordName}
        mode="outlined"
        style={styles.input}
      />
      <TextInput
        label="סוג (vaccine/checkup/...)"
        value={recordType}
        onChangeText={setRecordType}
        mode="outlined"
        style={styles.input}
      />
      <TextInput
        label="URL לקובץ (אופציונלי)"
        value={fileUrl}
        onChangeText={setFileUrl}
        mode="outlined"
        style={styles.input}
      />

      <Button
        mode="outlined"
        onPress={() => setShowPicker(true)}
        style={styles.dateButton}
      >
        בחר תאריך: {date.toLocaleDateString("he-IL")}
      </Button>
      {showPicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display={Platform.OS === "ios" ? "inline" : "default"}
          onChange={(_, d) => {
            setShowPicker(false);
            if (d) setDate(d);
          }}
        />
      )}

      <Button
        mode="contained"
        onPress={onSave}
        loading={loading}
        style={styles.saveButton}
      >
        שמור
      </Button>

      <Snackbar
        visible={!!err}
        onDismiss={() => setErr("")}
        duration={2500}
        style={styles.snackbar}
      >
        {err}
      </Snackbar>
    </View>
  );
};

export default NewMedicalRecord;
