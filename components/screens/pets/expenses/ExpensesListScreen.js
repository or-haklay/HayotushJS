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
import { isObjectId } from "../../../../utils/ids";
import { styles } from "./styles";

const ExpensesListScreen = () => {
  const { petId } = useLocalSearchParams();
  const router = useRouter();

  const [rows, setRows] = useState([]);
  const [sortBy, setSortBy] = useState("date");
  const [order, setOrder] = useState("desc");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const load = useCallback(async () => {
    if (!petId || !isObjectId(petId)) return;
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
    if (petId && isObjectId(petId)) {
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
            setRows((prev) => prev.filter((x) => x._id !== id));
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
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>הוצאות</Text>

        <View style={styles.sortContainer}>
          <SegmentedButtons
            value={sortBy}
            onValueChange={(value) => setSortBy(value)}
            buttons={[
              { value: "date", label: "תאריך" },
              { value: "amount", label: "סכום" },
              { value: "category", label: "קטגוריה" },
            ]}
            style={styles.segmentedButtons}
            theme={{
              colors: {
                secondaryContainer: COLORS.primary,
                onSecondaryContainer: COLORS.white,
              },
            }}
          />
          <View style={styles.orderContainer}>
            <IconButton
              icon={order === "asc" ? "sort-ascending" : "sort-descending"}
              onPress={() => setOrder((o) => (o === "asc" ? "desc" : "asc"))}
              iconColor={COLORS.primary}
            />
          </View>
        </View>

        <View style={styles.summaryContainer}>
          <Text style={styles.totalText}>סה״כ: {total.toFixed(2)} ₪</Text>
          <Badge>{rows.length}</Badge>
        </View>
      </View>

      <Divider />

      <FlatList
        data={rows}
        keyExtractor={(item) => item._id}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={load} />
        }
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <List.Item
            title={item.description}
            description={`${new Date(item.date).toLocaleDateString(
              "he-IL"
            )} • ${item.category}`}
            right={(props) => (
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Badge {...props} style={styles.amountBadge}>
                  {Number(item.amount).toFixed(0)}₪
                </Badge>
                <IconButton
                  {...props}
                  icon="pencil"
                  onPress={() =>
                    router.push({
                      pathname: "/pets/[petId]/expenses/new",
                      params: { petId, expenseId: item._id },
                    })
                  }
                />
                <IconButton
                  {...props}
                  icon="delete"
                  onPress={async () => {
                    try {
                      await deleteExpense(item._id);
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
        ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyContainer}>
              <Text>אין הוצאות עדיין.</Text>
            </View>
          ) : null
        }
      />

      <FAB
        icon="plus"
        style={styles.fab}
        color={COLORS.white}
        onPress={() =>
          router.push({
            pathname: "/pets/[petId]/expenses/new",
            params: { petId },
          })
        }
      />

      <IconButton
        icon="chart-bar"
        style={styles.chartButton}
        onPress={() =>
          router.push({
            pathname: "/pets/[petId]/expenses/summary",
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

export default ExpensesListScreen;
