import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  FlatList,
  Pressable,
  SafeAreaView,
  ImageBackground,
  Text,
} from "react-native";
import { ActivityIndicator, Chip } from "react-native-paper";
import { useLocalSearchParams, useRouter } from "expo-router";
import { COLORS, SIZING, FONTS, getColors } from "../../../theme/theme";
import { useTheme } from "../../../context/ThemeContext";
import { useRTL } from "../../../hooks/useRTL";
import * as contentService from "../../../services/contentService";

const getCategoryColor = (categoryKey, isDark = false) => {
  if (isDark) {
    // צבעים כההים יותר במצב כהה
    const darkColors = {
      medical: "#1A2A1A", // ירוק כהה דהוי
      routine: "#2A1A0A", // כתום כהה דהוי
      grooming: "#2A1A2A", // סגול כהה דהוי
      training: "#1A1A2A", // כחול כהה דהוי
      snacks: "#2A2A0A", // צהוב כהה דהוי
      health: "#2A0A0A", // אדום כהה דהוי
      behavior: "#1A2A2A", // טורקיז כהה דהוי
      nutrition: "#1A2A0A", // ירוק בהיר כהה דהוי
      safety: "#2A0A1A", // ורוד כהה דהוי
      emergency: "#2A1A0A", // כתום בהיר כהה דהוי
    };
    return darkColors[categoryKey] || "#1A1A1A"; // אפור כהה דהוי כברירת מחדל
  } else {
    // צבעים בהירים דהויים במצב בהיר
    const lightColors = {
      medical: "#E8F5E8", // ירוק דהוי
      routine: "#FFF3E0", // כתום דהוי
      grooming: "#F3E5F5", // סגול דהוי
      training: "#E3F2FD", // כחול דהוי
      snacks: "#FFF8E1", // צהוב דהוי
      health: "#FFEBEE", // אדום דהוי
      behavior: "#E0F2F1", // טורקיז דהוי
      nutrition: "#F1F8E9", // ירוק בהיר דהוי
      safety: "#FCE4EC", // ורוד דהוי
      emergency: "#FFE0B2", // כתום בהיר דהוי
    };
    return lightColors[categoryKey] || "#F5F5F5"; // אפור דהוי כברירת מחדל
  }
};

export default function LearnCategoryList() {
  const { category, title } = useLocalSearchParams();
  const router = useRouter();
  const { isDark } = useTheme();
  const colors = getColors(isDark);
  const rtl = useRTL();

  // כל הטקסט משתמש בכיוון של שפת האפליקציה
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [sort, setSort] = useState("recent");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await contentService.getArticles({
        category,
        sort,
        page: 1,
        pageSize: 50,
      });
      setItems(res?.items || []);
    } catch (e) {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [category, sort]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <ImageBackground
      source={
        isDark
          ? require("../../../assets/images/pet-new-background2.png")
          : require("../../../assets/images/pet-new-background.png")
      }
      style={{ flex: 1, direction: rtl.direction }}
      resizeMode="cover"
    >
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: isDark
            ? "rgba(14, 26, 26, 0.9)"
            : "rgba(255, 255, 255, 0.8)",
          direction: rtl.direction,
        }}
      >
        <View
          style={{
            flex: 1,
            paddingHorizontal: SIZING.padding,
            paddingBottom: SIZING.padding,
            paddingTop: SIZING.padding * 2,
            direction: rtl.direction,
          }}
        >
          <Text
            style={{
              ...FONTS.h2,
              marginBottom: 8,
              color: colors.text,
              textAlign: rtl.textAlign,
              writingDirection: rtl.writingDirection,
            }}
          >
            {title || "קטגוריה"}
          </Text>

          <View
            key={`chips-${rtl.isRTL}`}
            style={{ flexDirection: rtl.flexDirection, gap: 8, marginBottom: 8 }}
          >
            <Chip
              key={`chip-recent-${rtl.isRTL}`}
              selected={sort === "recent"}
              onPress={() => setSort("recent")}
              style={{ direction: rtl.direction }}
              textStyle={{ textAlign: rtl.textAlign }}
            >
              חדש
            </Chip>
            <Chip
              key={`chip-title-${rtl.isRTL}`}
              selected={sort === "title"}
              onPress={() => setSort("title")}
              style={{ direction: rtl.direction }}
              textStyle={{ textAlign: rtl.textAlign }}
            >
              לפי כותרת
            </Chip>
          </View>

          {loading ? (
            <View
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ActivityIndicator />
            </View>
          ) : (
            <FlatList
              data={items}
              keyExtractor={(i) => i.slug}
              contentContainerStyle={{ paddingBottom: 24, direction: rtl.direction }}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() =>
                    router.push({
                      pathname: "/(tabs)/learn/article/[slug]",
                      params: { slug: item.slug },
                    })
                  }
                  style={{
                    backgroundColor: getCategoryColor(category, isDark),
                    borderRadius: 12,
                    padding: 14,
                    marginBottom: 10,
                    borderWidth: 1,
                    borderColor: COLORS.neutral + "22",
                    direction: rtl.direction,
                  }}
                >
                  <Text
                    style={{
                      ...FONTS.h3,
                      color: colors.text,
                      textAlign: rtl.textAlign,
                      writingDirection: rtl.writingDirection,
                    }}
                  >
                    {item.title}
                  </Text>
                  {item.summary ? (
                    <Text
                      style={{
                        color: colors.textSecondary,
                        marginTop: 6,
                        textAlign: rtl.textAlign,
                        writingDirection: rtl.writingDirection,
                      }}
                      numberOfLines={2}
                    >
                      {item.summary}
                    </Text>
                  ) : null}
                  {item.readingTimeMin ? (
                    <Text
                      style={{
                        color: colors.textSecondary,
                        marginTop: 6,
                        textAlign: rtl.textAlign,
                        writingDirection: rtl.writingDirection,
                      }}
                    >
                      ~{item.readingTimeMin} דק'
                    </Text>
                  ) : null}
                </Pressable>
              )}
              ListEmptyComponent={
                <View style={{ padding: 16 }}>
                  <Text
                    style={{
                      color: colors.textSecondary,
                      textAlign: rtl.textAlign,
                      writingDirection: rtl.writingDirection,
                    }}
                  >
                    לא נמצאו מאמרים
                  </Text>
                </View>
              }
            />
          )}
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}
