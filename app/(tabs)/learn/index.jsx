import React, { useEffect, useState } from "react";
import { View, FlatList, Pressable, SafeAreaView } from "react-native";
import { Text, ActivityIndicator } from "react-native-paper";
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

  useEffect(() => {
    (async () => {
      try {
        const res = await contentService.getCategories();
        setCats(res?.categories || []);
        try {
          const hl = await contentService.getHighlights(5);
          setHighlights(hl?.items || []);
        } catch {}
      } catch (e) {
        setCats([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <ActivityIndicator />
        </View>
      </SafeAreaView>
    );
  }

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
        <Text
          style={{
            ...FONTS.h1,
            marginBottom: SIZING.margin,
            color: COLORS.neutral,
          }}
        >
          ידע
        </Text>
        {highlights && highlights.length > 0 ? (
          <View style={{ marginBottom: SIZING.margin }}>
            <Text style={{ ...FONTS.h2, color: COLORS.dark, marginBottom: 12 }}>
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
                    style={{ ...FONTS.h3, color: COLORS.dark }}
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
              <Text style={{ ...FONTS.h3, color: COLORS.dark }}>
                {item.title}
              </Text>
              {item.description ? (
                <Text style={{ color: COLORS.neutral, marginTop: 6 }}>
                  {item.description}
                </Text>
              ) : null}
            </Pressable>
          )}
        />
      </View>
    </SafeAreaView>
  );
}
