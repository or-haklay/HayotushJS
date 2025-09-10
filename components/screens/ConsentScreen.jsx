import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
} from "react-native";
import {
  Text,
  Button,
  Checkbox,
  Card,
  ActivityIndicator,
} from "react-native-paper";
import { COLORS, SIZING, FONTS } from "../../theme/theme";
import { useTranslation } from "react-i18next";
import { getConsentStatus, updateConsent } from "../../services/userService";

const ConsentScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [consent, setConsent] = useState({
    termsAccepted: false,
    privacyAccepted: false,
    consentTimestamp: null,
    consentVersion: null,
  });

  useEffect(() => {
    loadConsentStatus();
  }, []);

  const loadConsentStatus = async () => {
    try {
      setLoading(true);
      const response = await getConsentStatus();
      setConsent(response.consent);
    } catch (error) {
      console.error("Error loading consent status:", error);
      Alert.alert(t("common.error"), t("consent.error.loading"));
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateConsent = async () => {
    try {
      setUpdating(true);
      await updateConsent(consent.termsAccepted, consent.privacyAccepted);
      Alert.alert(t("common.success"), t("consent.success.updated"), [
        { text: t("common.close"), onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error("Error updating consent:", error);
      Alert.alert(t("common.error"), t("consent.error.updating"));
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>{t("consent.loading")}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>{t("consent.title")}</Text>
        <Text style={styles.subtitle}>{t("consent.subtitle")}</Text>

        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.consentItem}>
              <Checkbox
                status={consent.termsAccepted ? "checked" : "unchecked"}
                onPress={() =>
                  setConsent((prev) => ({
                    ...prev,
                    termsAccepted: !prev.termsAccepted,
                  }))
                }
                color={COLORS.primary}
              />
              <Text style={styles.consentText}>
                {t("auth.signup.terms_agree")}{" "}
                {t("auth.signup.terms_of_service")}
              </Text>
            </View>

            <View style={styles.consentItem}>
              <Checkbox
                status={consent.privacyAccepted ? "checked" : "unchecked"}
                onPress={() =>
                  setConsent((prev) => ({
                    ...prev,
                    privacyAccepted: !prev.privacyAccepted,
                  }))
                }
                color={COLORS.primary}
              />
              <Text style={styles.consentText}>
                {t("auth.signup.privacy_agree")}{" "}
                {t("auth.signup.privacy_policy")}
              </Text>
            </View>
          </Card.Content>
        </Card>

        {consent.consentTimestamp && (
          <Card style={styles.infoCard}>
            <Card.Content>
              <Text style={styles.infoTitle}>{t("consent.info.title")}</Text>
              <Text style={styles.infoText}>
                {t("consent.info.date")}:{" "}
                {new Date(consent.consentTimestamp).toLocaleDateString()}
              </Text>
              <Text style={styles.infoText}>
                {t("consent.info.version")}: {consent.consentVersion}
              </Text>
            </Card.Content>
          </Card>
        )}

        <Button
          mode="contained"
          onPress={handleUpdateConsent}
          style={styles.updateButton}
          disabled={updating}
          loading={updating}
        >
          {t("consent.button.update")}
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContainer: {
    padding: SIZING.padding,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: SIZING.base,
    fontSize: 16,
    color: COLORS.gray,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: SIZING.base / 2,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.gray,
    marginBottom: SIZING.padding,
  },
  card: {
    marginBottom: SIZING.padding,
  },
  consentItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SIZING.base,
  },
  consentText: {
    flex: 1,
    marginLeft: SIZING.base,
    fontSize: 14,
    color: COLORS.black,
  },
  infoCard: {
    backgroundColor: COLORS.lightGray,
    marginBottom: SIZING.padding,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: SIZING.base / 2,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: SIZING.base / 4,
  },
  updateButton: {
    marginTop: SIZING.base,
    paddingVertical: SIZING.base / 2,
  },
});

export default ConsentScreen;
