import React, { useCallback, useRef, useState } from "react";
import { View, FlatList, KeyboardAvoidingView, Platform } from "react-native";
import { Appbar, useTheme } from "react-native-paper";
import { COLORS, FONTS } from "../../../theme/theme";
import chatServices from "../../../services/chatServices";
import MessageBubble from "./MessageBubble";
import QuickReplies from "./QuickReplies";
import ChatInput from "./ChatInput";
import styles from "./styles";

export default function ChatScreen() {
  const theme = useTheme();
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const listRef = useRef(null);

  const [messages, setMessages] = useState([
    {
      id: "welcome-1",
      role: "assistant",
      text: "היי! איך אפשר לעזור לך היום?",
      createdAt: Date.now() - 1000 * 60,
    },
  ]);

  const sendMessage = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      role: "user",
      text: trimmed,
      createdAt: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setTyping(true);

    try {
      const reply = await chatServices.sendMessage(trimmed);
      addBot(reply || "(תגובה ריקה)");
    } catch (e) {
      console.error(e);
      addBot("הייתה שגיאה בתקשורת עם השרת.");
    }
  }, [input]);

  const addBot = useCallback((text) => {
    setMessages((prev) => [
      ...prev,
      {
        id: `bot-${Date.now()}`,
        role: "assistant",
        text,
        createdAt: Date.now(),
      },
    ]);
    setTyping(false);
    requestAnimationFrame(() =>
      listRef.current?.scrollToEnd({ animated: true })
    );
  }, []);

  const onQuickReply = useCallback((txt) => {
    setInput(txt);
  }, []);

  const renderItem = ({ item }) => (
    <MessageBubble key={item.id} text={item.text} role={item.role} />
  );

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.Content
          titleStyle={[FONTS.h2, { color: COLORS.white }]}
          title="צ'אט עם הבוט"
        />
        <Appbar.Action icon="robot-happy" color={COLORS.white} />
      </Appbar.Header>

      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.select({ ios: "padding", android: undefined })}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
      >
        <FlatList
          ref={listRef}
          data={messages}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
        />

        {typing && (
          <View style={styles.typingIndicator}>
            <MessageBubble text="כותב..." role="assistant" isTyping={true} />
          </View>
        )}

        <QuickReplies onQuickReply={onQuickReply} />
        <ChatInput
          value={input}
          onChangeText={setInput}
          onSend={sendMessage}
          disabled={typing}
        />
      </KeyboardAvoidingView>
    </View>
  );
}
