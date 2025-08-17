import React, { useState, useEffect } from "react";
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

const INTERVALS = [
  { value: "none", label: "ללא חזרה" },
  { value: "daily", label: "יומי" },
  { value: "weekly", label: "שבועי" },
  { value: "monthly", label: "חודשי" },
  { value: "yearly", label: "שנתי" },
];

export default function NewReminder() {
  const { petId, reminderId } = useLocalSearchParams();
  const router = useRouter();

  // בדיקה שה-petId קיים
  React.useEffect(() => {
    console.log("🔍 NewReminder mounted with petId:", petId);
    if (!petId) {
      console.error("❌ No petId provided!");
      setErr("לא נמצא מזהה חיית מחמד");
    }
  }, [petId]);

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
        setErr("שגיאה בטעינת תזכורת לעריכה");
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
      console.log("Google Calendar not available:", error);
      setGoogleCalendarAvailable(false);
    }
  };

  const submit = async () => {
    if (!title.trim()) return setErr("כותרת חובה");
    setLoading(true);
    try {
      console.log("🚀 Submitting reminder for petId:", petId);

      // יצירת תאריך משולב עם השעה שנבחרה
      const [hours, minutes] = time.split(":").map(Number);
      const combinedDate = new Date(date);
      combinedDate.setHours(hours, minutes, 0, 0);

      console.log("🔔 Frontend reminder data:", {
        originalDate: date,
        time: time,
        hours: hours,
        minutes: minutes,
        combinedDate: combinedDate,
        combinedDateISO: combinedDate.toISOString(),
      });

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

      console.log("✅ Reminder created successfully:", payload);
      router.back();
    } catch (error) {
      console.error("❌ Error in submit:", error);

      // הצגת הודעת שגיאה מפורטת יותר
      let errorMessage = "שמירה נכשלה";

      if (error.response?.status === 400) {
        errorMessage = "נתונים לא תקינים - בדוק את המידע שהזנת";
      } else if (error.response?.status === 401) {
        errorMessage = "אין הרשאה - התחבר מחדש";
      } else if (error.response?.status === 500) {
        errorMessage = "שגיאת שרת - נסה שוב מאוחר יותר";
      } else if (error.message) {
        errorMessage = `שגיאה: ${error.message}`;
      }

      setErr(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.white, padding: 16 }}>
      <Text style={FONTS.h2}>
        {reminderId ? "עריכת תזכורת" : "תזכורת חדשה"}
      </Text>

      <TextInput
        mode="outlined"
        label="כותרת"
        value={title}
        onChangeText={setTitle}
        style={{ marginTop: 12 }}
      />
      <TextInput
        mode="outlined"
        label="תיאור (אופציונלי)"
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
        בחר תאריך: {date.toLocaleDateString("he-IL")} • {time}
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
        בחר שעה: {time}
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
          תכיפות
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
        <Text style={{ marginLeft: 8 }}>סנכרן עם Google Calendar</Text>
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
          יומן גוגל לא זמין. התחבר עם גוגל בהגדרות כדי להפעיל
        </Text>
      )}

      <Button
        mode="contained"
        onPress={submit}
        loading={loading}
        style={{ marginTop: 16, backgroundColor: COLORS.primary }}
      >
        {reminderId ? "שמור שינויים" : "שמור"}
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
