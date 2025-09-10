import React, { useState, useEffect } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { Text, Button, Switch, List, Menu, Divider } from "react-native-paper";
import { COLORS, SIZING, FONTS } from "../../theme/theme";
import authService from "../../services/authService";
import { useRouter } from "expo-router";
import { setLanguage } from "../../services/i18n/index";
import { useTranslation } from "react-i18next";
import calendarService from "../../services/calendarService";

export default function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const [googleCalendarEnabled, setGoogleCalendarEnabled] = useState(false);
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [languageMenuVisible, setLanguageMenuVisible] = useState(false);

  useEffect(() => {
    checkCalendarStatus();
  }, []);

  const checkCalendarStatus = async () => {
    try {
      const response = await calendarService.checkAccess();
      setGoogleCalendarEnabled(response.success);
    } catch (error) {}
  };

  const toggleGoogleCalendar = async () => {
    if (googleCalendarEnabled) {
      // ביטול יומן גוגל
      try {
        setCalendarLoading(true);
        await calendarService.disable();
        setGoogleCalendarEnabled(false);
        Alert.alert(
          t("settings.calendar.disabled_success"),
          t("settings.calendar.disabled_success")
        );
      } catch (error) {
        Alert.alert(
          t("settings.calendar.disable_error"),
          t("settings.calendar.disable_error")
        );
      } finally {
        setCalendarLoading(false);
      }
    } else {
      // הפעלת יומן גוגל - צריך OAuth
      Alert.alert(
        t("settings.calendar.enable_title"),
        t("settings.calendar.enable_message"),
        [
          { text: t("action.cancel"), style: "cancel" },
          {
            text: t("settings.calendar.reconnect"),
            onPress: () => {
              // logout and redirect to login
              logout();
            },
          },
        ]
      );
    }
  };

  const syncReminders = async () => {
    try {
      setCalendarLoading(true);
      const response = await calendarService.syncReminders();
      Alert.alert(t("settings.calendar.sync_success"), response.message);
    } catch (error) {
      Alert.alert(
        t("settings.calendar.sync_error"),
        t("settings.calendar.sync_error")
      );
    } finally {
      setCalendarLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout?.();
    } catch (e) {}
    router.replace("/(auth)/login");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t("settings.title")}</Text>

      <List.Item
        title={t("settings.notifications.title")}
        right={() => <Switch value={true} onValueChange={() => {}} />}
      />

      <Divider style={styles.divider} />

      <Text style={styles.sectionTitle}>{t("settings.calendar.title")}</Text>

      <List.Item
        title={t("settings.calendar.sync_title")}
        description={t("settings.calendar.sync_description")}
        right={() => (
          <Switch
            value={googleCalendarEnabled}
            onValueChange={toggleGoogleCalendar}
            disabled={calendarLoading}
          />
        )}
      />

      {googleCalendarEnabled && (
        <Button
          mode="outlined"
          onPress={syncReminders}
          disabled={calendarLoading}
          style={styles.syncButton}
          loading={calendarLoading}
        >
          {t("settings.calendar.sync_existing")}
        </Button>
      )}

      <Divider style={styles.divider} />

      <List.Item
        title={t("settings.language.title")}
        description={t("settings.language.current")}
        right={() => (
          <Menu
            visible={languageMenuVisible}
            onDismiss={() => setLanguageMenuVisible(false)}
            anchor={
              <Button onPress={() => setLanguageMenuVisible(true)}>
                {t("settings.language.title")}
              </Button>
            }
          >
            <Menu.Item
              onPress={async () => {
                setLanguageMenuVisible(false);
                await setLanguage("he");
              }}
              title={t("settings.language.hebrew")}
            />
            <Menu.Item
              onPress={async () => {
                setLanguageMenuVisible(false);
                await setLanguage("en");
              }}
              title={t("settings.language.english")}
            />
          </Menu>
        )}
      />

      <Button
        mode="outlined"
        onPress={logout}
        style={{ marginTop: SIZING.margin }}
      >
        {t("action.logout")}
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SIZING.padding,
    backgroundColor: COLORS.background,
  },
  title: { ...FONTS.h2, color: COLORS.neutral, marginBottom: SIZING.margin },
  divider: {
    marginVertical: SIZING.margin,
  },
  sectionTitle: {
    ...FONTS.h3,
    color: COLORS.neutral,
    marginTop: SIZING.margin * 2,
    marginBottom: SIZING.margin,
  },
  syncButton: {
    marginTop: SIZING.margin,
  },
});
