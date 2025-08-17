import React, { useCallback, useMemo, useState, useEffect } from "react";
import { View, RefreshControl, FlatList, ScrollView } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import {
  Text,
  List,
  IconButton,
  Snackbar,
  Chip,
  SegmentedButtons,
  Badge,
  Divider,
  FAB,
} from "react-native-paper";
import { listExpenses, deleteExpense } from "../../services/expensesService";
import petService from "../../services/petService";
import { COLORS, FONTS } from "../../theme/theme";

const getId = (o) => (o?.id ?? o?._id) || null;
const CATEGORIES = ["Vet", "Food", "Grooming", "Toys", "Insurance", "Other"];

export default function GlobalExpenses() {
  const router = useRouter();

  const [rows, setRows] = useState([]);
  const [pets, setPets] = useState([]);
  const [selectedPetId, setSelectedPetId] = useState(null);
  const [category, setCategory] = useState(null);
  const [sortBy, setSortBy] = useState("date");
  const [order, setOrder] = useState("desc");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const petMap = useMemo(() => {
    const map = new Map();
    (pets || []).forEach((p) => map.set(getId(p), p.name || "—"));
    return map;
  }, [pets]);

  const filtered = useMemo(() => {
    if (!category) return rows;
    return rows.filter((r) => r.category === category);
  }, [rows, category]);

  const total = useMemo(
    () => filtered.reduce((s, r) => s + (Number(r.amount) || 0), 0),
    [filtered]
  );

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const myPets = await petService.getMyPets();
      setPets(Array.isArray(myPets) ? myPets : []);

      const data = await listExpenses({
        petId: selectedPetId || undefined,
        sort: sortBy,
        order,
      });
      setRows(data || []);
    } catch {
      setErr("שגיאה בטעינת הוצאות");
    } finally {
      setLoading(false);
    }
  }, [selectedPetId, sortBy, order]);

  // טוען הוצאות כשהדף נפתח
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  // טוען מחדש כשהמיון משתנה
  useEffect(() => {
    if (pets.length > 0) {
      // רק אחרי שהחיות נטענו
      load();
    }
  }, [sortBy, order]);

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.white }}>
      <View style={{ padding: 16, paddingBottom: 8 }}>
        <Text style={FONTS.h2}>הוצאות</Text>

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
            כל הקטגוריות
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
          <Text style={FONTS.body}>סה״כ: {total.toFixed(2)} ₪</Text>
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
        contentContainerStyle={{ paddingHorizontal: 8, paddingBottom: 96 }}
        renderItem={({ item }) => {
          const id = item.id || item._id;
          const title = item.description;
          const subtitle = `${new Date(item.date).toLocaleDateString(
            "he-IL"
          )} • ${item.category}${
            item.petId ? " • " + (petMap.get(item.petId) || "") : ""
          }`;
          return (
            <List.Item
              title={title}
              description={subtitle}
              right={(props) => (
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Badge {...props} style={{ marginRight: 8 }}>
                    {Number(item.amount).toFixed(0)}₪
                  </Badge>
                  <IconButton
                    icon="delete"
                    onPress={async () => {
                      try {
                        await deleteExpense(id);
                        setRows((prev) =>
                          prev.filter((x) => (x.id || x._id) !== id)
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
                    pathname: "/pets/[petId]/expenses",
                    params: { petId: pid },
                  });
              }}
            />
          );
        }}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        ListEmptyComponent={
          !loading ? (
            <View style={{ padding: 24 }}>
              <Text>אין הוצאות.</Text>
            </View>
          ) : null
        }
      />

      {/* הוספת הוצאה גלובלית: ננווט לדף הוספה של החיה המסומנת (או הראשונה שיש) */}
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
              pathname: "/pets/[petId]/expenses/new",
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
