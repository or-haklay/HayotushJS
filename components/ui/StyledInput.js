import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { COLORS, FONTS, SIZING } from "../../theme/theme";

const StyledInput = ({ label, error, ...props }) => {
  const [isFocused, setIsFocused] = useState(false);

  // קביעת צבע המסגרת לפי מצב השדה (רגיל, פוקוס, שגיאה)
  const borderColor = error
    ? COLORS.error
    : isFocused
    ? COLORS.primary
    : COLORS.disabled;

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[styles.input, { borderColor }]}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholderTextColor={COLORS.disabled}
        {...props} // מעביר את כל שאר ה-props כמו value, onChangeText וכו'
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SIZING.margin,
  },
  label: {
    ...FONTS.caption,
    fontFamily: "Poppins-SemiBold",
    color: COLORS.neutral,
    marginBottom: SIZING.base,
  },
  input: {
    ...FONTS.body,
    backgroundColor: COLORS.background,
    padding: SIZING.padding,
    borderRadius: SIZING.radius_sm,
    borderWidth: 1,
  },
  errorText: {
    ...FONTS.caption,
    color: COLORS.error,
    marginTop: SIZING.base / 2,
  },
});

export default StyledInput;
