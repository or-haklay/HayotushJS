import React, { useState, useEffect } from "react";
import { View, StyleSheet, Alert, Linking, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Text,
  Button,
  Switch,
  List,
  Menu,
  Divider,
  Card,
  Avatar,
  IconButton,
  Chip,
  Portal,
  Dialog,
  RadioButton,
} from "react-native-paper";
import { SIZING, FONTS, getColors } from "../../theme/theme";
import authService from "../../services/authService";
import { useRouter } from "expo-router";
import { setLanguage } from "../../services/i18n/index";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../context/ThemeContext";
import legalLinks from "../../legal-links.json";
import * as Application from "expo-application";

export default function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { theme: currentTheme, isDark, setTheme: setAppTheme } = useTheme();
  const colors = getColors(isDark);
  const styles = createStyles(colors);
  const [languageMenuVisible, setLanguageMenuVisible] = useState(false);
  const [user, setUser] = useState(null);

  // Notification settings
  const [pushNotifications, setPushNotifications] = useState(true);
  const [reminderNotifications, setReminderNotifications] = useState(true);
  const [medicalNotifications, setMedicalNotifications] = useState(true);
  const [activityNotifications, setActivityNotifications] = useState(false);
  const [quietHours, setQuietHours] = useState(false);
  const [notificationSound, setNotificationSound] = useState(true);
  const [vibration, setVibration] = useState(true);

  // Display settings
  const [theme, setTheme] = useState(currentTheme);
  const [textSize, setTextSize] = useState("medium");
  const [animations, setAnimations] = useState(true);

  // Language settings
  const [dateFormat, setDateFormat] = useState("dd/mm/yyyy");
  const [timeFormat, setTimeFormat] = useState("24h");
  const [measurementUnits, setMeasurementUnits] = useState("metric");

  // Privacy settings
  const [analytics, setAnalytics] = useState(true);

  // Dialogs
  const [themeDialogVisible, setThemeDialogVisible] = useState(false);
  const [textSizeDialogVisible, setTextSizeDialogVisible] = useState(false);
  const [deleteAccountDialogVisible, setDeleteAccountDialogVisible] =
    useState(false);
  
  // Legal consent info
  const [consentInfo, setConsentInfo] = useState(null);

  useEffect(() => {
    loadUser();
    loadConsentInfo();
  }, []);

  const loadConsentInfo = async () => {
    try {
      const userData = await authService.getUser();
      if (userData) {
        setConsentInfo({
          termsVersion: userData.consentVersion?.terms || "1.0",
          privacyVersion: userData.consentVersion?.privacy || "1.0",
          timestamp: userData.consentTimestamp,
        });
      }
    } catch (error) {
      console.error("Error loading consent info:", error);
    }
  };

  const loadUser = async () => {
    try {
      const userData = await authService.getUser();
      setUser(userData);
    } catch (error) {
      console.error("Error loading user:", error);
    }
  };

  const logout = async () => {
    try {
      await authService.logout?.();
    } catch (e) {}
    router.replace("/(auth)/login");
  };

  const handleDeleteAccount = async () => {
    Alert.alert(
      t("settings.privacy.delete_account"),
      t("settings.privacy.delete_account_warning"),
      [
        { text: t("action.cancel"), style: "cancel" },
        {
          text: t("settings.privacy.delete_account"),
          style: "destructive",
          onPress: async () => {
            try {
              await authService.deleteAccount();
              Alert.alert(
                t("common.success"),
                t("settings.privacy.account_deleted"),
                [
                  {
                    text: t("action.ok"),
                    onPress: () => {
                      router.replace("/(auth)/login");
                    },
                  },
                ]
              );
            } catch (error) {
              console.error("Error deleting account:", error);
              const errorMessage =
                error?.response?.data?.message ||
                error?.message ||
                t("settings.privacy.delete_error");
              Alert.alert(t("common.error"), errorMessage);
            }
          },
        },
      ]
    );
  };

  const handleExportData = () => {
    Alert.alert(
      t("settings.privacy.export_data"),
      "This feature will be available soon",
      [{ text: t("action.ok") }]
    );
  };

  const handleContactSupport = () => {
    Alert.alert(
      t("settings.help.contact"),
      "Email: support@hayotush.com\nPhone: +972-XX-XXXXXXX",
      [{ text: t("action.ok") }]
    );
  };

  const handleReportBug = () => {
    Alert.alert(
      t("settings.help.report_bug"),
      "Please email us at bugs@hayotush.com with details about the issue",
      [{ text: t("action.ok") }]
    );
  };

  const handleRateApp = () => {
    Alert.alert(t("settings.help.rate_app"), "Thank you for your feedback!", [
      { text: t("action.ok") },
    ]);
  };

  const handleShareApp = () => {
    Alert.alert(
      t("settings.help.share_app"),
      "Share Hayotush with your friends!",
      [{ text: t("action.ok") }]
    );
  };

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    setAppTheme(newTheme);
  };

  const openLegalDocument = async (url, title) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert(
          t("settings.legal.open_error"),
          t("settings.legal.open_error_message")
        );
      }
    } catch (error) {
      console.error("Error opening legal document:", error);
      Alert.alert(
        t("settings.legal.open_error"),
        t("settings.legal.open_error_message")
      );
    }
  };

  const dynamicStyles = {
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    title: {
      ...FONTS.h2,
      color: colors.text,
      margin: SIZING.padding,
      textAlign: "center",
    },
    sectionCard: {
      margin: SIZING.padding,
      marginBottom: SIZING.padding / 2,
      elevation: 2,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      backgroundColor: colors.card,
    },
    profileSection: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: SIZING.padding / 2,
    },
    avatar: {
      backgroundColor: colors.primary,
    },
    profileInfo: {
      flex: 1,
      marginLeft: SIZING.padding,
    },
    profileName: {
      ...FONTS.h3,
      color: colors.text,
    },
    profileEmail: {
      ...FONTS.caption,
      color: colors.textSecondary,
      marginTop: 4,
    },
    editButton: {
      margin: 0,
    },
    sectionTitle: {
      ...FONTS.h3,
      color: colors.text,
      marginBottom: SIZING.padding / 2,
      fontWeight: "600",
    },
    logoutButton: {
      margin: SIZING.padding,
      marginTop: SIZING.padding * 2,
      borderColor: colors.error,
    },
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView style={dynamicStyles.container}>
        <Text style={dynamicStyles.title}>{t("settings.title")}</Text>

        {/* Profile Section */}
        <Card style={dynamicStyles.sectionCard}>
          <Card.Content>
            <View style={dynamicStyles.profileSection}>
              <Avatar.Text
                size={60}
                label={user?.name?.charAt(0) || "U"}
                style={dynamicStyles.avatar}
              />
              <View style={dynamicStyles.profileInfo}>
                <Text style={dynamicStyles.profileName}>
                  {user?.name || "User"}
                </Text>
                <Text style={dynamicStyles.profileEmail}>
                  {user?.email || "user@example.com"}
                </Text>
              </View>
              <IconButton
                icon="pencil"
                onPress={() => router.push("/profile")}
                style={dynamicStyles.editButton}
              />
            </View>
          </Card.Content>
        </Card>

        {/* Notifications Section */}
        <Card style={dynamicStyles.sectionCard}>
          <Card.Content>
            <Text style={dynamicStyles.sectionTitle}>
              {t("settings.notifications.title")}
            </Text>

            <List.Item
              title={t("settings.notifications.push_notifications")}
              left={(props) => <List.Icon {...props} icon="bell" />}
              right={() => (
                <Switch
                  value={pushNotifications}
                  onValueChange={setPushNotifications}
                  color={colors.primary}
                />
              )}
            />

            <List.Item
              title={t("settings.notifications.reminder_notifications")}
              left={(props) => <List.Icon {...props} icon="alarm" />}
              right={() => (
                <Switch
                  value={reminderNotifications}
                  onValueChange={setReminderNotifications}
                  color={colors.primary}
                  disabled={!pushNotifications}
                />
              )}
            />

            <List.Item
              title={t("settings.notifications.medical_notifications")}
              left={(props) => <List.Icon {...props} icon="medical-bag" />}
              right={() => (
                <Switch
                  value={medicalNotifications}
                  onValueChange={setMedicalNotifications}
                  color={colors.primary}
                  disabled={!pushNotifications}
                />
              )}
            />

            <List.Item
              title={t("settings.notifications.activity_notifications")}
              left={(props) => <List.Icon {...props} icon="run" />}
              right={() => (
                <Switch
                  value={activityNotifications}
                  onValueChange={setActivityNotifications}
                  color={colors.primary}
                  disabled={!pushNotifications}
                />
              )}
            />

            <List.Item
              title={t("settings.notifications.quiet_hours")}
              description={t("settings.notifications.quiet_hours_description")}
              left={(props) => <List.Icon {...props} icon="weather-night" />}
              right={() => (
                <Switch
                  value={quietHours}
                  onValueChange={setQuietHours}
                  color={colors.primary}
                />
              )}
            />
          </Card.Content>
        </Card>

        {/* Display Section */}
        <Card style={dynamicStyles.sectionCard}>
          <Card.Content>
            <Text style={dynamicStyles.sectionTitle}>
              {t("settings.display.title")}
            </Text>

            <List.Item
              title={t("settings.display.theme")}
              description={t(`settings.display.theme_${theme}`)}
              left={(props) => <List.Icon {...props} icon="palette" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => setThemeDialogVisible(true)}
            />

            <List.Item
              title={t("settings.display.text_size")}
              description={t(`settings.display.text_size_${textSize}`)}
              left={(props) => <List.Icon {...props} icon="format-size" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => setTextSizeDialogVisible(true)}
            />

            <List.Item
              title={t("settings.display.animations")}
              left={(props) => <List.Icon {...props} icon="animation" />}
              right={() => (
                <Switch
                  value={animations}
                  onValueChange={setAnimations}
                  color={colors.primary}
                />
              )}
            />
          </Card.Content>
        </Card>

        {/* Language & Region Section */}
        <Card style={dynamicStyles.sectionCard}>
          <Card.Content>
            <Text style={dynamicStyles.sectionTitle}>
              {t("settings.language.title")}
            </Text>

            <List.Item
              title={t("settings.language.title")}
              description={t("settings.language.current")}
              left={(props) => <List.Icon {...props} icon="translate" />}
              right={() => (
                <Menu
                  visible={languageMenuVisible}
                  onDismiss={() => setLanguageMenuVisible(false)}
                  anchor={
                    <IconButton
                      icon="chevron-down"
                      onPress={() => setLanguageMenuVisible(true)}
                    />
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
          </Card.Content>
        </Card>

        {/* Privacy Section */}
        <Card style={dynamicStyles.sectionCard}>
          <Card.Content>
            <Text style={dynamicStyles.sectionTitle}>
              {t("settings.privacy.title")}
            </Text>

            <List.Item
              title={t("settings.privacy.data_management")}
              left={(props) => <List.Icon {...props} icon="database" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={handleExportData}
            />

            <List.Item
              title={t("settings.privacy.export_data")}
              left={(props) => <List.Icon {...props} icon="download" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={handleExportData}
            />

            <List.Item
              title={t("settings.privacy.analytics")}
              left={(props) => <List.Icon {...props} icon="chart-line" />}
              right={() => (
                <Switch
                  value={analytics}
                  onValueChange={setAnalytics}
                  color={colors.primary}
                />
              )}
            />

            <List.Item
              title={t("settings.privacy.delete_account")}
              titleStyle={{ color: colors.error }}
              left={(props) => (
                <List.Icon {...props} icon="delete" color={colors.error} />
              )}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={handleDeleteAccount}
            />
          </Card.Content>
        </Card>

        {/* Legal & Compliance Section */}
        <Card style={dynamicStyles.sectionCard}>
          <Card.Content>
            <Text style={dynamicStyles.sectionTitle}>
              {t("settings.legal.title")}
            </Text>

            <List.Item
              title={t("settings.legal.privacy_policy")}
              description={consentInfo ? `${t("settings.legal.version")} ${consentInfo.privacyVersion}` : ""}
              left={(props) => <List.Icon {...props} icon="shield-account" />}
              right={(props) => <List.Icon {...props} icon="open-in-new" />}
              onPress={() =>
                openLegalDocument(
                  "https://hayotush.com/privacy",
                  t("settings.legal.privacy_policy")
                )
              }
            />

            <List.Item
              title={t("settings.legal.terms_of_service")}
              description={consentInfo ? `${t("settings.legal.version")} ${consentInfo.termsVersion}` : ""}
              left={(props) => <List.Icon {...props} icon="file-document" />}
              right={(props) => <List.Icon {...props} icon="open-in-new" />}
              onPress={() =>
                openLegalDocument(
                  "https://hayotush.com/terms",
                  t("settings.legal.terms_of_service")
                )
              }
            />

            {consentInfo?.timestamp && (
              <List.Item
                title={t("settings.legal.last_accepted")}
                description={new Date(consentInfo.timestamp).toLocaleDateString()}
                left={(props) => <List.Icon {...props} icon="calendar-check" />}
              />
            )}
          </Card.Content>
        </Card>

        {/* Help & Support Section */}
        <Card style={dynamicStyles.sectionCard}>
          <Card.Content>
            <Text style={dynamicStyles.sectionTitle}>
              {t("settings.help.title")}
            </Text>

            <List.Item
              title={t("settings.help.guides")}
              left={(props) => <List.Icon {...props} icon="book-open" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => Alert.alert("Guides", "Coming soon!")}
            />

            <List.Item
              title={t("settings.help.faq")}
              left={(props) => <List.Icon {...props} icon="help-circle" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => Alert.alert("FAQ", "Coming soon!")}
            />

            <List.Item
              title={t("settings.help.contact")}
              left={(props) => <List.Icon {...props} icon="email" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={handleContactSupport}
            />

            <List.Item
              title={t("settings.help.report_bug")}
              left={(props) => <List.Icon {...props} icon="bug" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={handleReportBug}
            />

            <List.Item
              title={t("settings.help.rate_app")}
              left={(props) => <List.Icon {...props} icon="star" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={handleRateApp}
            />

            <List.Item
              title={t("settings.help.share_app")}
              left={(props) => <List.Icon {...props} icon="share" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={handleShareApp}
            />
          </Card.Content>
        </Card>

        {/* About Section */}
        <Card style={dynamicStyles.sectionCard}>
          <Card.Content>
            <Text style={dynamicStyles.sectionTitle}>
              {t("settings.about.title")}
            </Text>

            <List.Item
              title={t("settings.about.version")}
              description={Application.nativeApplicationVersion || "1.0.0"}
              left={(props) => <List.Icon {...props} icon="information" />}
            />

            <List.Item
              title={t("settings.about.terms_of_service")}
              left={(props) => <List.Icon {...props} icon="file-document" />}
              right={(props) => <List.Icon {...props} icon="open-in-new" />}
              onPress={() =>
                openLegalDocument(
                  legalLinks.termsOfService,
                  t("settings.about.terms_of_service")
                )
              }
            />

            <List.Item
              title={t("settings.about.privacy_policy")}
              left={(props) => <List.Icon {...props} icon="shield-account" />}
              right={(props) => <List.Icon {...props} icon="open-in-new" />}
              onPress={() =>
                openLegalDocument(
                  legalLinks.privacyPolicy,
                  t("settings.about.privacy_policy")
                )
              }
            />
          </Card.Content>
        </Card>

        {/* Logout Button */}
        <Button
          mode="outlined"
          onPress={logout}
          style={dynamicStyles.logoutButton}
          textColor={colors.error}
          buttonColor={colors.errorLight}
        >
          {t("action.logout")}
        </Button>

        {/* Theme Selection Dialog */}
        <Portal>
          <Dialog
            visible={themeDialogVisible}
            onDismiss={() => setThemeDialogVisible(false)}
          >
            <Dialog.Title>{t("settings.display.theme")}</Dialog.Title>
            <Dialog.Content>
              <RadioButton.Group
                onValueChange={handleThemeChange}
                value={theme}
              >
                <RadioButton.Item
                  label={t("settings.display.theme_light")}
                  value="light"
                />
                <RadioButton.Item
                  label={t("settings.display.theme_dark")}
                  value="dark"
                />
                <RadioButton.Item
                  label={t("settings.display.theme_auto")}
                  value="auto"
                />
              </RadioButton.Group>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setThemeDialogVisible(false)}>
                {t("action.ok")}
              </Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>

        {/* Text Size Selection Dialog */}
        <Portal>
          <Dialog
            visible={textSizeDialogVisible}
            onDismiss={() => setTextSizeDialogVisible(false)}
          >
            <Dialog.Title>{t("settings.display.text_size")}</Dialog.Title>
            <Dialog.Content>
              <RadioButton.Group onValueChange={setTextSize} value={textSize}>
                <RadioButton.Item
                  label={t("settings.display.text_size_small")}
                  value="small"
                />
                <RadioButton.Item
                  label={t("settings.display.text_size_medium")}
                  value="medium"
                />
                <RadioButton.Item
                  label={t("settings.display.text_size_large")}
                  value="large"
                />
              </RadioButton.Group>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setTextSizeDialogVisible(false)}>
                {t("action.ok")}
              </Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    // סגנונות ברירת מחדל - לא בשימוש יותר, נשמרים לגיבוי
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    title: {
      ...FONTS.h2,
      color: colors.text,
      margin: SIZING.padding,
      textAlign: "center",
    },
    sectionCard: {
      margin: SIZING.padding,
      marginBottom: SIZING.padding / 2,
      elevation: 2,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    profileSection: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: SIZING.padding / 2,
    },
    avatar: {
      backgroundColor: colors.primary,
    },
    profileInfo: {
      flex: 1,
      marginLeft: SIZING.padding,
    },
    profileName: {
      ...FONTS.h3,
      color: colors.text,
    },
    profileEmail: {
      ...FONTS.caption,
      color: colors.textSecondary,
      marginTop: 4,
    },
    editButton: {
      margin: 0,
    },
    sectionTitle: {
      ...FONTS.h3,
      color: colors.text,
      marginBottom: SIZING.padding / 2,
      fontWeight: "600",
    },
    logoutButton: {
      margin: SIZING.padding,
      marginTop: SIZING.padding * 2,
      borderColor: colors.error,
    },
  });
