import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Image,
  ScrollView,
  Pressable,
  SafeAreaView,
  ImageBackground,
  Text,
} from "react-native";
import { ActivityIndicator } from "react-native-paper";
import { useLocalSearchParams } from "expo-router";
import { COLORS, SIZING, FONTS, getColors } from "../../../../theme/theme";
import { useTheme } from "../../../../context/ThemeContext";
import { useRTL } from "../../../../hooks/useRTL";
import ContentRenderer from "../../../../components/content/ContentRenderer";
import * as contentService from "../../../../services/contentService";
import gamificationService from "../../../../services/gamificationService";

export default function LearnArticleScreen() {
  const { slug } = useLocalSearchParams();
  const { isDark } = useTheme();
  const colors = getColors(isDark);
  const rtl = useRTL();
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
      <ImageBackground
        source={
          isDark
            ? require("../../../../assets/images/pet-new-background2.png")
            : require("../../../../assets/images/pet-new-background.png")
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
            style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
          >
            <ActivityIndicator />
          </View>
        </SafeAreaView>
      </ImageBackground>
    );
  }

  if (!article) {
    return (
      <ImageBackground
        source={
          isDark
            ? require("../../../../assets/images/pet-new-background2.png")
            : require("../../../../assets/images/pet-new-background.png")
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
            style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
          >
            <Text
              style={{
                textAlign: rtl.textAlign,
                writingDirection: rtl.writingDirection,
              }}
            >
              לא נמצא מאמר
            </Text>
          </View>
        </SafeAreaView>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground
      source={require("../../../../assets/images/pet-new-background.png")}
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
        <ScrollView
          style={{ flex: 1, direction: rtl.direction }}
          contentContainerStyle={{
            paddingTop: SIZING.padding,
            direction: rtl.direction,
          }}
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
              backgroundColor: colors.background,
              borderRadius: 16,
              padding: SIZING.padding,
              borderWidth: 1,
              borderColor: COLORS.neutral + "22",
              elevation: 2,
              direction: rtl.direction,
            }}
          >
            <Text
              style={{
                ...FONTS.h1,
                color: colors.text,
                textAlign: rtl.textAlign,
                writingDirection: rtl.writingDirection,
              }}
            >
              {article.title}
            </Text>
            {article.summary ? (
              <Text
                style={{
                  color: colors.textSecondary,
                  marginTop: 6,
                  textAlign: rtl.textAlign,
                  writingDirection: rtl.writingDirection,
                }}
              >
                {article.summary}
              </Text>
            ) : null}

            <Pressable
              onPress={toggleSave}
              style={{
                marginTop: 8,
                alignSelf: rtl.isRTL ? "flex-start" : "flex-end",
                paddingVertical: 6,
                paddingHorizontal: 12,
                backgroundColor: saved ? colors.accent : colors.surface,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: COLORS.neutral + "44",
              }}
            >
              <Text
                style={{
                  color: saved ? colors.onAccent : colors.text,
                  textAlign: rtl.textAlign,
                  writingDirection: rtl.writingDirection,
                }}
              >
                {saved ? "שמור מקומית ✓" : "שמור מקומית"}
              </Text>
            </Pressable>

            <View style={{ height: 12 }} />

            <ContentRenderer blocks={article.blocks || []} />
          </View>
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}
