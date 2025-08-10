import React from "react";
import { View, StyleSheet } from "react-native";
import { Text, Button, List } from "react-native-paper";
import { COLORS, SIZING, FONTS } from "../../theme/theme";
import { useRouter } from "expo-router";

export default function RemindersScreen() {
  const router = useRouter();
  // TODO: למשוך תזכורות אמיתיות מהשרת
  const items = [{ id: "1", title: "חיסון כלבת", date: "2025-09-01" }];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>התזכורות שלי</Text>
      {items.map((it) => (
        <List.Item
          key={it.id}
          title={it.title}
          description={it.date}
          style={styles.item}
        />
      ))}
      <Button mode="contained" onPress={() => router.push("/add-event-modal")}>
        תזכורת חדשה
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SIZING.padding,
    backgroundColor: COLORS.background,
  },
  title: { ...FONTS.h2, color: COLORS.neutral, marginBottom: SIZING.margin },
  item: {
    backgroundColor: COLORS.white,
    marginBottom: SIZING.base,
    borderRadius: SIZING.radius_md,
  },
});
