import React, { useEffect, useState, useCallback } from "react";
import { View, Image, ScrollView, Pressable, SafeAreaView } from "react-native";
import { Text, ActivityIndicator } from "react-native-paper";
import { useLocalSearchParams } from "expo-router";
import { COLORS, SIZING, FONTS } from "../../../../theme/theme";
import ContentRenderer from "../../../../components/content/ContentRenderer";
import * as contentService from "../../../../services/contentService";
import gamificationService from "../../../../services/gamificationService";

export default function LearnArticleScreen() {
  const { slug } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [article, setArticle] = useState(null);
  const [saved, setSaved] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await contentService.getArticle(slug);
      const doc = res?.article;
      if (doc) setArticle(res.article);
      setSaved(await contentService.isArticleSaved(slug));
      try {
        // server awards once-ever per article; we also complete the daily mission
        const tr = await contentService.trackRead(slug);
        try {
          await gamificationService.sendEvent("READ_ARTICLE", String(slug));
        } catch {}
      } catch {}
    } catch (e) {
      const local = await contentService.getSavedArticle(slug);
      if (local) {
        setArticle(local);
        setSaved(true);
      }
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    load();
  }, [load]);

  const toggleSave = async () => {
    if (!article) return;
    if (saved) {
      await contentService.removeSavedArticle(slug);
      setSaved(false);
    } else {
      await contentService.saveArticle(article);
      setSaved(true);
    }
  };

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

  if (!article) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <Text>לא נמצא מאמר</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <ScrollView
        style={{ flex: 1, backgroundColor: COLORS.background }}
        contentContainerStyle={{ paddingTop: SIZING.padding }}
      >
        {article.heroImage ? (
          <Image
            source={{ uri: article.heroImage }}
            style={{ width: "100%", height: 200, backgroundColor: "#eaeaea" }}
            resizeMode="cover"
          />
        ) : null}

        <View
          style={{
            marginTop: 12,
            marginHorizontal: SIZING.padding,
            backgroundColor: COLORS.white,
            borderRadius: 16,
            padding: SIZING.padding,
            borderWidth: 1,
            borderColor: COLORS.neutral + "22",
            elevation: 2,
          }}
        >
          <Text style={{ ...FONTS.h1, color: COLORS.dark }}>
            {article.title}
          </Text>
          {article.summary ? (
            <Text style={{ color: COLORS.neutral, marginTop: 6 }}>
              {article.summary}
            </Text>
          ) : null}

          <Pressable
            onPress={toggleSave}
            style={{
              marginTop: 8,
              alignSelf: "flex-start",
              paddingVertical: 6,
              paddingHorizontal: 12,
              backgroundColor: saved ? COLORS.accent : COLORS.white,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: COLORS.neutral + "44",
            }}
          >
            <Text style={{ color: saved ? COLORS.white : COLORS.dark }}>
              {saved ? "שמור מקומית ✓" : "שמור מקומית"}
            </Text>
          </Pressable>

          <View style={{ height: 12 }} />

          <ContentRenderer blocks={article.blocks || []} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
