import React from "react";
import { View, StyleSheet } from "react-native";
import {
  Text,
  Button,
  Switch,
  List,
  Menu,
  languageMenuVisible,
} from "react-native-paper";
import { COLORS, SIZING, FONTS } from "../../theme/theme";
import authService from "../../services/authService";
import { useRouter } from "expo-router";
import { setLanguage } from "../../services/i18n/index";
import { useTranslation } from "react-i18next";

export default function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();

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
});
