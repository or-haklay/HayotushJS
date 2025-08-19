import React, { useState, useEffect } from "react";
import { View, ScrollView, Platform, Alert, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import {
  TextInput,
  Button,
  Text,
  Snackbar,
  Card,
  HelperText,
  Portal,
  Dialog,
  Chip,
} from "react-native-paper";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  createMedicalRecord,
  updateMedicalRecord,
  getMedicalRecord,
} from "../../../../services/medicalRecordsService";
import uploadService from "../../../../services/uploadService";
import { COLORS, FONTS, SIZING } from "../../../../theme/theme";

const RECORD_TYPES = [
  { value: "vaccine", label: "medical_records.types.vaccine", icon: "needle" },
  { value: "checkup", label: "medical_records.types.checkup", icon: "stethoscope" },
  { value: "lab", label: "medical_records.types.lab", icon: "test-tube" },
  { value: "surgery", label: "medical_records.types.surgery", icon: "scissors-cutting" },
  { value: "doc", label: "medical_records.types.doc", icon: "file-document" },
  { value: "medication", label: "medical_records.types.medication", icon: "pill" },
  { value: "other", label: "medical_records.types.other", icon: "plus" },
];

export default function NewMedicalRecord() {
  const { t } = useTranslation();
  const { petId, recordId } = useLocalSearchParams();
  const router = useRouter();
  const isEditing = !!recordId;

  // Form state
  const [recordName, setRecordName] = useState("");
  const [recordType, setRecordType] = useState("vaccine");
  const [date, setDate] = useState(new Date());
  const [description, setDescription] = useState("");
  const [veterinarianName, setVeterinarianName] = useState("");
  const [clinic, setClinic] = useState("");

  // File upload state
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileUrl, setFileUrl] = useState("");
  const [fileMime, setFileMime] = useState("");
  const [existingFileUrl, setExistingFileUrl] = useState("");

  // UI state
  const [err, setErr] = useState("");
  const [showPicker, setShowPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showTypeSelector, setShowTypeSelector] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditing);

  // טעינת נתונים קיימים אם זה עריכה
  useEffect(() => {
    if (isEditing && recordId) {
      loadExistingRecord();
    }
  }, [recordId]);

  const loadExistingRecord = async () => {
    try {
      setInitialLoading(true);
      const record = await getMedicalRecord(recordId);
      if (record) {
        setRecordName(record.recordName || "");
        setRecordType(record.recordType || "vaccine");
        setDate(new Date(record.date) || new Date());
        setDescription(record.description || "");
        setVeterinarianName(record.veterinarianName || "");
        setClinic(record.clinic || "");
        setFileUrl(record.fileUrl || "");
        setFileMime(record.fileMime || "");
        setExistingFileUrl(record.fileUrl || "");
      }
    } catch (error) {
      console.error("Error loading existing record:", error);
      setErr(t("medical_records.errors.load_existing"));
    } finally {
      setInitialLoading(false);
    }
  };

  const handlePickDocument = async () => {
    try {
      const document = await uploadService.pickDocument();
      if (document) {
        setSelectedFile(document);
        setFileMime(document.mimeType || "application/pdf");
      }
    } catch (error) {
      console.error("Error picking document:", error);
      Alert.alert(t("common.error"), t("medical_records.errors.pick_document"));
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFileUrl("");
    setFileMime("");
  };

  const validateForm = () => {
    if (!recordName.trim()) {
      setErr(t("medical_records.validation.record_name_required"));
      return false;
    }
    if (!recordType) {
      setErr(t("medical_records.validation.record_type_required"));
      return false;
    }
    return true;
  };

  const onSave = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      let uploadedUrl = fileUrl;
      let uploadedMime = fileMime;

      // אם יש מסמך נבחר, העלה אותו ל-S3
      if (selectedFile) {
        const uploadResult = await uploadService.uploadMedicalDocument(
          selectedFile
        );
        if (uploadResult && uploadResult.success) {
          uploadedUrl = uploadResult.fileUrl;
          uploadedMime =
            uploadResult.fileMime || selectedFile.mimeType || "application/pdf";
          // עדכון סטייט בשביל UI, אבל לא מסתמכים עליו לשמירה
          setFileUrl(uploadedUrl);
          setFileMime(uploadedMime);
        } else {
          throw new Error(t("medical_records.errors.upload_document"));
        }
      } else if (isEditing && existingFileUrl) {
        // אם זה עריכה ולא נבחר מסמך חדש, השתמש במסמך הקיים
        uploadedUrl = existingFileUrl;
        uploadedMime = fileMime;
      }

      // צור או עדכן את הרישום הרפואי
      if (isEditing) {
        await updateMedicalRecord(recordId, {
          petId: petId,
          recordName: recordName.trim(),
          recordType,
          date: date.toISOString(),
          fileUrl: uploadedUrl || undefined,
          fileMime: uploadedMime || undefined,
          description: description.trim() || undefined,
          veterinarianName: veterinarianName.trim() || undefined,
          clinic: clinic.trim() || undefined,
        });
      } else {
        await createMedicalRecord({
          petId: petId,
          recordName: recordName.trim(),
          recordType,
          date: date.toISOString(),
          fileUrl: uploadedUrl || undefined,
          fileMime: uploadedMime || undefined,
          description: description.trim() || undefined,
          veterinarianName: veterinarianName.trim() || undefined,
          clinic: clinic.trim() || undefined,
        });
      }

      router.back();
    } catch (error) {
      console.error("Error saving medical record:", error);
      setErr(error?.response?.data?.message || t("medical_records.errors.save_failed"));
    } finally {
      setLoading(false);
    }
  };

  const getRecordTypeLabel = (value) => {
    const type = RECORD_TYPES.find((t) => t.value === value);
    return type ? t(type.label) : value;
  };

  const getRecordTypeIcon = (value) => {
    const type = RECORD_TYPES.find((t) => t.value === value);
    return type ? type.icon : "file";
  };

  return (
    <View style={styles.container}>
      {initialLoading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>{t("medical_records.loading")}</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.title}>
                {isEditing ? t("medical_records.edit_title") : t("medical_records.new_title")}
              </Text>

              {/* שם המסמך */}
              <TextInput
                label={t("medical_records.fields.record_name") + " *"}
                value={recordName}
                onChangeText={setRecordName}
                mode="outlined"
                style={styles.input}
                error={!recordName.trim()}
              />
              <HelperText type="error" visible={!recordName.trim()}>
                {t("medical_records.validation.record_name_required")}
              </HelperText>

              {/* סוג המסמך */}
              <Button
                mode="outlined"
                onPress={() => setShowTypeSelector(true)}
                style={styles.typeButton}
                icon={getRecordTypeIcon(recordType)}
              >
                {t("medical_records.fields.type")}: {getRecordTypeLabel(recordType)}
              </Button>

              {/* תאריך */}
              <Button
                mode="outlined"
                onPress={() => setShowPicker(true)}
                style={styles.dateButton}
                icon="calendar"
              >
                {t("medical_records.fields.date")}: {date.toLocaleDateString("he-IL")}
              </Button>

              {/* תיאור */}
              <TextInput
                label={t("medical_records.fields.description")}
                value={description}
                onChangeText={setDescription}
                mode="outlined"
                style={styles.input}
                multiline
                numberOfLines={3}
              />

              {/* שם הווטרינר */}
              <TextInput
                label={t("medical_records.fields.veterinarian_name")}
                value={veterinarianName}
                onChangeText={setVeterinarianName}
                mode="outlined"
                style={styles.input}
              />

              {/* שם הקליניקה */}
              <TextInput
                label={t("medical_records.fields.clinic")}
                value={clinic}
                onChangeText={setClinic}
                mode="outlined"
                style={styles.input}
              />

              {/* העלאת מסמך */}
              <View style={styles.fileSection}>
                <Text style={styles.sectionTitle}>{t("medical_records.fields.attached_document")}</Text>

                {selectedFile ? (
                  <View style={styles.fileInfo}>
                    <Text style={styles.fileName} numberOfLines={1}>
                      {selectedFile.name || t("medical_records.file.selected_document")}
                    </Text>
                    <View style={styles.fileActions}>
                      <Button
                        mode="outlined"
                        onPress={handleRemoveFile}
                        compact
                        icon="delete"
                      >
                        {t("common.remove")}
                      </Button>
                    </View>
                  </View>
                ) : existingFileUrl ? (
                  <View style={styles.fileInfo}>
                    <Text style={styles.fileName} numberOfLines={1}>
                      {t("medical_records.file.existing_document")}
                    </Text>
                    <View style={styles.fileActions}>
                      <Button
                        mode="outlined"
                        onPress={() => {
                          // פתח את המסמך הקיים
                          const { Linking } = require("react-native");
                          Linking.openURL(existingFileUrl);
                        }}
                        compact
                        icon="eye"
                      >
                        {t("common.view")}
                      </Button>
                      <Button
                        mode="outlined"
                        onPress={() => {
                          setExistingFileUrl("");
                          setFileUrl("");
                          setFileMime("");
                        }}
                        compact
                        icon="delete"
                      >
                        {t("common.remove")}
                      </Button>
                    </View>
                  </View>
                ) : (
                  <Button
                    mode="outlined"
                    onPress={handlePickDocument}
                    style={styles.uploadButton}
                    icon="upload"
                  >
                    {t("medical_records.file.select_pdf")}
                  </Button>
                )}

                <Text style={styles.fileHelp}>
                  {t("medical_records.file.help_text")}
                </Text>
              </View>

              {/* כפתור שמירה */}
              <Button
                mode="contained"
                onPress={onSave}
                loading={loading}
                disabled={loading || !recordName.trim()}
                style={styles.saveButton}
                icon="content-save"
              >
                {loading
                  ? t("common.saving")
                  : isEditing
                  ? t("medical_records.actions.update")
                  : t("medical_records.actions.save")}
              </Button>
            </Card.Content>
          </Card>
        </ScrollView>
      )}

      {/* Date Picker Modal */}
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

      {/* Type Selector Modal */}
      <Portal>
        <Dialog
          visible={showTypeSelector}
          onDismiss={() => setShowTypeSelector(false)}
          style={styles.dialog}
        >
          <Dialog.Title>{t("medical_records.type_selector.title")}</Dialog.Title>
          <Dialog.Content>
            <View style={styles.typeGrid}>
              {RECORD_TYPES.map((type) => (
                <Chip
                  key={type.value}
                  selected={recordType === type.value}
                  onPress={() => {
                    setRecordType(type.value);
                    setShowTypeSelector(false);
                  }}
                  style={styles.typeChip}
                  icon={type.icon}
                >
                  {t(type.label)}
                </Chip>
              ))}
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowTypeSelector(false)}>{t("common.cancel")}</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Error Snackbar */}
      <Snackbar
        visible={!!err}
        onDismiss={() => setErr("")}
        duration={4000}
        style={styles.snackbar}
        action={{
          label: t("common.close"),
          onPress: () => setErr(""),
        }}
      >
        {err}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContainer: {
    padding: SIZING.padding,
    paddingBottom: SIZING.padding * 2,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: SIZING.radius_lg,
    elevation: 2,
    marginBottom: SIZING.margin,
  },
  title: {
    ...FONTS.h2,
    marginBottom: SIZING.margin,
    textAlign: "center",
    color: COLORS.primary,
  },
  input: {
    marginBottom: SIZING.base,
    backgroundColor: COLORS.white,
  },
  typeButton: {
    marginBottom: SIZING.base,
    borderColor: COLORS.primary,
    borderWidth: 1,
  },
  dateButton: {
    marginBottom: SIZING.base,
    borderColor: COLORS.primary,
    borderWidth: 1,
  },
  saveButton: {
    marginTop: SIZING.margin,
    backgroundColor: COLORS.primary,
    paddingVertical: SIZING.base,
  },

  // File upload styles
  fileSection: {
    marginTop: SIZING.margin,
    padding: SIZING.base,
    backgroundColor: COLORS.lightGray,
    borderRadius: SIZING.radius_sm,
  },
  sectionTitle: {
    ...FONTS.h4,
    marginBottom: SIZING.base,
    color: COLORS.neutral,
  },
  fileInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.white,
    padding: SIZING.base,
    borderRadius: SIZING.radius_sm,
    marginBottom: SIZING.base,
  },
  fileName: {
    ...FONTS.body,
    flex: 1,
    marginRight: SIZING.base,
  },
  fileActions: {
    flexDirection: "row",
    gap: SIZING.base,
  },
  uploadButton: {
    borderColor: COLORS.primary,
    borderWidth: 1,
    marginBottom: SIZING.base,
  },
  fileHelp: {
    ...FONTS.caption,
    color: COLORS.neutral,
    fontStyle: "italic",
    textAlign: "center",
  },

  // Dialog styles
  dialog: {
    margin: SIZING.margin,
  },
  typeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SIZING.base,
    justifyContent: "center",
  },
  typeChip: {
    marginBottom: SIZING.base,
  },

  // Error styles
  snackbar: {
    backgroundColor: COLORS.error,
  },

  // Loading styles
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  loadingText: {
    ...FONTS.h3,
    color: COLORS.primary,
  },
});
