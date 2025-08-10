import React from "react";
import { View, StyleSheet } from "react-native";
import { Text, TextInput, Button } from "react-native-paper";
import { COLORS, SIZING, FONTS } from "../../theme/theme";

export default function SearchScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>חיפוש שירותים</Text>
      <TextInput label="מה תרצה לחפש?" mode="outlined" style={styles.input} />
      <Button mode="contained">חפש</Button>
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
  input: { marginBottom: SIZING.base },
});
