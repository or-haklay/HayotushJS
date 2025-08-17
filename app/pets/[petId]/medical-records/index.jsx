import React, { useCallback, useState } from "react";
import { View, RefreshControl, FlatList } from "react-native";
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import { Text, List, FAB, IconButton, Snackbar } from "react-native-paper";
import {
  listMedicalRecords,
  deleteMedicalRecord,
} from "../../../../services/medicalRecordsService";
import { COLORS, FONTS } from "../../../../theme/theme";

export default function MedicalRecordsList() {
  const { petId } = useLocalSearchParams();
  const router = useRouter();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listMedicalRecords({
        petId,
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
    <View style={{ flex: 1, backgroundColor: COLORS.white }}>
      <View style={{ padding: 16 }}>
        <Text style={FONTS.h2}>מסמכים רפואיים</Text>
      </View>

      <FlatList
        data={rows}
        keyExtractor={(it) => it.id || it._id}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={load} />
        }
        contentContainerStyle={{ paddingHorizontal: 8, paddingBottom: 96 }}
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
                      params: { petId, recordId: item.id || item._id },
                    })
                  }
                />
                <IconButton
                  {...props}
                  icon="delete"
                  onPress={async () => {
                    try {
                      await deleteMedicalRecord(item.id || item._id);
                      setRows((p) =>
                        p.filter((x) => (x.id || item._id) !== (item.id || item._id))
                      );
                    } catch {
                      setErr("מחיקה נכשלה");
                    }
                  }}
                />
              </View>
            )}
          />
        )}
        ListEmptyComponent={
          !loading ? (
            <View style={{ padding: 24 }}>
              <Text>אין מסמכים עדיין.</Text>
            </View>
          ) : null
        }
      />

      <FAB
        icon="plus"
        style={{
          position: "absolute",
          right: 16,
          bottom: 24,
          backgroundColor: COLORS.primary,
        }}
        color={COLORS.white}
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
        style={{ backgroundColor: COLORS.error }}
      >
        {err}
      </Snackbar>
    </View>
  );
}
