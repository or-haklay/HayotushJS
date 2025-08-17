import React, { useState } from "react";
import { View, TextInput, ViewStyle } from "react-native";
import { Text } from "react-native-paper";
import styles from "./styles";

const Input = ({
  label,
  error,
  helperText,
  style,
  containerStyle,
  leftIcon,
  rightIcon,
  onFocus,
  onBlur,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = (e) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const inputStyle = [
    styles.input,
    isFocused && styles.input_focused,
    error && styles.input_error,
    leftIcon && styles.input_withLeftIcon,
    rightIcon && styles.input_withRightIcon,
    style,
  ];

  const containerStyleCombined = [styles.inputContainer, containerStyle];

  return (
    <View style={containerStyleCombined}>
      {label && (
        <Text
          style={[
            styles.text,
            styles.text_font_medium,
            styles.marginBottom_small,
          ]}
        >
          {label}
        </Text>
      )}

      <View style={styles.inputWrapper}>
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}

        <TextInput
          style={inputStyle}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholderTextColor={COLORS.textSecondary}
          {...props}
        />

        {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
      </View>

      {(error || helperText) && (
        <Text
          style={[
            styles.helperText,
            error ? styles.text_error : styles.text_secondary,
            styles.marginTop_small,
          ]}
        >
          {error || helperText}
        </Text>
      )}
    </View>
  );
};

export default Input;
