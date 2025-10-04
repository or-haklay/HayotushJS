import React, { useEffect, useState, useMemo } from "react";
import { View, Platform, FlatList } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
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
import { useToast } from "../../../../context/ToastContext";

export default function ExpenseFormScreen() {
  const { t } = useTranslation();
  // Safe useToast with error handling
  let showSuccess, showError;
  try {
    const toastContext = useToast();
    showSuccess = toastContext.showSuccess;
    showError = toastContext.showError;
  } catch (error) {
    console.warn("ToastProvider not available:", error.message);
    showSuccess = () => {}; // Fallback function
    showError = () => {}; // Fallback function
  }
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

  const CATEGORIES = useMemo(
    () => [
      { value: "Vet", label: t("expenses.categories.vet") },
      { value: "Food", label: t("expenses.categories.food") },
      { value: "Grooming", label: t("expenses.categories.grooming") },
      { value: "Toys", label: t("expenses.categories.toys") },
      { value: "Insurance", label: t("expenses.categories.insurance") },
      { value: "Other", label: t("expenses.categories.other") },
    ],
    [t]
  );

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
        setErr(t("expenses.edit_load_error"));
      }
    })();
  }, [expenseId, petId, t]);

  const submit = async () => {
    if (!description.trim())
      return setErr(t("expenses.validation.description_required"));
    const amt = Number(amount);
    if (isNaN(amt) || amt < 0)
      return setErr(t("expenses.validation.amount_invalid"));

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

      let pointsAdded = 0;
      if (expenseId) {
        await updateExpense(expenseId, payload);
        showSuccess(t("toast.success.expense_updated"));
      } else {
        const result = await createExpense(payload);
        pointsAdded = Number(result?.pointsAdded || 0);
        showSuccess(t("toast.success.expense_added"));
      }

      if (pointsAdded > 0) {
        showSuccess(
          t("toast.success.points_earned_expense", { count: pointsAdded })
        );
      }

      setTimeout(() => router.back(), 600);
    } catch (e) {
      console.error("❌ Error in submit:", e);
      showError(t("toast.error.save_failed"));
      setErr(e?.response?.data?.message || t("expenses.save_error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.white, padding: 16 }}>
      <Text style={FONTS.h2}>
        {expenseId ? t("expenses.edit_title") : t("expenses.add_title")}
      </Text>

      <TextInput
        label={t("expenses.fields.description")}
        value={description}
        onChangeText={setDescription}
        mode="outlined"
        style={{ marginTop: 12 }}
      />
      <HelperText type="error" visible={!description.trim()}>
        {!description.trim()
          ? t("expenses.validation.description_required")
          : ""}
      </HelperText>

      <TextInput
        label={t("expenses.fields.amount")}
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
        mode="outlined"
        style={{ marginTop: -8 }}
      />

      <View style={{ marginTop: 12 }}>
        <Text style={{ marginBottom: 8, fontSize: 16, color: COLORS.dark }}>
          {t("expenses.fields.category")}
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
        label={t("expenses.fields.vendor")}
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
        {t("expenses.fields.select_date")}: {date.toLocaleDateString("he-IL")}
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
        {expenseId
          ? t("expenses.actions.save_changes")
          : t("expenses.actions.save_expense")}
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
