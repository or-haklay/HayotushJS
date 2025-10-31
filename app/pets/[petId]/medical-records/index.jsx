import React, { useCallback, useState, useMemo } from "react";
import {
  View,
  RefreshControl,
  FlatList,
  Alert,
  StyleSheet,
  Linking,
} from "react-native";
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import {
  Text,
  List,
  FAB,
  IconButton,
  Snackbar,
  Card,
  Chip,
  Divider,
  Button,
} from "react-native-paper";
import {
  listMedicalRecords,
  deleteMedicalRecord,
} from "../../../../services/medicalRecordsService";
import { getColors, FONTS, SIZING, COLORS } from "../../../../theme/theme";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../../../context/ThemeContext";
import { useRTL } from "../../../../hooks/useRTL";

export default function MedicalRecordsList() {
  const { petId } = useLocalSearchParams();
  const router = useRouter();
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const colors = getColors(isDark);
  const rtl = useRTL();
  const styles = createStyles(colors, rtl);
  const [rows, setRows] = useState([]);
  const [filteredRows, setFilteredRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // סינונים
  const [selectedType, setSelectedType] = useState(null);
  const [selectedDateRange, setSelectedDateRange] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  const RECORD_TYPE_LABELS = useMemo(
    () => ({
      vaccine: t("medical_records.types.vaccine"),
      checkup: t("medical_records.types.checkup"),
      lab: t("medical_records.types.lab"),
      surgery: t("medical_records.types.surgery"),
      doc: t("medical_records.types.doc"),
      medication: t("medical_records.types.medication"),
      other: t("medical_records.types.other"),
    }),
    [t]
  );

  const RECORD_TYPE_COLORS = useMemo(
    () => ({
      vaccine: colors.success,
      checkup: colors.info,
      lab: colors.warning,
      surgery: colors.error,
      doc: colors.primary,
      medication: colors.secondary,
      other: colors.neutral,
    }),
    [colors]
  );

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listMedicalRecords({
        petId,
        sort: "date",
        order: "desc",
      });
      setRows(data || []);
      setFilteredRows(data || []);
    } catch {
      setErr(t("medical_records.load_error"));
    } finally {
      setLoading(false);
    }
  }, [petId]);

  // פונקציה לסינון הנתונים
  const applyFilters = useCallback(() => {
    let filtered = [...rows];

    // סינון לפי סוג הטיפול
    if (selectedType) {
      filtered = filtered.filter(
        (record) => record.recordType === selectedType
      );
    }

    // סינון לפי טווח תאריכים
    if (selectedDateRange) {
      const now = new Date();
      const filterDate = new Date();

      switch (selectedDateRange) {
        case "week":
          filterDate.setDate(now.getDate() - 7);
          break;
        case "month":
          filterDate.setMonth(now.getMonth() - 1);
          break;
        case "3months":
          filterDate.setMonth(now.getMonth() - 3);
          break;
        case "6months":
          filterDate.setMonth(now.getMonth() - 6);
          break;
        case "year":
          filterDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      filtered = filtered.filter(
        (record) => new Date(record.date) >= filterDate
      );
    }

    setFilteredRows(filtered);
  }, [rows, selectedType, selectedDateRange]);

  // הפעלת הסינונים כאשר משתנים הסינונים
  React.useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  // פונקציה לאיפוס הסינונים
  const resetFilters = () => {
    setSelectedType(null);
    setSelectedDateRange(null);
    setFilteredRows([...rows]);
  };

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const handleDelete = (record) => {
    Alert.alert(
      t("medical_records.delete_title"),
      t("medical_records.delete_message", { name: record.recordName }),
      [
        { text: t("action.cancel"), style: "cancel" },
        {
          text: t("medical_records.delete"),
          style: "destructive",
          onPress: async () => {
            try {
              await deleteMedicalRecord(record.id || record._id);
              setRows((p) =>
                p.filter((x) => (x.id || x._id) !== (record.id || record._id))
              );
            } catch {
              setErr(t("medical_records.delete_error"));
            }
          },
        },
      ]
    );
  };

  const handleViewDocument = async (record) => {
    if (record.fileUrl) {
      try {
        // בדיקה שהקובץ הוא PDF
        if (
          record.fileMime === "application/pdf" ||
          record.fileUrl.endsWith(".pdf")
        ) {
          // פתיחת PDF ישירות בדפדפן או באפליקציה מתאימה
          const supported = await Linking.canOpenURL(record.fileUrl);

          if (supported) {
            await Linking.openURL(record.fileUrl);
          } else {
            // אם לא ניתן לפתוח ישירות, הצג הודעת שגיאה
            Alert.alert(
              t("medical_records.cannot_open_document"),
              t("medical_records.open_in_browser_message"),
              [
                { text: t("action.cancel"), style: "cancel" },
                {
                  text: t("medical_records.open_in_browser"),
                  onPress: async () => {
                    try {
                      await Linking.openURL(record.fileUrl);
                    } catch (error) {
                      console.error("Error opening URL:", error);
                      Alert.alert(
                        t("common.error"),
                        t("medical_records.cannot_open_document")
                      );
                    }
                  },
                },
              ]
            );
          }
        } else {
          // אם זה לא PDF, הצג הודעה מתאימה
          Alert.alert(
            t("medical_records.unsupported_file_type"),
            t("medical_records.unsupported_file_message"),
            [
              { text: t("action.cancel"), style: "cancel" },
              {
                text: t("medical_records.open_in_browser"),
                onPress: async () => {
                  try {
                    await Linking.openURL(record.fileUrl);
                  } catch (error) {
                    console.error("Error opening URL:", error);
                    Alert.alert(
                      t("common.error"),
                      t("medical_records.cannot_open_document")
                    );
                  }
                },
              },
            ]
          );
        }
      } catch (error) {
        console.error("Error handling document view:", error);
        Alert.alert(
          t("common.error"),
          t("medical_records.cannot_open_document")
        );
      }
    } else {
      Alert.alert(
        t("medical_records.no_document_attached"),
        t("medical_records.no_document_message")
      );
    }
  };

  const renderMedicalRecord = ({ item: record }) => (
    <Card style={styles.recordCard} elevation={2}>
      <Card.Content>
        <View style={styles.recordHeader}>
          <View style={styles.recordInfo}>
            <Text style={styles.recordName}>{record.recordName}</Text>
            <Chip
              mode="outlined"
              style={[
                styles.typeChip,
                {
                  borderColor:
                    RECORD_TYPE_COLORS[record.recordType] || colors.neutral,
                },
              ]}
              textStyle={{
                color: RECORD_TYPE_COLORS[record.recordType] || colors.neutral,
              }}
            >
              {RECORD_TYPE_LABELS[record.recordType] || record.recordType}
            </Chip>
          </View>
          <Text style={styles.recordDate}>
            {new Date(record.date).toLocaleDateString("he-IL")}
          </Text>
        </View>

        {record.description && (
          <Text style={styles.recordDescription} numberOfLines={2}>
            {record.description}
          </Text>
        )}

        {(record.veterinarianName || record.clinic) && (
          <View style={styles.recordDetails}>
            {record.veterinarianName && (
              <Text style={styles.detailText}>
                <Text style={styles.detailLabel}>
                  {t("medical_records.veterinarian")}:
                </Text>{" "}
                {record.veterinarianName}
              </Text>
            )}
            {record.clinic && (
              <Text style={styles.detailText}>
                <Text style={styles.detailLabel}>
                  {t("medical_records.clinic")}:
                </Text>{" "}
                {record.clinic}
              </Text>
            )}
          </View>
        )}

        <Divider style={styles.divider} />

        <View style={styles.recordActions}>
          <Button
            mode="outlined"
            onPress={() => handleViewDocument(record)}
            icon="file-document"
            disabled={!record.fileUrl}
            style={styles.actionButton}
          >
            {record.fileUrl
              ? t("medical_records.open_document")
              : t("medical_records.no_document")}
          </Button>

          <View style={styles.iconActions}>
            <IconButton
              icon="pencil"
              size={20}
              onPress={() =>
                router.push({
                  pathname: "/pets/[petId]/medical-records/new",
                  params: { petId, recordId: record.id || record._id },
                })
              }
              style={styles.iconButton}
            />
            <IconButton
              icon="delete"
              size={20}
              onPress={() => handleDelete(record)}
              style={[styles.iconButton, styles.deleteButton]}
            />
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t("medical_records.title")}</Text>
        <Text style={styles.subtitle}>
          {rows.length}{" "}
          {t("medical_records.documents_count", { count: rows.length })}
        </Text>
      </View>

      <FlatList
        data={rows}
        keyExtractor={(it) => it.id || it._id}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={load} />
        }
        contentContainerStyle={styles.listContainer}
        renderItem={renderMedicalRecord}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {t("medical_records.no_records_yet")}
              </Text>
              <Text style={styles.emptySubtext}>
                {t("medical_records.click_plus_to_add_first")}
              </Text>
            </View>
          ) : null
        }
      />

      <FAB
        icon="plus"
        style={styles.fab}
        color={colors.white}
        onPress={() =>
          router.push({
            pathname: "/pets/[petId]/medical-records/new",
            params: { petId },
          })
        }
      />

      <Snackbar
        visible={!!err}
        onDismiss={() => setErr("")}
        duration={4000}
        style={styles.snackbar}
        action={{
          label: t("action.close"),
          onPress: () => setErr(""),
        }}
      >
        {err}
      </Snackbar>
    </View>
  );
}

const createStyles = (colors, rtl) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      padding: SIZING.padding,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    title: {
      ...FONTS.h2,
      color: colors.primary,
      marginBottom: SIZING.base,
    },
    subtitle: {
      ...FONTS.caption,
      color: colors.textSecondary,
    },
    listContainer: {
      padding: SIZING.padding,
      paddingBottom: 96,
    },
    separator: {
      height: SIZING.base,
    },
    recordCard: {
      backgroundColor: colors.surface,
      borderRadius: SIZING.radius_lg,
    },
    recordHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: SIZING.base,
    },
    recordInfo: {
      flex: 1,
      marginRight: SIZING.base,
    },
    recordName: {
      ...FONTS.h4,
      marginBottom: SIZING.base,
      color: colors.text,
    },
    typeChip: {
      alignSelf: "flex-start",
    },
    recordDate: {
      ...FONTS.caption,
      color: colors.textSecondary,
      textAlign: rtl.textAlign,
    },
    recordDescription: {
      ...FONTS.body,
      color: colors.textSecondary,
      marginBottom: SIZING.base,
      fontStyle: "italic",
    },
    recordDetails: {
      marginBottom: SIZING.base,
    },
    detailText: {
      ...FONTS.caption,
      color: colors.textSecondary,
      marginBottom: 2,
    },
    detailLabel: {
      fontWeight: "bold",
      color: colors.text,
    },
    divider: {
      marginVertical: SIZING.base,
    },
    recordActions: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    actionButton: {
      flex: 1,
      marginRight: SIZING.base,
    },
    iconActions: {
      flexDirection: "row",
      gap: SIZING.base,
    },
    iconButton: {
      margin: 0,
    },
    deleteButton: {
      backgroundColor: colors.errorLight,
    },
    emptyContainer: {
      padding: SIZING.padding * 2,
      alignItems: "center",
    },
    emptyText: {
      ...FONTS.h4,
      color: colors.textSecondary,
      marginBottom: SIZING.base,
      textAlign: "center",
    },
    emptySubtext: {
      ...FONTS.body,
      color: colors.textSecondary,
      marginBottom: SIZING.base,
      textAlign: "center",
      fontStyle: "italic",
    },
    fab: {
      position: "absolute",
      right: 16,
      bottom: 24,
      backgroundColor: colors.primary,
    },
    snackbar: {
      backgroundColor: colors.error,
    },
  });
