import React, { useState, useEffect, useMemo } from "react";
import { View, Platform, FlatList } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  TextInput,
  Button,
  Text,
  Chip,
  Snackbar,
  Switch,
} from "react-native-paper";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  createReminder,
  updateReminder,
  listReminders,
} from "../../../../services/remindersService";
import calendarService from "../../../../services/calendarService";
import { COLORS, FONTS } from "../../../../theme/theme";
import { useTranslation } from "react-i18next";

export default function NewReminder() {
  const { petId, reminderId } = useLocalSearchParams();
  const router = useRouter();
  const { t } = useTranslation();

  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState("09:00");
  const [repeat, setRepeat] = useState("none");
  const [showDate, setShowDate] = useState(false);
  const [showTime, setShowTime] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [syncWithGoogle, setSyncWithGoogle] = useState(true);
  const [googleCalendarAvailable, setGoogleCalendarAvailable] = useState(false);

  const INTERVALS = useMemo(
    () => [
      { value: "none", label: t("reminders.intervals.none") },
      { value: "daily", label: t("reminders.intervals.daily") },
      { value: "weekly", label: t("reminders.intervals.weekly") },
      { value: "monthly", label: t("reminders.intervals.monthly") },
      { value: "yearly", label: t("reminders.intervals.yearly") },
    ],
    [t]
  );

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
          setRepeat(found.repeatInterval || "none");
          setSyncWithGoogle(found.syncWithGoogle !== false);
        }
      } catch (e) {
        setErr(t("reminders.edit_load_error"));
      }
    })();
  }, [reminderId, petId]);

  useEffect(() => {
    checkGoogleCalendarAvailability();
  }, []);

  const checkGoogleCalendarAvailability = async () => {
    try {
      const response = await calendarService.checkAccess();
      setGoogleCalendarAvailable(response.success);
    } catch (error) {
      setGoogleCalendarAvailable(false);
    }
  };

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
        repeatInterval: repeat,
        syncWithGoogle: googleCalendarAvailable ? syncWithGoogle : false,
      };

      if (reminderId) {
        await updateReminder(reminderId, payload);
      } else {
        await createReminder(payload);
      }

      router.back();
    } catch (error) {
      console.error("❌ Error in submit:", error);

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
    <View style={{ flex: 1, backgroundColor: COLORS.white, padding: 16 }}>
      <Text style={FONTS.h2}>
        {reminderId
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

      <View style={{ marginTop: 12 }}>
        <Text style={{ marginBottom: 8, fontSize: 16, color: COLORS.dark }}>
          {t("reminders.frequency")}
        </Text>
        <FlatList
          data={INTERVALS}
          horizontal
          keyExtractor={(item) => item.value}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item: interval }) => (
            <Chip
              selected={repeat === interval.value}
              onPress={() => setRepeat(interval.value)}
              style={{
                marginRight: 6,
                backgroundColor:
                  repeat === interval.value ? COLORS.primary : COLORS.white,
                borderColor: COLORS.neutral + "33",
                borderWidth: 1,
              }}
              textStyle={{
                color: repeat === interval.value ? COLORS.white : COLORS.dark,
              }}
            >
              {interval.label}
            </Chip>
          )}
        />
      </View>

      <View
        style={{ flexDirection: "row", alignItems: "center", marginTop: 12 }}
      >
        <Switch
          value={syncWithGoogle}
          onValueChange={setSyncWithGoogle}
          disabled={!googleCalendarAvailable}
          color={COLORS.primary}
        />
        <Text style={{ marginLeft: 8 }}>{t("reminders.sync_with_google")}</Text>
      </View>

      {!googleCalendarAvailable && (
        <Text
          style={{
            marginTop: 8,
            fontSize: 12,
            color: COLORS.neutral,
            fontStyle: "italic",
          }}
        >
          {t("reminders.google_calendar_not_available")}
        </Text>
      )}

      <Button
        mode="contained"
        onPress={submit}
        loading={loading}
        style={{ marginTop: 16, backgroundColor: COLORS.primary }}
      >
        {reminderId ? t("reminders.save_changes") : t("reminders.save")}
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
