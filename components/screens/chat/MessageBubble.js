import React from "react";
import { View } from "react-native";
import { Text, Avatar, Surface } from "react-native-paper";
import { COLORS, FONTS, SIZING } from "../../../theme/theme";
import styles from "./styles";

const MessageBubble = ({
  text,
  role,
  isTyping = false,
}) => {
  const isUser = role === "user";

  return (
    <View
      style={[
        styles.messageContainer,
        isUser ? styles.userMessageContainer : styles.botMessageContainer,
      ]}
    >
      {!isUser && (
        <Avatar.Icon size={32} icon="robot-happy" style={styles.botAvatar} />
      )}

      <Surface
        style={[
          styles.messageBubble,
          isUser ? styles.userBubble : styles.botBubble,
          isTyping && styles.typingBubble,
        ]}
        elevation={2}
      >
        <Text
          style={[
            styles.messageText,
            isUser ? styles.userMessageText : styles.botMessageText,
          ]}
        >
          {text}
        </Text>

        {isTyping && (
          <View style={styles.typingDots}>
            <Text style={styles.typingDot}>.</Text>
            <Text style={styles.typingDot}>.</Text>
            <Text style={styles.typingDot}>.</Text>
          </View>
        )}
      </Surface>

      {isUser && (
        <Avatar.Icon size={32} icon="account" style={styles.userAvatar} />
      )}
    </View>
  );
};

export default MessageBubble;
