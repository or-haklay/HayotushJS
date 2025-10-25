import React, { useEffect, useState, useCallback } from "react";
import { View, FlatList, Pressable, ImageBackground } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, ActivityIndicator, Searchbar, Chip } from "react-native-paper";
import { useRouter } from "expo-router";
import { COLORS, SIZING, FONTS, getColors } from "../../../theme/theme";
import { useTheme } from "../../../context/ThemeContext";
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

export default function LearnHome() {
  const router = useRouter();
  const { isDark } = useTheme();
  const colors = getColors(isDark);

  // פונקציה לזיהוי שפה ויישור טקסט
  const isHebrew = (text) =>
    typeof text === "string" && /[\u0590-\u05FF]/.test(text);
  const getTextDirection = (text) => {
    if (isHebrew(text)) {
      return { textAlign: "right", writingDirection: "rtl" };
    } else {
      return { textAlign: "left", writingDirection: "ltr" };
    }
  };
  const [loading, setLoading] = useState(true);
  const [cats, setCats] = useState([]);
  const [highlights, setHighlights] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [sort, setSort] = useState("recent");

  const loadCategories = useCallback(async () => {
    try {
      const res = await contentService.getCategories();
      setCats(res?.categories || []);
      try {
        const hl = await contentService.getHighlights(5);
        setHighlights(hl?.items || []);
      } catch {}
    } catch (e) {
      setCats([]);
    }
  }, []);

  const searchArticles = useCallback(async () => {
    if (!searchQuery.trim()) {
      setShowSearchResults(false);
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      const res = await contentService.getArticles({
        q: searchQuery,
        sort,
        page: 1,
        pageSize: 50,
      });
      setSearchResults(res?.items || []);
      setShowSearchResults(true);
    } catch (e) {
      setSearchResults([]);
      setShowSearchResults(true);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, sort]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await loadCategories();
      setLoading(false);
    })();
  }, [loadCategories]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchArticles();
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchArticles]);

  if (loading) {
    return (
      <ImageBackground
        source={
          isDark
            ? require("../../../assets/images/pet-new-background2.png")
            : require("../../../assets/images/pet-new-background.png")
        }
        style={{ flex: 1 }}
        resizeMode="cover"
      >
        <SafeAreaView
          style={{
            flex: 1,
            backgroundColor: isDark
              ? "rgba(14, 26, 26, 0.9)"
              : "rgba(255, 255, 255, 0.8)",
          }}
        >
          <View
            style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
          >
            <ActivityIndicator />
          </View>
        </SafeAreaView>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground
      source={require("../../../assets/images/pet-new-background.png")}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: isDark
            ? "rgba(14, 26, 26, 0.9)"
            : "rgba(255, 255, 255, 0.8)",
        }}
      >
        <View
          style={{
            flex: 1,
            paddingHorizontal: SIZING.padding,
            paddingBottom: SIZING.padding,
            paddingTop: SIZING.padding * 2,
            direction: "rtl",
          }}
        >
          <Text
            style={{
              ...FONTS.h1,
              marginBottom: SIZING.margin,
              color: COLORS.neutral,
              textAlign: "right",
              writingDirection: "rtl",
            }}
          >
            ידע
          </Text>

          <Searchbar
            placeholder="חיפוש במאמרים"
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={{
              backgroundColor: colors.background,
              marginBottom: 8,
              textAlign: "right",
              writingDirection: "rtl",
            }}
            iconColor={COLORS.primary}
          />

          {searchQuery.trim() && (
            <View
              style={{ flexDirection: "row-reverse", gap: 8, marginBottom: 8 }}
            >
              <Chip
                selected={sort === "recent"}
                onPress={() => setSort("recent")}
                style={{ textAlign: "right" }}
              >
                חדש
              </Chip>
              <Chip
                selected={sort === "title"}
                onPress={() => setSort("title")}
                style={{ textAlign: "right" }}
              >
                לפי כותרת
              </Chip>
            </View>
          )}

          {showSearchResults ? (
            <FlatList
              data={searchResults}
              keyExtractor={(i) => i.slug}
              contentContainerStyle={{ paddingBottom: 24 }}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() =>
                    router.push({
                      pathname: "/(tabs)/learn/article/[slug]",
                      params: { slug: item.slug },
                    })
                  }
                  style={{
                    backgroundColor: colors.background,
                    borderRadius: 12,
                    padding: 14,
                    marginBottom: 10,
                    borderWidth: 1,
                    borderColor: COLORS.neutral + "22",
                  }}
                >
                  <Text
                    style={{
                      ...FONTS.h3,
                      color: colors.text,
                      ...getTextDirection(item.title),
                    }}
                  >
                    {item.title}
                  </Text>
                  {item.summary ? (
                    <Text
                      style={{
                        color: colors.textSecondary,
                        marginTop: 6,
                        ...getTextDirection(item.summary),
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
                        textAlign: "right",
                        writingDirection: "rtl",
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
                      color: COLORS.neutral,
                      textAlign: "right",
                      writingDirection: "rtl",
                    }}
                  >
                    לא נמצאו מאמרים
                  </Text>
                </View>
              }
            />
          ) : (
            <>
              {highlights && highlights.length > 0 ? (
                <View style={{ marginBottom: SIZING.margin }}>
                  <Text
                    style={{
                      ...FONTS.h2,
                      color: colors.text,
                      marginBottom: 12,
                      textAlign: "right",
                      writingDirection: "rtl",
                    }}
                  >
                    מומלצים עבורך
                  </Text>
                  <FlatList
                    data={highlights}
                    keyExtractor={(item) => item.slug}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ gap: 12, paddingHorizontal: 4 }}
                    renderItem={({ item }) => (
                      <Pressable
                        onPress={() =>
                          router.push({
                            pathname: "/(tabs)/learn/article/[slug]",
                            params: { slug: item.slug },
                          })
                        }
                        style={{
                          width: 200,
                          backgroundColor: colors.background,
                          borderRadius: 12,
                          padding: 16,
                          borderWidth: 1,
                          borderColor: COLORS.neutral + "22",
                        }}
                      >
                        <Text
                          style={{
                            ...FONTS.h3,
                            color: colors.text,
                            textAlign: "right",
                            writingDirection: "rtl",
                          }}
                          numberOfLines={3}
                        >
                          {item.title}
                        </Text>
                      </Pressable>
                    )}
                  />
                </View>
              ) : null}
              <FlatList
                data={cats}
                keyExtractor={(i) => i.key}
                numColumns={2}
                columnWrapperStyle={{ gap: 12 }}
                contentContainerStyle={{ gap: 12, paddingBottom: 24 }}
                renderItem={({ item }) => (
                  <Pressable
                    onPress={() =>
                      router.push({
                        pathname: "/(tabs)/learn/[category]",
                        params: { category: item.key, title: item.title },
                      })
                    }
                    style={{
                      flex: 1,
                      backgroundColor: getCategoryColor(item.key, isDark),
                      borderRadius: 12,
                      padding: 16,
                      borderWidth: 1,
                      borderColor: COLORS.neutral + "22",
                    }}
                  >
                    <Text
                      style={{
                        ...FONTS.h3,
                        color: colors.text,
                        textAlign: "right",
                        writingDirection: "rtl",
                      }}
                    >
                      {item.title}
                    </Text>
                    {item.description ? (
                      <Text
                        style={{
                          color: colors.textSecondary,
                          marginTop: 6,
                          textAlign: "right",
                          writingDirection: "rtl",
                        }}
                      >
                        {item.description}
                      </Text>
                    ) : null}
                  </Pressable>
                )}
              />
            </>
          )}
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}
