import React, { useCallback, useEffect, useState } from "react";
import { View, FlatList, Pressable, SafeAreaView } from "react-native";
import { Searchbar, Text, ActivityIndicator, Chip } from "react-native-paper";
import { useLocalSearchParams, useRouter } from "expo-router";
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

export default function LearnCategoryList() {
  const { category, title } = useLocalSearchParams();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [sort, setSort] = useState("recent");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await contentService.getArticles({
        category,
        q,
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
  }, [category, q, sort]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <View
        style={{
          flex: 1,
          paddingHorizontal: SIZING.padding,
          paddingBottom: SIZING.padding,
          paddingTop: SIZING.padding * 2,
        }}
      >
        <Text style={{ ...FONTS.h2, marginBottom: 8, color: COLORS.neutral }}>
          {title || "קטגוריה"}
        </Text>

        <Searchbar
          placeholder="חיפוש במאמרים"
          value={q}
          onChangeText={setQ}
          onSubmitEditing={load}
          style={{ backgroundColor: COLORS.white, marginBottom: 8 }}
          iconColor={COLORS.primary}
        />

        <View style={{ flexDirection: "row", gap: 8, marginBottom: 8 }}>
          <Chip selected={sort === "recent"} onPress={() => setSort("recent")}>
            חדש
          </Chip>
          <Chip selected={sort === "title"} onPress={() => setSort("title")}>
            לפי כותרת
          </Chip>
        </View>

        {loading ? (
          <View
            style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
          >
            <ActivityIndicator />
          </View>
        ) : (
          <FlatList
            data={items}
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
                  backgroundColor: getCategoryColor(category),
                  borderRadius: 12,
                  padding: 14,
                  marginBottom: 10,
                  borderWidth: 1,
                  borderColor: COLORS.neutral + "22",
                }}
              >
                <Text style={{ ...FONTS.h3, color: COLORS.dark }}>
                  {item.title}
                </Text>
                {item.summary ? (
                  <Text
                    style={{ color: COLORS.neutral, marginTop: 6 }}
                    numberOfLines={2}
                  >
                    {item.summary}
                  </Text>
                ) : null}
                {item.readingTimeMin ? (
                  <Text style={{ color: COLORS.neutral, marginTop: 6 }}>
                    ~{item.readingTimeMin} דק'
                  </Text>
                ) : null}
              </Pressable>
            )}
            ListEmptyComponent={
              <View style={{ padding: 16 }}>
                <Text style={{ color: COLORS.neutral }}>לא נמצאו מאמרים</Text>
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}
