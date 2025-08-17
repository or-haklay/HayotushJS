import React, { useEffect, useState } from "react";
import { View, Platform } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  TextInput,
  Button,
  Text,
  HelperText,
  SegmentedButtons,
  Snackbar,
} from "react-native-paper";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  createExpense,
  updateExpense,
  listExpenses,
} from "../../../../services/expensesService";
import { COLORS, FONTS } from "../../../../theme/theme";
import { isObjectId } from "../../../../utils/ids";
import { styles } from "./styles";

const CATEGORIES = ["Vet", "Food", "Grooming", "Toys", "Insurance", "Other"];

const ExpenseFormScreen = () => {
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

  // מצב עריכה: טוען את ההוצאה מתוך הרשימה (אין GET /:id בשרת)
  useEffect(() => {
    (async () => {
      if (!expenseId || !petId) return;
      try {
        const all = await listExpenses({ petId, limit: 200 });
        const found = all.find((x) => x._id === expenseId);
        if (found) {
          setDescription(found.description || "");
          setAmount(String(found.amount ?? ""));
          setCategory(found.category || "Vet");
          setVendor(found.vendor || "");
          setDate(new Date(found.date));
        }
      } catch (e) {
        setErr("שגיאה בטעינת הוצאה לעריכה");
      }
    })();
  }, [expenseId, petId]);

  const submit = async () => {
    if (!petId || !isObjectId(petId))
      return setErr("petId לא תקין. חזור לפרופיל החיה ונסה שוב.");

    // ולידציה קלה בצד לקוח
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
      if (expenseId) await updateExpense(expenseId, payload);
      else await createExpense(payload);

      router.back();
    } catch (e) {
      setErr(e?.response?.data?.message || "שמירה נכשלה");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {expenseId ? "עריכת הוצאה" : "הוספת הוצאה"}
      </Text>

      <TextInput
        label="תיאור"
        value={description}
        onChangeText={setDescription}
        mode="outlined"
        style={styles.descriptionInput}
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
        style={styles.amountInput}
      />

      <View style={styles.categoryContainer}>
        <SegmentedButtons
          value={category}
          onValueChange={setCategory}
          buttons={CATEGORIES.map((c) => ({ value: c, label: c }))}
          style={styles.segmentedButtons}
          theme={{
            colors: {
              secondaryContainer: COLORS.primary,
              onSecondaryContainer: COLORS.white,
            },
          }}
        />
      </View>

      <TextInput
        label="ספק (אופציונלי)"
        value={vendor}
        onChangeText={setVendor}
        mode="outlined"
        style={styles.vendorInput}
      />

      <Button
        mode="outlined"
        onPress={() => setShowPicker(true)}
        style={styles.dateButton}
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
        style={styles.submitButton}
      >
        {expenseId ? "שמור שינויים" : "שמור הוצאה"}
      </Button>

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

export default ExpenseFormScreen;
