import React, { useCallback, useMemo, useState, useEffect } from "react";
import { View, RefreshControl, FlatList, Alert, ScrollView } from "react-native";
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
  Chip,
} from "react-native-paper";
import {
  listExpenses,
  deleteExpense,
} from "../../../../services/expensesService";
import { COLORS, FONTS } from "../../../../theme/theme";
import { useTranslation } from "react-i18next";

const CATEGORIES = ["Vet", "Food", "Grooming", "Toys", "Insurance", "Other"];

export default function ExpensesListScreen() {
  const { petId } = useLocalSearchParams();
  const router = useRouter();
  const { t } = useTranslation();

  const [rows, setRows] = useState([]);
  const [category, setCategory] = useState(null);
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
      setErr(e?.response?.data?.message || t("expenses.load_error"));
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
    Alert.alert(t("expenses.delete_title"), t("expenses.delete_confirm"), [
      { text: t("action.cancel") },
      {
        text: t("expenses.delete"),
        style: "destructive",
        onPress: async () => {
          try {
            await deleteExpense(id);
            setRows((prev) => prev.filter((x) => (x.id || x._id) !== id));
          } catch (e) {
            setErr(e?.response?.data?.message || t("expenses.delete_error"));
          }
        },
      },
    ]);
  };

  // סינון לפי קטגוריה
  const filtered = useMemo(() => {
    if (!category) return rows;
    return rows.filter((r) => r.category === category);
  }, [rows, category]);

  const total = useMemo(
    () => filtered.reduce((s, r) => s + (Number(r.amount) || 0), 0),
    [filtered]
  );

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.white }}>
      <View style={{ padding: 16, paddingBottom: 8 }}>
        <Text style={FONTS.h2}>{t("expenses.title")}</Text>

        {/* קטגוריות */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginTop: 8 }}
        >
          <Chip
            selected={!category}
            onPress={() => setCategory(null)}
            style={{ marginRight: 8 }}
          >
            {t("expenses.all_categories")}
          </Chip>
          {CATEGORIES.map((c) => (
            <Chip
              key={c}
              selected={category === c}
              onPress={() => setCategory(category === c ? null : c)}
              style={{ marginRight: 8 }}
            >
              {c}
            </Chip>
          ))}
        </ScrollView>

        {/* מיון */}
        <View style={{ marginTop: 8 }}>
          <SegmentedButtons
            value={sortBy}
            onValueChange={setSortBy}
            buttons={[
              { value: "date", label: t("expenses.sort.date") },
              { value: "amount", label: t("expenses.sort.amount") },
              { value: "category", label: t("expenses.sort.category") },
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

        {/* סיכום */}
        <View
          style={{
            marginTop: 8,
            marginBottom: 8,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text style={FONTS.body}>
            {t("expenses.total")}: {total.toFixed(2)} {t("common.currency")}
          </Text>
          <Badge>{filtered.length}</Badge>
        </View>
      </View>

      <Divider />

      <FlatList
        data={filtered}
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
                    {Number(item.amount).toFixed(0)}
                    {t("common.currency")}
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
              <Text>{t("expenses.no_expenses")}</Text>
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
