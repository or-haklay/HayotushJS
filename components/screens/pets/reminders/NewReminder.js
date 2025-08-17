import React, { useState } from "react";
import { View, Platform } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  TextInput,
  Button,
  Text,
  SegmentedButtons,
  Snackbar,
} from "react-native-paper";
import DateTimePicker from "@react-native-community/datetimepicker";
import { createReminder } from "../../../../services/remindersService";
import { styles } from "./styles";

const INTERVALS = ["none", "daily", "weekly", "monthly", "yearly"];

const NewReminder = () => {
  const { petId } = useLocalSearchParams();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState("09:00");
  const [repeat, setRepeat] = useState("none");
  const [showDate, setShowDate] = useState(false);
  const [showTime, setShowTime] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const submit = async () => {
    if (!title.trim()) return setErr("כותרת חובה");
    setLoading(true);
    try {
      // יצירת תאריך משולב עם השעה שנבחרה
      const [hours, minutes] = time.split(":").map(Number);
      const combinedDate = new Date(date);
      combinedDate.setHours(hours, minutes, 0, 0);

      await createReminder({
        petId: petId,
        title: title.trim(),
        description: desc?.trim(),
        date: combinedDate.toISOString(),
        time,
        repeatInterval: repeat,
      });
      router.back();
    } catch {
      setErr("שמירה נכשלה");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>תזכורת חדשה</Text>

      <TextInput
        mode="outlined"
        label="כותרת"
        value={title}
        onChangeText={setTitle}
        style={styles.input}
      />
      <TextInput
        mode="outlined"
        label="תיאור (אופציונלי)"
        value={desc}
        onChangeText={setDesc}
        multiline
        style={styles.input}
      />

      <Button
        mode="outlined"
        onPress={() => setShowDate(true)}
        style={styles.dateButton}
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
        style={styles.dateButton}
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

      <TextInput
        mode="outlined"
        label='שעה "HH:MM"'
        value={time}
        onChangeText={setTime}
        style={styles.input}
      />

      <View style={styles.segmentedContainer}>
        <SegmentedButtons
          value={repeat}
          onValueChange={setRepeat}
          buttons={INTERVALS.map((x) => ({ value: x, label: x }))}
          theme={styles.segmentedTheme}
        />
      </View>

      <Button
        mode="contained"
        onPress={submit}
        loading={loading}
        style={styles.saveButton}
      >
        שמור תזכורת
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

export default NewReminder;
