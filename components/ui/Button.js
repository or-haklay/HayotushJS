import React from "react";
import {
  TouchableOpacity,
  ViewStyle,
} from "react-native";
import { Text } from "react-native-paper";
import styles from "./styles";

const Button = ({
  title,
  variant = "primary",
  size = "medium",
  style,
  textStyle,
  disabled = false,
  loading = false,
  ...props
}) => {
  const buttonStyle = [
    styles.button,
    styles[`button_${variant}`],
    styles[`button_${size}`],
    disabled && styles.button_disabled,
    style,
  ];

  const textStyleCombined = [
    styles.text,
    variant === "outlined" && styles.text_primary,
    variant === "text" && styles.text_primary,
    disabled && styles.text_disabled,
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={buttonStyle}
      disabled={disabled || loading}
      activeOpacity={0.7}
      {...props}
    >
      <Text style={textStyleCombined}>{loading ? "טוען..." : title}</Text>
    </TouchableOpacity>
  );
};

export default Button;
