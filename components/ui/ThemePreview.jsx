import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Card, Button } from "react-native-paper";
import { useTheme } from "../../context/ThemeContext";
import { getColors } from "../../theme/theme";

const ThemePreview = () => {
  const { isDark, toggleTheme } = useTheme();
  const colors = getColors(isDark);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Card style={[styles.card, { backgroundColor: colors.surface }]}>
        <Text style={[styles.title, { color: colors.text }]}>
          מצב נוכחי: {isDark ? "חשוך" : "בהיר"}
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          צבעי הרקע והטקסט מתאימים למצב
        </Text>

        <View style={styles.colorPalette}>
          <View style={[styles.colorBox, { backgroundColor: colors.primary }]}>
            <Text style={[styles.colorLabel, { color: colors.onPrimary }]}>
              Primary
            </Text>
          </View>
          <View style={[styles.colorBox, { backgroundColor: colors.accent }]}>
            <Text style={[styles.colorLabel, { color: colors.onAccent }]}>
              Accent
            </Text>
          </View>
          <View style={[styles.colorBox, { backgroundColor: colors.success }]}>
            <Text style={[styles.colorLabel, { color: colors.onSuccess }]}>
              Success
            </Text>
          </View>
          <View style={[styles.colorBox, { backgroundColor: colors.error }]}>
            <Text style={[styles.colorLabel, { color: colors.onError }]}>
              Error
            </Text>
          </View>
        </View>

        <Button
          mode="contained"
          onPress={toggleTheme}
          style={[styles.button, { backgroundColor: colors.primary }]}
          labelStyle={{ color: colors.onPrimary }}
        >
          החלף למצב {isDark ? "בהיר" : "חשוך"}
        </Button>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: "center",
  },
  card: {
    padding: 20,
    borderRadius: 12,
    elevation: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  colorPalette: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  colorBox: {
    width: 60,
    height: 60,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    margin: 4,
  },
  colorLabel: {
    fontSize: 10,
    fontWeight: "bold",
    textAlign: "center",
  },
  button: {
    marginTop: 10,
  },
});

export default ThemePreview;
