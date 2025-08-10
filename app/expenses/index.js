import React from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "react-native-paper";
import { COLORS, SIZING, FONTS } from "../../theme/theme";

export default function ExpensesScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>הוצאות</Text>
      <Text>המסך הזה יתווסף בגרסה הבאה – לא חלק מה־MVP המינימלי.</Text>
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
});
