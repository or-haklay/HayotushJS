import React, { useCallback, useMemo, useState } from "react";
import { View, RefreshControl, FlatList, ScrollView } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import {
  Text,
  List,
  IconButton,
  Snackbar,
  Badge,
  Chip,
  FAB,
  Divider,
} from "react-native-paper";
import {
  listReminders,
  deleteReminder,
  completeReminder,
} from "../../services/remindersService";
import petService from "../../services/petService";
import { COLORS, FONTS } from "../../theme/theme";

const getId = (o) => (o?.id ?? o?._id) || null;

export default function GlobalReminders() {
  const router = useRouter();

  const [rows, setRows] = useState([]);
  const [pets, setPets] = useState([]);
  const [selectedPetId, setSelectedPetId] = useState(null); // null = הכל
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
      // חיות (לכותרות וסינון)
      const myPets = await petService.getMyPets();
      setPets(Array.isArray(myPets) ? myPets : []);

      // תזכורות — גלובלי או לפי petId
      const data = await listReminders({
        petId: selectedPetId || undefined,
        onlyUpcoming: false,
        sort: "date",
        order: "asc",
      });
      setRows(data || []);
    } catch (e) {
      setErr(e?.response?.data?.message || "שגיאה בטעינת תזכורות");
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
        <Text style={FONTS.h2}>תזכורות</Text>
        {/* סינון לפי חיה */}
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
            title={item.title}
            description={`${new Date(item.date).toLocaleString("he-IL")} • ${
              item.repeatInterval
            }`}
            left={(props) =>
              item.isCompleted ? <Badge {...props}>✔</Badge> : null
            }
            right={(props) => (
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                {!item.isCompleted && (
                  <IconButton
                    icon="check"
                    onPress={async () => {
                      try {
                        await completeReminder(item.id || item._id);
                        load();
                      } catch {
                        setErr("סימון נכשל");
                      }
                    }}
                  />
                )}
                <IconButton
                  icon="pencil"
                  onPress={() => {
                    const pid = item.petId;
                    if (pid)
                      router.push({
                        pathname: "/pets/[petId]/reminders/new",
                        params: { petId: pid, reminderId: item.id || item._id },
                      });
                  }}
                />
                <IconButton
                  icon="delete"
                  onPress={async () => {
                    try {
                      await deleteReminder(item.id || item._id);
                      setRows((p) =>
                        p.filter(
                          (x) => (x.id || x._id) !== (item.id || item._id)
                        )
                      );
                    } catch {
                      setErr("מחיקה נכשלה");
                    }
                  }}
                />
              </View>
            )}
            onPress={() => {
              const pid = item.petId;
              if (pid)
                router.push({
                  pathname: "/pets/[petId]/reminders",
                  params: { petId: pid },
                });
            }}
            descriptionNumberOfLines={2}
          />
        )}
        ListEmptyComponent={
          !loading ? (
            <View style={{ padding: 24 }}>
              <Text>אין תזכורות.</Text>
            </View>
          ) : null
        }
      />

      {/* הוספת תזכורת מהירה (מסך גלובלי) */}
      <FAB
        icon="plus"
        style={{
          position: "absolute",
          right: 16,
          bottom: 24,
          backgroundColor: COLORS.primary,
        }}
        color={COLORS.white}
        onPress={() => router.push("/modals/add-event-modal")}
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
