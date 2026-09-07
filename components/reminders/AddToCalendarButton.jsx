import React, { useState } from "react";
import { Alert } from "react-native";
import { Button } from "react-native-paper";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { useTranslation } from "react-i18next";

import { requestReminderInvite } from "../../services/remindersService";
import { useToast } from "../../context/ToastContext";

export default function AddToCalendarButton({
  reminderId,
  language,
  style,
}) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  let showSuccess = () => {};
  let showError = () => {};

  try {
    const toast = useToast();
    showSuccess = toast.showSuccess;
    showError = toast.showError;
  } catch (_error) {
    // Toast context not available, fallback to no-op
  }

  const handlePress = async () => {
    if (!reminderId || loading) {
      return;
    }

    setLoading(true);

    try {
      const response = await requestReminderInvite(reminderId, {
        language,
      });

      if (!response?.content) {
        throw new Error(t("reminders.calendar_invite_error"));
      }

      const fileName =
        response.fileName || `hayotush-reminder-${Date.now()}.ics`;
      const filePath = `${FileSystem.cacheDirectory}${fileName}`;

      await FileSystem.writeAsStringAsync(filePath, response.content, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const canShare = await Sharing.isAvailableAsync();
      if (!canShare) {
        Alert.alert(
          t("reminders.calendar_share_unavailable_title"),
          t("reminders.calendar_share_unavailable_message")
        );
        return;
      }

      await Sharing.shareAsync(filePath, {
        mimeType: response.mimeType || "text/calendar",
        dialogTitle: t("reminders.add_to_calendar"),
      });

      showSuccess(t("reminders.calendar_invite_ready"));
    } catch (error) {
      console.error("AddToCalendarButton error:", error);
      const fallbackMessage =
        error?.response?.data?.message ||
        error?.message ||
        t("reminders.calendar_invite_error");
      showError(fallbackMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      mode="outlined"
      icon="calendar"
      onPress={handlePress}
      loading={loading}
      disabled={!reminderId || loading}
      style={style}
    >
      {t("reminders.add_to_calendar")}
    </Button>
  );
}




