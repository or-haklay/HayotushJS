import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  FlatList,
  Pressable,
  SafeAreaView,
  ImageBackground,
} from "react-native";
import { Text, ActivityIndicator, Chip } from "react-native-paper";
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
              ...FONTS.h2,
              marginBottom: 8,
              color: COLORS.neutral,
              textAlign: "right",
              writingDirection: "rtl",
            }}
          >
            {title || "קטגוריה"}
          </Text>

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
          )}
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}
