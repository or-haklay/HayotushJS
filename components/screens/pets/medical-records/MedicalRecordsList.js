import React, { useCallback, useState } from "react";
import { View, RefreshControl, FlatList } from "react-native";
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import { Text, List, FAB, IconButton, Snackbar } from "react-native-paper";
import {
  listMedicalRecords,
  deleteMedicalRecord,
} from "../../../../services/medicalRecordsService";
import { styles } from "./styles";

const MedicalRecordsList = () => {
  const { petId } = useLocalSearchParams();
  const router = useRouter();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listMedicalRecords({
        petId: petId,
        sort: "date",
        order: "desc",
      });
      setRows(data || []);
    } catch {
      setErr("שגיאה בטעינת מסמכים");
    } finally {
      setLoading(false);
    }
  }, [petId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>מסמכים רפואיים</Text>
      </View>

      <FlatList
        data={rows}
        keyExtractor={(it) => it._id}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={load} />
        }
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <List.Item
            title={item.recordName}
            description={`${new Date(item.date).toLocaleDateString(
              "he-IL"
            )} • ${item.recordType}`}
            onPress={() =>
              item.fileUrl &&
              router.push({
                pathname: "/(tabs)/chat",
                params: { url: item.fileUrl },
              })
            }
            right={(props) => (
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <IconButton
                  {...props}
                  icon="pencil"
                  onPress={() =>
                    router.push({
                      pathname: "/pets/[petId]/medical-records/new",
                      params: { petId, recordId: item._id },
                    })
                  }
                />
                <IconButton
                  {...props}
                  icon="delete"
                  onPress={async () => {
                    try {
                      await deleteMedicalRecord(item._id);
                      setRows((p) => p.filter((x) => x._id !== item._id));
                    } catch {
                      setErr("מחיקה נכשלה");
                    }
                  }}
                />
              </View>
            )}
          />
        )}
      />

      <FAB
        icon="plus"
        style={styles.fab}
        color={styles.fabText.color}
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
        duration={2500}
        style={styles.snackbar}
      >
        {err}
      </Snackbar>
    </View>
  );
};

export default MedicalRecordsList;
