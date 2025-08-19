// src/screens/ChatBotScreen.js
import React, {
  useCallback,
  useRef,
  useState,
  useMemo,
  useEffect,
} from "react";
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
import petService from "../../services/petService";
import { useTranslation } from "react-i18next";

const HEBREW_RE = /[\u0590-\u05FF]/;

export default function ChatBotScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [petInfo, setPetInfo] = useState(null);
  const [loadingPetInfo, setLoadingPetInfo] = useState(true);
  const listRef = useRef(null);

  // טעינת מידע על חיית המחמד בתחילת הצ'אט
  useEffect(() => {
    loadPetInfo();
  }, [loadPetInfo]);

  const loadPetInfo = useCallback(async () => {
    try {
      setLoadingPetInfo(true);
      const pets = await petService.getMyPets();
      if (pets && pets.length > 0) {
        setPetInfo(pets[0]); // לוקח את חיית המחמד הראשונה
        console.log("Pet info loaded for chat:", pets[0]);
      }
    } catch (error) {
      console.error("Error loading pet info:", error);
    } finally {
      setLoadingPetInfo(false);
    }
  }, []);

  const initialMessages = useMemo(
    () => [
      {
        id: "welcome-1",
        role: "assistant",
        text: t("chat.welcome"),
        createdAt: Date.now() - 1000 * 60,
      },
    ],
    [t]
  );

  const [messages, setMessages] = useState(initialMessages);

  // עדכון ההודעות הראשוניות כאשר המידע על חיית המחמד נטען
  useEffect(() => {
    if (petInfo && !loadingPetInfo) {
      const speciesText =
        petInfo.species === "dog"
          ? t("species.dog")
          : petInfo.species === "cat"
          ? t("species.cat")
          : t("species.pet");

      setMessages([
        {
          id: "welcome-1",
          role: "assistant",
          text: t("chat.welcome_with_pet", {
            species: speciesText,
            name: petInfo.name,
          }),
          createdAt: Date.now() - 1000 * 60,
        },
      ]);
    }
  }, [petInfo, loadingPetInfo, t]);

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
      // שליחת ההודעה יחד עם המידע על חיית המחמד
      const reply = await chatServices.sendMessage(trimmed, petInfo);
      addBot(reply || "(תגובה ריקה)");
    } catch (e) {
      console.error("Chat send error:", e);
      addBot(t("chat.error.server"));
    }
  }, [input, addBot, petInfo, t]);

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
      // טעינה מחדש של המידע על חיית המחמד
      await loadPetInfo();
      setMessages([
        {
          id: "welcome-1",
          role: "assistant",
          text: t("chat.welcome"),
          createdAt: Date.now() - 1000 * 60,
        },
      ]);
      setInput("");
    }
  }, [loadPetInfo, t]);

  const quickReplies = useMemo(
    () => [
      petInfo
        ? t("chat.quick_replies.food_question", {
            species:
              petInfo.species === "dog"
                ? t("species.dog")
                : petInfo.species === "cat"
                ? t("species.cat")
                : t("species.pet"),
            name: petInfo.name,
          })
        : t("chat.quick_replies.dog_food"),
      t("chat.quick_replies.vaccine"),
      petInfo && petInfo.species === "dog"
        ? t("chat.quick_replies.dog_tick")
        : petInfo && petInfo.species === "cat"
        ? t("chat.quick_replies.cat_care")
        : t("chat.quick_replies.pet_care"),
    ],
    [petInfo, t]
  );

  const renderItem = ({ item }) => (
    <MessageBubble key={item.id} text={item.text} role={item.role} />
  );

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <Appbar.Header style={{ backgroundColor: COLORS.primary }}>
        <Appbar.Content
          title={t("chat.title")}
          titleStyle={[FONTS.h2, { color: COLORS.white }]}
        />
        <Appbar.Action
          icon="delete"
          color={COLORS.white}
          onPress={() =>
            Alert.alert(t("chat.reset.title"), t("chat.reset.message"), [
              { text: t("chat.reset.cancel"), style: "cancel" },
              {
                text: t("chat.reset.delete"),
                style: "destructive",
                onPress: resetChat,
              },
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
          {/* אינדיקטור טעינת מידע על חיית המחמד */}
          {loadingPetInfo && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: SIZING.padding,
                padding: SIZING.base,
                backgroundColor: COLORS.white,
                borderRadius: SIZING.radius_sm,
                elevation: 1,
              }}
            >
              <ActivityIndicator
                animating
                size="small"
                color={COLORS.primary}
              />
              <Text
                style={{
                  ...FONTS.body,
                  color: COLORS.neutral,
                  marginLeft: SIZING.base,
                }}
              >
                {t("chat.loading_pet")}
              </Text>
            </View>
          )}

          {/* מידע על חיית המחמד */}
          {petInfo && !loadingPetInfo && (
            <View
              style={{
                marginBottom: SIZING.padding,
                padding: SIZING.base,
                backgroundColor: COLORS.white,
                borderRadius: SIZING.radius_sm,
                elevation: 1,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: SIZING.base,
                }}
              >
                <Avatar.Icon
                  size={32}
                  icon={
                    petInfo.species === "dog"
                      ? "dog"
                      : petInfo.species === "cat"
                      ? "cat"
                      : "paw"
                  }
                  style={{ backgroundColor: COLORS.primary }}
                  color={COLORS.white}
                />
                <View style={{ marginLeft: SIZING.base, flex: 1 }}>
                  <Text
                    style={{
                      ...FONTS.h3,
                      color: COLORS.neutral,
                      fontWeight: "600",
                    }}
                  >
                    {petInfo.name}
                  </Text>
                  <Text
                    style={{
                      ...FONTS.caption,
                      color: COLORS.neutral,
                    }}
                  >
                    {petInfo.species === "dog"
                      ? t("species.dog")
                      : petInfo.species === "cat"
                      ? t("species.cat")
                      : t("species.pet")}
                    {petInfo.breed && ` • ${petInfo.breed}`}
                    {petInfo.weightKg && ` • ${petInfo.weightKg} ק"ג`}
                  </Text>
                </View>
              </View>
              <Text
                style={{
                  ...FONTS.caption,
                  color: COLORS.neutral,
                  fontStyle: "italic",
                }}
              >
                {t("chat.pet_info_tip", { name: petInfo.name })}
              </Text>
            </View>
          )}

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
                {t("chat.quick_replies.title")}
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
                  {t("chat.typing")}
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
                placeholder={t("chat.placeholder")}
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
