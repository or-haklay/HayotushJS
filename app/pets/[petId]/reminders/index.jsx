import React, { useCallback, useState } from "react";
import { View, RefreshControl, FlatList } from "react-native";
import { useLocalSearchParams, useFocusEffect, useRouter } from "expo-router";
import {
  Text,
  List,
  FAB,
  IconButton,
  Snackbar,
  Badge,
} from "react-native-paper";
import {
  listReminders,
  deleteReminder,
  completeReminder,
} from "../../../../services/remindersService";
import { COLORS, FONTS } from "../../../../theme/theme";

export default function RemindersList() {
  const { petId } = useLocalSearchParams();
  const router = useRouter();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listReminders({
        petId,
        onlyUpcoming: false,
        sort: "date",
        order: "asc",
      });
      setRows(data || []);
    } catch {
      setErr("שגיאה בטעינת תזכורות");
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
        <Text style={FONTS.h2}>תזכורות</Text>
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
                  onPress={() =>
                    router.push({
                      pathname: "/pets/[petId]/reminders/new",
                      params: { petId, reminderId: item.id || item._id },
                    })
                  }
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
          />
        )}
        ListEmptyComponent={
          !loading ? (
            <View style={{ padding: 24 }}>
              <Text>אין תזכורות עדיין.</Text>
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
            pathname: "/pets/[petId]/reminders/new",
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
