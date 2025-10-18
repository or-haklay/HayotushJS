import React, { useState } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { Button, Card, Text, ActivityIndicator } from "react-native-paper";
import { COLORS, SIZING } from "../../theme/theme";
import { useIncrementalAuth } from "../../hooks/useIncrementalAuth";
import { useTranslation } from "react-i18next";

export default function CalendarPermissionRequest({ onSuccess, onCancel }) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const { requestCalendarAccess } = useIncrementalAuth();

  const handleRequestCalendarAccess = async () => {
    try {
      setLoading(true);
      const result = await requestCalendarAccess();

      if (result.success) {
        if (result.alreadyGranted) {
          Alert.alert(
            t("permissions.calendar.already_granted_title"),
            t("permissions.calendar.already_granted_message")
          );
        } else {
          Alert.alert(
            t("permissions.calendar.granted_title"),
            t("permissions.calendar.granted_message")
          );
        }
        onSuccess && onSuccess();
      } else {
        Alert.alert(
          t("permissions.calendar.error_title"),
          t("permissions.calendar.error_message")
        );
      }
    } catch (error) {
      console.error("Calendar permission error:", error);
      Alert.alert(
        t("permissions.calendar.error_title"),
        t("permissions.calendar.error_message")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card style={styles.card}>
      <Card.Content>
        <Text style={styles.title}>{t("permissions.calendar.title")}</Text>
        <Text style={styles.description}>
          {t("permissions.calendar.description")}
        </Text>

        <View style={styles.buttonContainer}>
          <Button
            mode="outlined"
            onPress={onCancel}
            disabled={loading}
            style={[styles.button, styles.cancelButton]}
            labelStyle={styles.cancelButtonLabel}
          >
            {t("common.cancel")}
          </Button>

          <Button
            mode="contained"
            onPress={handleRequestCalendarAccess}
            disabled={loading}
            style={[styles.button, styles.grantButton]}
            labelStyle={styles.grantButtonLabel}
            icon={
              loading
                ? () => <ActivityIndicator size="small" color={COLORS.white} />
                : "calendar"
            }
          >
            {loading
              ? t("common.loading")
              : t("permissions.calendar.grant_access")}
          </Button>
        </View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    margin: SIZING.margin,
    backgroundColor: COLORS.white,
    elevation: 3,
    borderRadius: SIZING.radius_md,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.dark,
    marginBottom: SIZING.base,
  },
  description: {
    fontSize: 14,
    color: COLORS.gray,
    lineHeight: 20,
    marginBottom: SIZING.margin,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: SIZING.base,
  },
  button: {
    flex: 1,
    borderRadius: SIZING.radius_sm,
  },
  cancelButton: {
    borderColor: COLORS.gray,
  },
  cancelButtonLabel: {
    color: COLORS.gray,
  },
  grantButton: {
    backgroundColor: COLORS.primary,
  },
  grantButtonLabel: {
    color: COLORS.white,
  },
});
