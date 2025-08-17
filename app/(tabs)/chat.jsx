// src/screens/ChatBotScreen.js
import React, { useCallback, useRef, useState, useMemo } from "react";
import {
  View,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  I18nManager,
  Alert,
} from "react-native";
import {
  Appbar,
  TextInput,
  IconButton,
  ActivityIndicator,
  useTheme,
  Surface,
  Avatar,
  Chip,
  Divider,
  Text,
} from "react-native-paper";
import { COLORS, FONTS, SIZING } from "../../theme/theme";
import * as chatServices from "../../services/chatServices";

const HEBREW_RE = /[\u0590-\u05FF]/;

export default function ChatBotScreen() {
  const theme = useTheme();
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const listRef = useRef(null);

  const initialMessages = useMemo(
    () => [
      {
        id: "welcome-1",
        role: "assistant",
        text: "היי! איך אפשר לעזור לך היום? 🐾",
        createdAt: Date.now() - 1000 * 60,
      },
    ],
    []
  );

  const [messages, setMessages] = useState(initialMessages);

  const scrollToBottom = useCallback(() => {
    // FlatList אין לה scrollToEnd בכל הגרסאות, ננסה כמה אופציות
    requestAnimationFrame(() => {
      if (listRef.current?.scrollToEnd) {
        listRef.current.scrollToEnd({ animated: true });
      } else if (messages.length > 0 && listRef.current?.scrollToIndex) {
        listRef.current.scrollToIndex({
          index: messages.length - 1,
          animated: true,
        });
      }
    });
  }, [messages.length]);

  const addBot = useCallback(
    (text) => {
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          role: "assistant",
          text: typeof text === "string" ? text : "(תגובה ריקה)",
          createdAt: Date.now(),
        },
      ]);
      setTyping(false);
      scrollToBottom();
    },
    [scrollToBottom]
  );

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
      // פנייה לשרת שלך — חשוב: chatServices.sendMessage מחזיר מחרוזת (reply)
      const reply = await chatServices.sendMessage(trimmed);
      addBot(reply || "(תגובה ריקה)");
    } catch (e) {
      console.error("Chat send error:", e);
      addBot("הייתה שגיאה בתקשורת עם השרת.");
    }
  }, [input, addBot]);

  const onQuickReply = useCallback((txt) => {
    setInput(txt);
  }, []);

  const resetChat = useCallback(async () => {
    try {
      // אם הוספת בצד שרת נתיב reset — ננסה אותו.
      if (typeof chatServices.resetConversation === "function") {
        await chatServices.resetConversation();
      }
    } catch (e) {
      console.log("Server reset failed (clearing client only):", e?.message);
    } finally {
      setMessages(initialMessages);
      setInput("");
    }
  }, [initialMessages]);

  const renderItem = ({ item }) => (
    <MessageBubble key={item.id} text={item.text} role={item.role} />
  );

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <Appbar.Header style={{ backgroundColor: COLORS.primary }}>
        <Appbar.Content
          title="צ'אט עם הבוט"
          titleStyle={[FONTS.h2, { color: COLORS.white }]}
        />
        <Appbar.Action
          icon="delete"
          color={COLORS.white}
          onPress={() =>
            Alert.alert("ניקוי צ'אט", "למחוק את היסטוריית הצ'אט?", [
              { text: "בטל", style: "cancel" },
              { text: "מחק", style: "destructive", onPress: resetChat },
            ])
          }
        />
        <Appbar.Action icon="robot-happy" color={COLORS.white} />
      </Appbar.Header>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.select({ ios: "padding", android: undefined })}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
      >
        <View
          style={{
            flex: 1,
            paddingHorizontal: SIZING.padding,
            paddingTop: SIZING.padding,
          }}
        >
          {/* תגובות מהירות */}
          <View
            style={{
              marginBottom: SIZING.padding,
            }}
          >
            {/* כותרת לשאלות נפוצות */}
            <View
              style={{
                marginBottom: SIZING.base,
                paddingHorizontal: SIZING.base,
              }}
            >
              <Text
                style={{
                  ...FONTS.caption,
                  color: COLORS.neutral,
                  fontWeight: "600",
                }}
              >
                שאלות נפוצות
              </Text>
            </View>

            {/* Chip components in FlatList for horizontal scrolling */}
            <FlatList
              data={quickReplies}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item}
              contentContainerStyle={{
                paddingHorizontal: SIZING.base,
                gap: SIZING.base,
              }}
              renderItem={({ item: qr }) => (
                <Chip
                  icon="message-reply-text"
                  onPress={() => onQuickReply(qr)}
                  onLongPress={() => {
                    // לחיצה ארוכה — שלח מיד
                    setInput(qr);
                    setTimeout(() => {
                      // המתנה קטנה כדי שהסטייט יתעדכן לפני השליחה
                      if (qr) {
                        // simulate press send
                        setInput(qr);
                        setTimeout(sendMessage, 50);
                      }
                    }, 10);
                  }}
                  style={{
                    marginRight: SIZING.base,
                  }}
                >
                  {qr}
                </Chip>
              )}
            />
          </View>

          {/* רשימת הודעות */}
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(m) => m.id}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: SIZING.padding }}
            onContentSizeChange={scrollToBottom}
            onLayout={scrollToBottom}
          />

          {/* מקליד… */}
          {typing && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginVertical: SIZING.base,
                gap: 8,
              }}
            >
              <ActivityIndicator animating size="small" />
              <Surface
                style={{
                  paddingVertical: 6,
                  paddingHorizontal: 10,
                  borderRadius: SIZING.radius_sm,
                  backgroundColor: COLORS.white,
                }}
                elevation={1}
              >
                <Text style={{ fontSize: 12, color: COLORS.neutral }}>
                  הבוט מקליד…
                </Text>
              </Surface>
            </View>
          )}
        </View>

        <Divider />

        {/* אזור הקלט */}
        <View
          style={{
            paddingHorizontal: SIZING.padding,
            paddingVertical: SIZING.base,
            backgroundColor: COLORS.white,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <IconButton icon="microphone" size={22} onPress={() => {}} />
            <View style={{ flex: 1 }}>
              <TextInput
                mode="outlined"
                value={input}
                onChangeText={setInput}
                placeholder="כתוב הודעה…"
                right={
                  <TextInput.Icon
                    icon="close"
                    onPress={() => setInput("")}
                    forceTextInputFocus={false}
                  />
                }
                style={{
                  backgroundColor: COLORS.background,
                  direction: I18nManager.isRTL ? "rtl" : "ltr",
                }}
                contentStyle={{ ...FONTS.body, textAlign: "right" }}
                onSubmitEditing={sendMessage}
                returnKeyType="send"
              />
            </View>
            <IconButton
              icon="send"
              onPress={sendMessage}
              disabled={!input?.trim()}
              style={{ marginStart: 4 }}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

function MessageBubble({ text, role }) {
  const isUser = role === "user";
  const isRTL = HEBREW_RE.test(text);
  const containerAlign = isUser ? "flex-end" : "flex-start";
  const bubbleColor = isUser ? COLORS.primary : COLORS.white;
  const textColor = isUser ? COLORS.white : COLORS.black;

  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: containerAlign,
        marginBottom: SIZING.base,
      }}
    >
      {!isUser && (
        <Avatar.Icon
          size={28}
          icon="robot"
          style={{ marginEnd: 6, backgroundColor: COLORS.dark }}
          color={COLORS.white}
        />
      )}

      <Surface
        elevation={isUser ? 2 : 1}
        style={{
          maxWidth: "85%",
          padding: SIZING.base + 2,
          borderRadius: SIZING.radius_lg,
          backgroundColor: bubbleColor,
          borderTopLeftRadius: isUser ? SIZING.radius_lg : 4,
          borderTopRightRadius: isUser ? 4 : SIZING.radius_lg,
        }}
      >
        <Text
          selectable
          style={{
            ...FONTS.body,
            color: textColor,
            textAlign: isRTL ? "right" : "left",
            writingDirection: isRTL ? "rtl" : "ltr",
          }}
        >
          {text}
        </Text>
      </Surface>

      {isUser && (
        <Avatar.Text
          size={28}
          label="אתה"
          style={{ marginStart: 6, backgroundColor: COLORS.accent }}
          color={COLORS.black}
        />
      )}
    </View>
  );
}

const quickReplies = [
  "כמה גור כלבים אוכל ביום?",
  "כמה זמן צריך לעשות חיסון?",
  "איך להוציא קרציה לכלב? ",
];
