import React, { useMemo } from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "react-native-paper";
import { FONTS, SIZING } from "../../theme/theme";
import { DAILY_TIPS } from "../../data/dailyTips";
import { useTranslation } from "react-i18next";

function normalizeSpeciesToCategory(species) {
  if (!species) return "general";
  const s = String(species).trim().toLowerCase();
  if (s.includes("dog") || s.includes("כלב")) return "dog";
  if (s.includes("cat") || s.includes("חתול")) return "cat";
  if (s.includes("parrot") || s.includes("bird") || s.includes("תוכ"))
    return "bird";
  return "general";
}

function getDailyIndex(seed, modulo) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  const today = new Date();
  const dateKey = `${today.getUTCFullYear()}-${
    today.getUTCMonth() + 1
  }-${today.getUTCDate()}`;
  for (let i = 0; i < dateKey.length; i++) {
    hash = (hash * 33 + dateKey.charCodeAt(i)) >>> 0;
  }
  return modulo > 0 ? hash % modulo : 0;
}

export default function DailyTipCard({ petSpecies, userId }) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language && i18n.language.startsWith("he") ? "he" : "en";

  const { tip, category } = useMemo(() => {
    const category = normalizeSpeciesToCategory(petSpecies);
    const pool = DAILY_TIPS.filter((t) => t.category === category);
    const fallbackPool = DAILY_TIPS.filter((t) => t.category === "general");
    const combined = pool.length > 0 ? pool : fallbackPool;
    const seed = `${userId || "guest"}|${category}`;
    const idx = getDailyIndex(seed, combined.length);
    const selected =
      combined[Math.min(Math.max(idx, 0), Math.max(combined.length - 1, 0))];
    return { tip: selected, category };
  }, [petSpecies, userId]);

  if (!tip) return null;

  return (
    <View style={styles.tipContainer}>
      <Text style={styles.tipTitle}>{t("daily_tip.title")}</Text>
      <Text style={styles.tipText}>{tip[lang]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tipContainer: {
    backgroundColor: "#FFF8E1",
    borderColor: "#F2A90044",
    borderWidth: 1,
    padding: 12,
    borderRadius: 12,
    marginBottom: SIZING.margin,
  },
  tipTitle: {
    ...FONTS.h3,
    color: "#8B6A00",
    marginBottom: 6,
  },
  tipText: {
    ...FONTS.body,
    color: "#6A5E00",
    lineHeight: 22,
  },
});
