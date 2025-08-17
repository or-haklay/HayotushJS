import React, { useEffect, useState } from "react";
import { View, Platform, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import {
  Text,
  TextInput,
  Button,
  SegmentedButtons,
  Chip,
  Snackbar,
} from "react-native-paper";
import DateTimePicker from "@react-native-community/datetimepicker";
import petService from "../../services/petService";
import { createReminder } from "../../services/remindersService";
import { COLORS, FONTS } from "../../theme/theme";

const INTERVALS = ["none", "daily", "weekly", "monthly", "yearly"];
const getId = (o) => (o?.id ?? o?._id) || null;

export default function AddEventModal() {
  const router = useRouter();

  const [pets, setPets] = useState([]);
  const [petId, setPetId] = useState(null);

  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [date, setDate] = useState(new Date());
  const [showDate, setShowDate] = useState(false);
  const [time, setTime] = useState("09:00");
  const [repeat, setRepeat] = useState("none");
  const [showTime, setShowTime] = useState(false);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const ps = await petService.getMyPets();
        setPets(Array.isArray(ps) ? ps : []);
        if (ps?.length) setPetId(getId(ps[0]));
      } catch {
        setErr("שגיאה בטעינת חיות");
      }
    })();
  }, []);

  const save = async () => {
    if (!title.trim()) return setErr("כותרת חובה");
    if (!petId) return setErr("יש לבחור חיה");

    setLoading(true);
    try {
      // יצירת תאריך משולב עם השעה שנבחרה
      const [hours, minutes] = time.split(':').map(Number);
      const combinedDate = new Date(date);
      combinedDate.setHours(hours, minutes, 0, 0);

      await createReminder({
        petId,
        title: title.trim(),
        description: desc?.trim(),
        date: combinedDate.toISOString(),
        time,
        repeatInterval: repeat,
      });
      router.back();
    } catch (e) {
      setErr(e?.response?.data?.message || "שמירה נכשלה");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.white }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 24 }}>
        <Text style={FONTS.h2}>תזכורת חדשה</Text>

        {/* בחירת חיה */}
        <Text style={[FONTS.h3, { marginTop: 12 }]}>בחר חיה</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginTop: 8 }}
        >
          {(pets || []).map((p) => {
            const id = getId(p);
            return (
              <Chip
                key={id}
                selected={petId === id}
                onPress={() => setPetId(id)}
                icon="paw"
                style={{ marginRight: 8 }}
              >
                {p.name}
              </Chip>
            );
          })}
        </ScrollView>

        <TextInput
          label="כותרת"
          value={title}
          onChangeText={setTitle}
          mode="outlined"
          style={{ marginTop: 12 }}
        />
        <TextInput
          label="תיאור (אופציונלי)"
          value={desc}
          onChangeText={setDesc}
          mode="outlined"
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
                const hours = t.getHours().toString().padStart(2, '0');
                const minutes = t.getMinutes().toString().padStart(2, '0');
                setTime(`${hours}:${minutes}`);
              }
            }}
          />
        )}

        <TextInput
          label='שעה "HH:MM"'
          value={time}
          onChangeText={setTime}
          mode="outlined"
          style={{ marginTop: 12 }}
        />

        <View style={{ marginTop: 12 }}>
          <SegmentedButtons
            value={repeat}
            onValueChange={setRepeat}
            buttons={INTERVALS.map((x) => ({ value: x, label: x }))}
            theme={{
              colors: {
                secondaryContainer: COLORS.primary,
                onSecondaryContainer: COLORS.white,
              },
            }}
          />
        </View>

        <Button
          mode="contained"
          onPress={save}
          loading={loading}
          style={{ marginTop: 16, backgroundColor: COLORS.primary }}
        >
          שמור תזכורת
        </Button>
      </ScrollView>

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
