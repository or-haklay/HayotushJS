import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  FlatList,
  Pressable,
  SafeAreaView,
  ImageBackground,
} from "react-native";
import { Text, ActivityIndicator, Searchbar, Chip } from "react-native-paper";
import { useRouter } from "expo-router";
import { COLORS, SIZING, FONTS } from "../../../theme/theme";
import * as contentService from "../../../services/contentService";

const getCategoryColor = (categoryKey) => {
  const colors = {
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
  return colors[categoryKey] || "#F5F5F5"; // אפור דהוי כברירת מחדל
};

export default function LearnHome() {
  const router = useRouter();
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
        source={require("../../../assets/images/pet-new-background.png")}
        style={{ flex: 1 }}
        resizeMode="cover"
      >
        <SafeAreaView
          style={{ flex: 1, backgroundColor: "rgba(255, 255, 255, 0.8)" }}
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
        style={{ flex: 1, backgroundColor: "rgba(255, 255, 255, 0.8)" }}
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
              backgroundColor: COLORS.white,
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
                    backgroundColor: COLORS.white,
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
                      color: COLORS.dark,
                      textAlign: "right",
                      writingDirection: "rtl",
                    }}
                  >
                    {item.title}
                  </Text>
                  {item.summary ? (
                    <Text
                      style={{
                        color: COLORS.neutral,
                        marginTop: 6,
                        textAlign: "right",
                        writingDirection: "rtl",
                      }}
                      numberOfLines={2}
                    >
                      {item.summary}
                    </Text>
                  ) : null}
                  {item.readingTimeMin ? (
                    <Text
                      style={{
                        color: COLORS.neutral,
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
                      color: COLORS.dark,
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
                          backgroundColor: COLORS.white,
                          borderRadius: 12,
                          padding: 16,
                          borderWidth: 1,
                          borderColor: COLORS.neutral + "22",
                        }}
                      >
                        <Text
                          style={{
                            ...FONTS.h3,
                            color: COLORS.dark,
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
                      backgroundColor: getCategoryColor(item.key),
                      borderRadius: 12,
                      padding: 16,
                      borderWidth: 1,
                      borderColor: COLORS.neutral + "22",
                    }}
                  >
                    <Text
                      style={{
                        ...FONTS.h3,
                        color: COLORS.dark,
                        textAlign: "right",
                        writingDirection: "rtl",
                      }}
                    >
                      {item.title}
                    </Text>
                    {item.description ? (
                      <Text
                        style={{
                          color: COLORS.neutral,
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
