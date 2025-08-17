import React, { useEffect, useState } from "react";
import { View, Platform, FlatList } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  TextInput,
  Button,
  Text,
  HelperText,
  Chip,
  Snackbar,
} from "react-native-paper";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  createExpense,
  updateExpense,
  listExpenses,
} from "../../../../services/expensesService";
import { COLORS, FONTS } from "../../../../theme/theme";

const CATEGORIES = [
  { value: "Vet", label: "Vet" },
  { value: "Food", label: "Food" },
  { value: "Grooming", label: "Grooming" },
  { value: "Toys", label: "Toys" },
  { value: "Insurance", label: "Insurance" },
  { value: "Other", label: "Other" },
];

export default function ExpenseFormScreen() {
  const { petId, expenseId } = useLocalSearchParams();
  const router = useRouter();

  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Vet");
  const [vendor, setVendor] = useState("");

  useEffect(() => {
    (async () => {
      if (!expenseId) return;
      try {
        const all = await listExpenses({ petId, limit: 1000 });
        const found = all.find((x) => (x.id || x._id) === expenseId);
        if (found) {
          setDescription(found.description || "");
          setAmount(String(found.amount ?? ""));
          setCategory(found.category || "Vet");
          setVendor(found.vendor || "");
          setDate(new Date(found.date));
        }
      } catch {
        setErr("שגיאה בטעינת הוצאה לעריכה");
      }
    })();
  }, [expenseId, petId]);

  const submit = async () => {
    if (!description.trim()) return setErr("תיאור חובה");
    const amt = Number(amount);
    if (isNaN(amt) || amt < 0) return setErr("סכום לא תקין");

    setLoading(true);
    try {
      const payload = {
        petId,
        description: description.trim(),
        amount: amt,
        category,
        date: date.toISOString(),
        vendor: vendor?.trim() || undefined,
      };

      console.log("💰 Frontend expense payload:", {
        petId,
        description: description.trim(),
        amount: amt,
        category,
        date: date.toISOString(),
        vendor: vendor?.trim() || undefined,
        originalDate: date,
        dateType: typeof date,
      });

      if (expenseId) await updateExpense(expenseId, payload);
      else await createExpense(payload);

      router.back();
    } catch (e) {
      console.error("❌ Error in submit:", e);
      setErr(e?.response?.data?.message || "שמירה נכשלה");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.white, padding: 16 }}>
      <Text style={FONTS.h2}>{expenseId ? "עריכת הוצאה" : "הוספת הוצאה"}</Text>

      <TextInput
        label="תיאור"
        value={description}
        onChangeText={setDescription}
        mode="outlined"
        style={{ marginTop: 12 }}
      />
      <HelperText type="error" visible={!description.trim()}>
        {!description.trim() ? "תיאור חובה" : ""}
      </HelperText>

      <TextInput
        label="סכום"
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
        mode="outlined"
        style={{ marginTop: -8 }}
      />

      <View style={{ marginTop: 12 }}>
        <Text style={{ marginBottom: 8, fontSize: 16, color: COLORS.dark }}>
          קטגוריה
        </Text>
        <FlatList
          data={CATEGORIES}
          horizontal
          keyExtractor={(item) => item.value}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item: c }) => (
            <Chip
              selected={category === c.value}
              onPress={() => setCategory(c.value)}
              style={{
                marginRight: 6,
                backgroundColor:
                  category === c.value ? COLORS.primary : COLORS.white,
                borderColor: COLORS.neutral + "33",
                borderWidth: 1,
              }}
              textStyle={{
                color: category === c.value ? COLORS.white : COLORS.dark,
              }}
            >
              {c.label}
            </Chip>
          )}
        />
      </View>

      <TextInput
        label="ספק (אופציונלי)"
        value={vendor}
        onChangeText={setVendor}
        mode="outlined"
        style={{ marginTop: 12 }}
      />

      <Button
        mode="outlined"
        onPress={() => setShowPicker(true)}
        style={{ marginTop: 12 }}
      >
        בחר תאריך: {date.toLocaleDateString("he-IL")}
      </Button>
      {showPicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display={Platform.OS === "ios" ? "inline" : "default"}
          onChange={(_, d) => {
            setShowPicker(false);
            if (d) setDate(d);
          }}
        />
      )}

      <Button
        mode="contained"
        onPress={submit}
        loading={loading}
        style={{ marginTop: 16, backgroundColor: COLORS.primary }}
      >
        {expenseId ? "שמור שינויים" : "שמור הוצאה"}
      </Button>

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
