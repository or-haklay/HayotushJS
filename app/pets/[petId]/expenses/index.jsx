import React, { useCallback, useMemo, useState, useEffect } from "react";
import { View, RefreshControl, FlatList, Alert } from "react-native";
import { useLocalSearchParams, useFocusEffect, useRouter } from "expo-router";
import {
  Text,
  List,
  FAB,
  SegmentedButtons,
  IconButton,
  Badge,
  Snackbar,
  Divider,
} from "react-native-paper";
import {
  listExpenses,
  deleteExpense,
} from "../../../../services/expensesService";
import { COLORS, FONTS } from "../../../../theme/theme";

export default function ExpensesListScreen() {
  const { petId } = useLocalSearchParams();
  const router = useRouter();

  const [rows, setRows] = useState([]);
  const [sortBy, setSortBy] = useState("date");
  const [order, setOrder] = useState("desc");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listExpenses({ petId, sort: sortBy, order });
      setRows(data || []);
    } catch (e) {
      setErr(e?.response?.data?.message || "שגיאה בטעינת הוצאות");
    } finally {
      setLoading(false);
    }
  }, [petId, sortBy, order]);

  // טוען הוצאות כשהדף נפתח
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  // טוען מחדש כשהמיון משתנה
  useEffect(() => {
    if (petId) {
      load();
    }
  }, [sortBy, order]);

  const onDelete = (id) => {
    Alert.alert("מחיקת הוצאה", "בטוח למחוק?", [
      { text: "ביטול" },
      {
        text: "מחק",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteExpense(id);
            setRows((prev) => prev.filter((x) => (x.id || x._id) !== id));
          } catch (e) {
            setErr(e?.response?.data?.message || "מחיקה נכשלה");
          }
        },
      },
    ]);
  };

  const total = useMemo(
    () => rows.reduce((s, r) => s + (Number(r.amount) || 0), 0),
    [rows]
  );

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.white }}>
      <View style={{ paddingHorizontal: 16, paddingTop: 12 }}>
        <Text style={[FONTS.h2]}>הוצאות</Text>

        <View style={{ marginTop: 8 }}>
          <SegmentedButtons
            value={sortBy}
            onValueChange={setSortBy}
            buttons={[
              { value: "date", label: "תאריך" },
              { value: "amount", label: "סכום" },
              { value: "category", label: "קטגוריה" },
            ]}
            style={{ backgroundColor: COLORS.white }}
            theme={{
              colors: {
                secondaryContainer: COLORS.primary,
                onSecondaryContainer: COLORS.white,
              },
            }}
          />
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "flex-end",
            }}
          >
            <IconButton
              icon={order === "asc" ? "sort-ascending" : "sort-descending"}
              onPress={() => setOrder((o) => (o === "asc" ? "desc" : "asc"))}
              iconColor={COLORS.primary}
            />
          </View>
        </View>

        <View
          style={{
            marginTop: 8,
            marginBottom: 8,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text style={FONTS.body}>סה״כ: {total.toFixed(2)} ₪</Text>
          <Badge>{rows.length}</Badge>
        </View>
      </View>

      <Divider />

      <FlatList
        data={rows}
        keyExtractor={(item) => item.id || item._id}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={load} />
        }
        contentContainerStyle={{ padding: 8, paddingBottom: 96 }}
        renderItem={({ item }) => {
          const id = item.id || item._id;
          return (
            <List.Item
              title={item.description}
              description={`${new Date(item.date).toLocaleDateString(
                "he-IL"
              )} • ${item.category}`}
              right={(props) => (
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Badge {...props} style={{ marginRight: 8 }}>
                    {Number(item.amount).toFixed(0)}₪
                  </Badge>
                  <IconButton
                    icon="pencil"
                    onPress={() =>
                      router.push({
                        pathname: "/pets/[petId]/expenses/new",
                        params: { petId, expenseId: id },
                      })
                    }
                  />
                  <IconButton icon="delete" onPress={() => onDelete(id)} />
                </View>
              )}
            />
          );
        }}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        ListEmptyComponent={
          !loading ? (
            <View style={{ padding: 24 }}>
              <Text>אין הוצאות עדיין.</Text>
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
            pathname: "/pets/[petId]/expenses/new",
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
