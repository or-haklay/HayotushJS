import React, { useCallback, useMemo, useState } from "react";
import { View, RefreshControl, FlatList, ScrollView } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import {
  Text,
  List,
  IconButton,
  Snackbar,
  Chip,
  Divider,
  FAB,
} from "react-native-paper";
import {
  listMedicalRecords,
  deleteMedicalRecord,
} from "../../services/medicalRecordsService";
import petService from "../../services/petService";
import { COLORS, FONTS } from "../../theme/theme";

const getId = (o) => (o?.id ?? o?._id) || null;

export default function GlobalMedicalRecords() {
  const router = useRouter();

  const [rows, setRows] = useState([]);
  const [pets, setPets] = useState([]);
  const [selectedPetId, setSelectedPetId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const petMap = useMemo(() => {
    const map = new Map();
    (pets || []).forEach((p) => map.set(getId(p), p.name || "—"));
    return map;
  }, [pets]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const myPets = await petService.getMyPets();
      setPets(Array.isArray(myPets) ? myPets : []);

      const data = await listMedicalRecords({
        petId: selectedPetId || undefined,
        sort: "date",
        order: "desc",
      });
      setRows(data || []);
    } catch {
      setErr("שגיאה בטעינת מסמכים");
    } finally {
      setLoading(false);
    }
  }, [selectedPetId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.white }}>
      <View style={{ padding: 16, paddingBottom: 8 }}>
        <Text style={FONTS.h2}>מסמכים רפואיים</Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginTop: 8 }}
        >
          <Chip
            selected={!selectedPetId}
            onPress={() => setSelectedPetId(null)}
            style={{ marginRight: 8 }}
          >
            הכל
          </Chip>
          {(pets || []).map((p) => {
            const id = getId(p);
            return (
              <Chip
                key={id}
                selected={selectedPetId === id}
                onPress={() =>
                  setSelectedPetId(selectedPetId === id ? null : id)
                }
                style={{ marginRight: 8 }}
                icon="paw"
              >
                {p.name}
              </Chip>
            );
          })}
        </ScrollView>
      </View>

      <Divider />

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
            )} • ${item.recordType}${
              item.petId ? " • " + (petMap.get(item.petId) || "") : ""
            }`}
            onPress={() => {
              if (item.petId)
                router.push({
                  pathname: "/pets/[petId]/medical-records",
                  params: { petId: item.petId },
                });
            }}
            right={(props) => (
              <IconButton
                {...props}
                icon="delete"
                onPress={async () => {
                  try {
                    await deleteMedicalRecord(item.id || item._id);
                    setRows((p) =>
                      p.filter((x) => (x.id || x._id) !== (item.id || item._id))
                    );
                  } catch {
                    setErr("מחיקה נכשלה");
                  }
                }}
              />
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

      {/* להוסיף מסמך גלובלי → נדרש לבחור חיה במסך הייעודי */}
      <FAB
        icon="plus"
        style={{
          position: "absolute",
          right: 16,
          bottom: 24,
          backgroundColor: COLORS.primary,
        }}
        color={COLORS.white}
        onPress={() => {
          const pid = selectedPetId || getId(pets?.[0]);
          if (pid)
            router.push({
              pathname: "/pets/[petId]/medical-records/new",
              params: { petId: pid },
            });
        }}
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
