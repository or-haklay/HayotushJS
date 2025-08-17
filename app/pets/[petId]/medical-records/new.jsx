import React, { useState, useEffect } from "react";
import { View, Platform, FlatList } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { TextInput, Button, Text, Snackbar, Chip } from "react-native-paper";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  createMedicalRecord,
  updateMedicalRecord,
  listMedicalRecords,
} from "../../../../services/medicalRecordsService";
import { COLORS, FONTS } from "../../../../theme/theme";

const RECORD_TYPES = [
  { value: "vaccine", label: "חיסון" },
  { value: "checkup", label: "בדיקה" },
  { value: "lab", label: "בדיקת מעבדה" },
  { value: "surgery", label: "ניתוח" },
  { value: "doc", label: "מסמך" },
  { value: "other", label: "אחר" },
];

export default function NewMedicalRecord() {
  const { petId, recordId } = useLocalSearchParams();
  const router = useRouter();
  const [recordName, setRecordName] = useState("");
  const [recordType, setRecordType] = useState("vaccine");
  const [date, setDate] = useState(new Date());
  const [fileUrl, setFileUrl] = useState("");
  const [description, setDescription] = useState("");
  const [veterinarianName, setVeterinarianName] = useState("");
  const [clinic, setClinic] = useState("");
  const [err, setErr] = useState("");
  const [showPicker, setShowPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load existing record for editing
  useEffect(() => {
    (async () => {
      if (!recordId || !petId) return;
      try {
        const all = await listMedicalRecords({ petId, limit: 200 });
        const found = all.find((x) => (x.id || x._id) === recordId);
        if (found) {
          setRecordName(found.recordName || "");
          setRecordType(found.recordType || "vaccine");
          setDate(new Date(found.date));
          setFileUrl(found.fileUrl || "");
          setDescription(found.description || "");
          setVeterinarianName(found.veterinarianName || "");
          setClinic(found.clinic || "");
        }
      } catch (e) {
        setErr("שגיאה בטעינת מסמך לעריכה");
      }
    })();
  }, [recordId, petId]);

  const onSave = async () => {
    if (!recordName.trim()) return setErr("שם מסמך חובה");
    setLoading(true);
    try {
      const payload = {
        petId,
        recordName: recordName.trim(),
        recordType,
        date: date.toISOString(),
        fileUrl: fileUrl || undefined,
        description: description?.trim() || undefined,
        veterinarianName: veterinarianName?.trim() || undefined,
        clinic: clinic?.trim() || undefined,
      };

      if (recordId) {
        await updateMedicalRecord(recordId, payload);
      } else {
        await createMedicalRecord(payload);
      }
      router.back();
    } catch (e) {
      setErr("שמירה נכשלה");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.white, padding: 16 }}>
      <Text style={FONTS.h2}>
        {recordId ? "עריכת מסמך רפואי" : "מסמך רפואי חדש"}
      </Text>

      <TextInput
        label="שם המסמך"
        value={recordName}
        onChangeText={setRecordName}
        mode="outlined"
        style={{ marginTop: 12 }}
      />

      <View style={{ marginTop: 12 }}>
        <Text style={{ marginBottom: 8, fontSize: 16, color: COLORS.dark }}>
          סוג מסמך
        </Text>
        <FlatList
          data={RECORD_TYPES}
          horizontal
          keyExtractor={(item) => item.value}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item: type }) => (
            <Chip
              selected={recordType === type.value}
              onPress={() => setRecordType(type.value)}
              style={{
                marginRight: 6,
                backgroundColor:
                  recordType === type.value ? COLORS.primary : COLORS.white,
                borderColor: COLORS.neutral + "33",
                borderWidth: 1,
              }}
              textStyle={{
                color: recordType === type.value ? COLORS.white : COLORS.dark,
              }}
            >
              {type.label}
            </Chip>
          )}
        />
      </View>

      <TextInput
        label="תיאור (אופציונלי)"
        value={description}
        onChangeText={setDescription}
        mode="outlined"
        multiline
        style={{ marginTop: 12 }}
      />

      <TextInput
        label="שם הווטרינר (אופציונלי)"
        value={veterinarianName}
        onChangeText={setVeterinarianName}
        mode="outlined"
        style={{ marginTop: 12 }}
      />

      <TextInput
        label="שם הקליניקה (אופציונלי)"
        value={clinic}
        onChangeText={setClinic}
        mode="outlined"
        style={{ marginTop: 12 }}
      />

      <TextInput
        label="URL לקובץ (אופציונלי)"
        value={fileUrl}
        onChangeText={setFileUrl}
        mode="outlined"
        style={{ marginTop: 12 }}
      />

      <Button
        mode="outlined"
        onPress={() => setShowPicker(true)}
        style={{ marginTop: 12 }}
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
        style={{ marginTop: 16, backgroundColor: COLORS.primary }}
      >
        {recordId ? "שמור שינויים" : "שמור"}
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
