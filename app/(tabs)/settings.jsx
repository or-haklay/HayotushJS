import React, { useState, useEffect } from "react";
import { View, StyleSheet, Alert } from "react-native";
import {
  Text,
  Button,
  Switch,
  List,
  Menu,
  languageMenuVisible,
  Divider,
} from "react-native-paper";
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

  useEffect(() => {
    checkCalendarStatus();
  }, []);

  const checkCalendarStatus = async () => {
    try {
      const response = await calendarService.checkAccess();
      setGoogleCalendarEnabled(response.success);
    } catch (error) {
      console.log("Calendar status check failed:", error);
    }
  };

  const toggleGoogleCalendar = async () => {
    if (googleCalendarEnabled) {
      // ביטול יומן גוגל
      try {
        setCalendarLoading(true);
        await calendarService.disable();
        setGoogleCalendarEnabled(false);
        Alert.alert("הצלחה", "יומן גוגל בוטל בהצלחה");
      } catch (error) {
        Alert.alert("שגיאה", "שגיאה בביטול יומן גוגל");
      } finally {
        setCalendarLoading(false);
      }
    } else {
      // הפעלת יומן גוגל - צריך OAuth
      Alert.alert(
        "הפעלת יומן גוגל",
        "כדי להפעיל את יומן גוגל, עליך להתחבר מחדש עם גוגל",
        [
          { text: "ביטול", style: "cancel" },
          {
            text: "התחבר מחדש",
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
      Alert.alert("הצלחה", response.message);
    } catch (error) {
      Alert.alert("שגיאה", "שגיאה בסנכרון התזכורות");
    } finally {
      setCalendarLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout?.();
    } catch (e) {
      console.log(e);
    }
    router.replace("/(auth)/login");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>הגדרות</Text>

      <List.Item
        title="התראות Push"
        right={() => <Switch value={true} onValueChange={() => {}} />}
      />

      <Divider style={styles.divider} />

      <Text style={styles.sectionTitle}>יומן גוגל</Text>

      <List.Item
        title="סנכרון עם יומן גוגל"
        description="תזכורות ייכנסו אוטומטית ליומן שלך"
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
          סנכרן תזכורות קיימות
        </Button>
      )}

      <Divider style={styles.divider} />

      <List.Item
        title="שפה"
        description="עברית"
        right={() => (
          <Menu
            visible={languageMenuVisible}
            onDismiss={() => setLanguageMenuVisible(false)}
            anchor={
              <Button onPress={() => setLanguageMenuVisible(true)}>שפה</Button>
            }
          >
            <Menu.Item onPress={() => setLanguage("he")} title="עברית" />
            <Menu.Item onPress={() => setLanguage("en")} title="English" />
          </Menu>
        )}
      />

      <Button onPress={() => setLanguage("he")}>עברית</Button>
      <Button onPress={() => setLanguage("en")}>English</Button>

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
