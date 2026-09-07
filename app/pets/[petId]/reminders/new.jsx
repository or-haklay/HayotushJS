import React, { useState, useEffect } from "react";
import { View, Platform } from "react-native";
import { useLocalSearchParams } from "expo-router";
import {
  TextInput,
  Button,
  Text,
  Snackbar,
} from "react-native-paper";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  createReminder,
  updateReminder,
  listReminders,
} from "../../../../services/remindersService";
import AddToCalendarButton from "../../../../components/reminders/AddToCalendarButton";
import { FONTS, getColors } from "../../../../theme/theme";
import { useTheme } from "../../../../context/ThemeContext";
import { useTranslation } from "react-i18next";
import { useToast } from "../../../../context/ToastContext";

export default function NewReminder() {
  const { petId, reminderId } = useLocalSearchParams();
  const { t, i18n } = useTranslation();
  const { isDark } = useTheme();
  const colors = getColors(isDark);
  // Safe useToast with error handling
  let showSuccess, showError;
  try {
    const toastContext = useToast();
    showSuccess = toastContext.showSuccess;
    showError = toastContext.showError;
  } catch (error) {
    showSuccess = () => {}; // Fallback function
    showError = () => {}; // Fallback function
  }

  const [currentReminderId, setCurrentReminderId] = useState(
    reminderId || null
  );
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState("09:00");
  const [showDate, setShowDate] = useState(false);
  const [showTime, setShowTime] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const languageCode = i18n.language?.split("-")[0] || "he";

  // בדיקה שה-petId קיים
  React.useEffect(() => {
    if (!petId) {
      console.error("❌ No petId provided!");
      setErr(t("reminders.no_pet_id"));
    }
  }, [petId]);

  // Load existing reminder for editing
  useEffect(() => {
    (async () => {
      if (!reminderId || !petId) return;
      try {
        const all = await listReminders({ petId, limit: 200 });
        const found = all.find((x) => (x.id || x._id) === reminderId);
        if (found) {
          setTitle(found.title || "");
          setDesc(found.description || "");
          setDate(new Date(found.date));
          setTime(found.time || "09:00");
          setCurrentReminderId(found._id || reminderId);
        }
      } catch (e) {
        setErr(t("reminders.edit_load_error"));
      }
    })();
  }, [reminderId, petId]);

  const submit = async () => {
    if (!title.trim()) return setErr(t("reminders.title_required"));
    setLoading(true);
    try {
      // יצירת תאריך משולב עם השעה שנבחרה
      const [hours, minutes] = time.split(":").map(Number);
      const combinedDate = new Date(date);
      combinedDate.setHours(hours, minutes, 0, 0);

      const payload = {
        petId,
        title: title.trim(),
        description: desc?.trim(),
        date: combinedDate.toISOString(),
        time,
      };

      let pointsAdded = 0;
      if (currentReminderId) {
        await updateReminder(currentReminderId, payload);
        showSuccess(t("toast.success.reminder_updated"));
      } else {
        const result = await createReminder(payload);
        pointsAdded = Number(result?.pointsAdded || 0);
        if (result?.reminder?._id) {
          setCurrentReminderId(result.reminder._id);
        }
        showSuccess(t("toast.success.reminder_created"));
      }

      if (pointsAdded > 0) {
        showSuccess(
          t("toast.success.points_earned_reminder", { count: pointsAdded })
        );
      }

      setErr("");
    } catch (error) {
      console.error("❌ Error in submit:", error);
      showError(t("toast.error.save_failed"));

      // הצגת הודעת שגיאה מפורטת יותר
      let errorMessage = t("reminders.save_failed");

      if (error.response?.status === 400) {
        errorMessage = t("reminders.invalid_data_error");
      } else if (error.response?.status === 401) {
        errorMessage = t("reminders.unauthorized_error");
      } else if (error.response?.status === 500) {
        errorMessage = t("reminders.server_error");
      } else if (error.message) {
        errorMessage = `${t("common.error")}: ${error.message}`;
      }

      setErr(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface, padding: 16 }}>
      <Text style={FONTS.h2}>
        {currentReminderId
          ? t("reminders.edit_reminder")
          : t("reminders.new_reminder")}
      </Text>

      <TextInput
        mode="outlined"
        label={t("reminders.title")}
        value={title}
        onChangeText={setTitle}
        style={{ marginTop: 12 }}
      />
      <TextInput
        mode="outlined"
        label={t("reminders.description_optional")}
        value={desc}
        onChangeText={setDesc}
        multiline
        style={{ marginTop: 12 }}
      />

      <Button
        mode="outlined"
        onPress={() => setShowDate(true)}
        style={{ marginTop: 12 }}
      >
        {t("reminders.select_date")}: {date.toLocaleDateString("he-IL")}
      </Button>
      {showDate && (
        <DateTimePicker
          value={date}
          mode="date"
          display={Platform.OS === "ios" ? "inline" : "default"}
          onChange={(_, d) => {
            setShowDate(false);
            if (d) setDate(d);
          }}
        />
      )}

      <Button
        mode="outlined"
        onPress={() => setShowTime(true)}
        style={{ marginTop: 12 }}
      >
        {t("reminders.select_time")}: {time}
      </Button>
      {showTime && (
        <DateTimePicker
          value={new Date(`2000-01-01T${time}:00`)}
          mode="time"
          display={Platform.OS === "ios" ? "inline" : "default"}
          onChange={(_, t) => {
            setShowTime(false);
            if (t) {
              const hours = t.getHours().toString().padStart(2, "0");
              const minutes = t.getMinutes().toString().padStart(2, "0");
              setTime(`${hours}:${minutes}`);
            }
          }}
        />
      )}

      <Button
        mode="contained"
        onPress={submit}
        loading={loading}
        style={{ marginTop: 16, backgroundColor: colors.primary }}
      >
        {currentReminderId
          ? t("reminders.save_changes")
          : t("reminders.save")}
      </Button>

      {currentReminderId ? (
        <AddToCalendarButton
          reminderId={currentReminderId}
          language={languageCode}
          style={{ marginTop: 12 }}
        />
      ) : null}

      <Snackbar
        visible={!!err}
        onDismiss={() => setErr("")}
        duration={2500}
        style={{ backgroundColor: colors.error }}
      >
        {err}
      </Snackbar>
    </View>
  );
}
