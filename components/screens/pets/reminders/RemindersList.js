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
import { styles } from "./styles";

const RemindersList = () => {
  const { petId } = useLocalSearchParams();
  const router = useRouter();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listReminders({
        petId: petId,
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
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>תזכורות</Text>
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
            title={item.title}
            description={`${new Date(item.date).toLocaleString("he-IL")} • ${
              item.repeatInterval
            }`}
            left={(props) =>
              item.isCompleted ? <Badge {...props}>✔</Badge> : null
            }
            right={(props) => (
              <View style={styles.actionButtons}>
                {!item.isCompleted && (
                  <IconButton
                    icon="check"
                    onPress={async () => {
                      try {
                        await completeReminder(item._id);
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
                      params: { petId, reminderId: item._id },
                    })
                  }
                />
                <IconButton
                  icon="delete"
                  onPress={async () => {
                    try {
                      await deleteReminder(item._id);
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
            pathname: "/pets/[petId]/reminders/new",
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

export default RemindersList;
