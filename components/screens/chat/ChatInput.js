import React from "react";
import { View } from "react-native";
import { TextInput, IconButton } from "react-native-paper";
import { COLORS, SIZING } from "../../../theme/theme";
import styles from "./styles";

const ChatInput = ({
  value,
  onChangeText,
  onSend,
  disabled = false,
}) => {
  const handleSend = () => {
    if (value.trim() && !disabled) {
      onSend();
    }
  };

  return (
    <View style={styles.inputContainer}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder="כתוב הודעה..."
        style={styles.textInput}
        multiline
        maxLength={500}
        disabled={disabled}
        onSubmitEditing={handleSend}
        right={
          <TextInput.Icon
            icon="send"
            onPress={handleSend}
            disabled={!value.trim() || disabled}
            color={value.trim() && !disabled ? COLORS.primary : COLORS.disabled}
          />
        }
      />
    </View>
  );
};

export default ChatInput;
