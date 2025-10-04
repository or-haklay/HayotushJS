import React, { useRef } from "react";
import { View, StyleSheet } from "react-native";
import { Text, ProgressBar, Chip, Card } from "react-native-paper";
import { COLORS, FONTS, SIZING } from "../../theme/theme";
import { useTranslation } from "react-i18next";
import { useToast } from "../../context/ToastContext";

export default function DailyMissions({
  points,
  streak,
  missions = [],
  dateKey,
  onRefresh,
}) {
  const { t } = useTranslation();

  // Safe useToast with error handling
  let showSuccess;
  try {
    const toastContext = useToast();
    showSuccess = toastContext.showSuccess;
  } catch (error) {
    console.warn("ToastProvider not available:", error.message);
    showSuccess = () => {}; // Fallback function
  }
  const completed = missions.filter((m) => m.completed).length;
  const total = missions.length || 1;
  const progress = completed / total;
  const hasShownCompletionToast = useRef(false);

  // Show toast when all missions are completed (only once per session)
  React.useEffect(() => {
    if (completed === total && total > 0 && !hasShownCompletionToast.current) {
      hasShownCompletionToast.current = true;
      showSuccess(t("toast.success.mission_completed"));
    }

    // Reset the flag if missions are not completed (in case of refresh)
    if (completed < total) {
      hasShownCompletionToast.current = false;
    }
  }, [completed, total, showSuccess, t]);

  return (
    <Card style={styles.card}>
      <Card.Title
        title={t("gamification.daily_missions")}
        subtitle={`${t("gamification.date")}: ${dateKey}`}
        titleStyle={styles.title}
        subtitleStyle={styles.subtitle}
        right={() => (
          <View style={styles.rightBadges}>
            <Chip compact style={styles.badge}>{`${t("gamification.points")}: ${
              points ?? 0
            }`}</Chip>
            <Chip compact style={styles.badge}>{`${t("gamification.streak")}: ${
              streak ?? 0
            }`}</Chip>
          </View>
        )}
      />
      <Card.Content>
        <ProgressBar
          progress={progress}
          color={COLORS.primary}
          style={styles.progress}
        />
        {missions.map((m, idx) => (
          <View key={`${m.templateKey}-${idx}`} style={styles.row}>
            <Chip
              compact
              icon={
                m.completed ? "check-circle" : "checkbox-blank-circle-outline"
              }
              style={[
                styles.missionChip,
                m.completed ? styles.done : styles.todo,
              ]}
            >
              {`${t(`gamification.missions.${m.templateKey}`, {
                defaultValue: m.title || m.templateKey,
              })} (+${m.points || 0})`}
            </Chip>
          </View>
        ))}
        {/* {onRefresh ? (
          <Text style={styles.refresh} onPress={onRefresh}>
            {t("gamification.refresh")}
          </Text>
        ) : null} */}
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: SIZING.margin, borderRadius: 16 },
  title: { ...FONTS.h3 },
  subtitle: { ...FONTS.caption },
  rightBadges: { flexDirection: "row", gap: 6, marginRight: 8 },
  progress: { height: 8, borderRadius: 6, marginBottom: 8 },
  row: { marginBottom: 6 },
  missionChip: { backgroundColor: "#f2f5f7" },
  done: { backgroundColor: "rgba(0,200,0,0.08)" },
  todo: { backgroundColor: "rgba(0,0,0,0.04)" },
  refresh: { marginTop: 6, color: COLORS.primary, textAlign: "right" },
});
