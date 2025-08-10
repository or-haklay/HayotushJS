import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { COLORS, FONTS, SIZING } from "../../theme/theme"; // ודא שהנתיב לקובץ ה-theme נכון

const StyledButton = ({
  title,
  onPress,
  variant = "primary",
  disabled = false,
}) => {
  const containerStyle = [
    styles.container,
    variant === "secondary" && styles.secondaryContainer,
    disabled && styles.disabledContainer,
  ];

  const textStyle = [
    styles.text,
    variant === "secondary" && styles.secondaryText,
    disabled && styles.disabledText,
  ];

  return (
    <TouchableOpacity
      onPress={onPress}
      style={containerStyle}
      disabled={disabled}
    >
      <Text style={textStyle}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: SIZING.base * 1.5,
    paddingHorizontal: SIZING.padding,
    borderRadius: SIZING.radius_sm,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
  },
  secondaryContainer: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  disabledContainer: {
    backgroundColor: COLORS.disabled,
    borderColor: COLORS.disabled,
  },
  text: {
    ...FONTS.body,
    fontFamily: "Poppins-Bold",
    color: COLORS.white,
  },
  secondaryText: {
    color: COLORS.primary,
  },
  disabledText: {
    color: COLORS.white,
  },
});

export default StyledButton;
