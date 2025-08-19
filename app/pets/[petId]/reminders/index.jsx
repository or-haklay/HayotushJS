import React, { useCallback, useState, useMemo } from "react";
import { View, RefreshControl, FlatList, ScrollView } from "react-native";
import { useLocalSearchParams, useFocusEffect, useRouter } from "expo-router";
import {
  Text,
  List,
  FAB,
  IconButton,
  Snackbar,
  Badge,
  Chip,
  Divider,
} from "react-native-paper";
import {
  listReminders,
  deleteReminder,
  completeReminder,
} from "../../../../services/remindersService";
import petService from "../../../../services/petService";
import { COLORS, FONTS } from "../../../../theme/theme";
import { useTranslation } from "react-i18next";

const getId = (o) => (o?.id ?? o?._id) || null;

export default function RemindersList() {
  const { petId } = useLocalSearchParams();
  const router = useRouter();
  const { t } = useTranslation();

  const [rows, setRows] = useState([]);
  const [pets, setPets] = useState([]);
  const [selectedPetId, setSelectedPetId] = useState(petId || null);
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
      // טעינת חיות לסינון
      const myPets = await petService.getMyPets();
      setPets(Array.isArray(myPets) ? myPets : []);

      const data = await listReminders({
        petId: selectedPetId || undefined,
        onlyUpcoming: false,
        sort: "date",
        order: "asc",
      });
      setRows(data || []);
    } catch (e) {
      setErr(e?.response?.data?.message || t("reminders.load_error"));
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
        <Text style={FONTS.h2}>{t("reminders.title")}</Text>

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
            {t("reminders.all")}
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
        renderItem={({ item }) => {
          const petName = petMap.get(item.petId) || "";
          const description = `${new Date(item.date).toLocaleString(
            "he-IL"
          )} • ${item.repeatInterval}${
            petName && !selectedPetId ? " • " + petName : ""
          }`;

          return (
            <List.Item
              title={item.title}
              description={description}
              left={(props) =>
                item.isCompleted ? <Badge {...props}>✔</Badge> : null
              }
              right={(props) => (
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  {!item.isCompleted ? (
                    <IconButton
                      icon="check"
                      onPress={async () => {
                        try {
                          await completeReminder(item.id || item._id, true);

                          // עדכון מיידי של ה-state
                          setRows((prev) =>
                            prev.map((r) =>
                              (r.id || r._id) === (item.id || item._id)
                                ? { ...r, isCompleted: true }
                                : r
                            )
                          );
                        } catch (error) {
                          setErr(t("reminders.complete_error"));
                        }
                      }}
                    />
                  ) : (
                    <IconButton
                      icon="undo"
                      onPress={async () => {
                        try {
                          await completeReminder(item.id || item._id, false);

                          // עדכון מיידי של ה-state
                          setRows((prev) =>
                            prev.map((r) =>
                              (r.id || r._id) === (item.id || item._id)
                                ? { ...r, isCompleted: false }
                                : r
                            )
                          );
                        } catch (error) {
                          setErr(t("reminders.undo_error"));
                        }
                      }}
                    />
                  )}
                  <IconButton
                    icon="pencil"
                    onPress={() => {
                      const pid = item.petId || selectedPetId || petId;
                      if (pid) {
                        router.push({
                          pathname: "/pets/[petId]/reminders/new",
                          params: {
                            petId: pid,
                            reminderId: item.id || item._id,
                          },
                        });
                      }
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
                        setErr(t("reminders.delete_error"));
                      }
                    }}
                  />
                </View>
              )}
              descriptionNumberOfLines={2}
            />
          );
        }}
        ListEmptyComponent={
          !loading ? (
            <View style={{ padding: 24 }}>
              <Text>{t("reminders.no_reminders")}</Text>
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
        onPress={() => {
          const pid = selectedPetId || petId || getId(pets?.[0]);
          if (pid) {
            router.push({
              pathname: "/pets/[petId]/reminders/new",
              params: { petId: pid },
            });
          }
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
