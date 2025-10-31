import React, { useState } from "react";
import { View, ScrollView, Linking } from "react-native";
import { Modal, Portal, Text, Button, Checkbox } from "react-native-paper";
import { useTranslation } from "react-i18next";
import { getColors } from "../../theme/theme";
import { useTheme } from "../../context/ThemeContext";

/**
 * Modal for consent update when legal documents change
 * This modal is blocking and cannot be dismissed until user accepts
 */
const ConsentUpdateModal = ({
  visible,
  onAccept,
  requiredDocuments,
  loading = false,
}) => {
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const colors = getColors(isDark);

  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);

  const handleAccept = () => {
    if (termsAccepted && privacyAccepted && onAccept) {
      onAccept({
        termsVersion: requiredDocuments?.terms?.version,
        privacyVersion: requiredDocuments?.privacy?.version,
        termsLanguage: requiredDocuments?.terms?.language,
        privacyLanguage: requiredDocuments?.privacy?.language,
      });
    }
  };

  const openDocument = async (url, title) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      }
    } catch (error) {
      console.error("Error opening document:", error);
    }
  };

  const getChangeSummary = (doc) => {
    if (!doc || !doc.changesSummary) return "";
    // Use Hebrew summary by default, fallback to English
    return doc.changesSummary.he || doc.changesSummary.en || "";
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        dismissable={false}
        contentContainerStyle={{
          backgroundColor: colors.background,
          margin: 20,
          borderRadius: 8,
          maxHeight: "90%",
        }}
      >
        <ScrollView style={{ padding: 20 }}>
          <Text
            variant="headlineMedium"
            style={{
              color: colors.primary,
              marginBottom: 16,
              textAlign: "center",
              fontWeight: "bold",
            }}
          >
            {t("consent.modal.title")}
          </Text>

          <Text
            variant="bodyLarge"
            style={{ color: colors.text, marginBottom: 20, textAlign: "center" }}
          >
            {t("consent.modal.subtitle")}
          </Text>

          {/* Changes Summary */}
          {requiredDocuments && (
            <View
              style={{
                backgroundColor: colors.card,
                padding: 16,
                borderRadius: 8,
                marginBottom: 20,
              }}
            >
              <Text
                variant="titleMedium"
                style={{
                  color: colors.text,
                  marginBottom: 12,
                  fontWeight: "600",
                }}
              >
                {t("consent.modal.changes_title")}
              </Text>

              {requiredDocuments.privacy && (
                <View style={{ marginBottom: 12 }}>
                  <Text
                    variant="titleSmall"
                    style={{ color: colors.primary, marginBottom: 4 }}
                  >
                    {t("consent.modal.privacy_changes")}
                  </Text>
                  <Text variant="bodyMedium" style={{ color: colors.textSecondary }}>
                    {getChangeSummary(requiredDocuments.privacy) ||
                      t("consent.modal.no_summary")}
                  </Text>
                </View>
              )}

              {requiredDocuments.terms && (
                <View>
                  <Text
                    variant="titleSmall"
                    style={{ color: colors.primary, marginBottom: 4 }}
                  >
                    {t("consent.modal.terms_changes")}
                  </Text>
                  <Text variant="bodyMedium" style={{ color: colors.textSecondary }}>
                    {getChangeSummary(requiredDocuments.terms) ||
                      t("consent.modal.no_summary")}
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Document Links */}
          <View style={{ marginBottom: 20 }}>
            <Button
              mode="outlined"
              onPress={() =>
                openDocument(
                  "https://hayotush.com/privacy",
                  t("consent.modal.privacy_policy")
                )
              }
              style={{ marginBottom: 8 }}
              icon="open-in-new"
            >
              {t("consent.modal.read_privacy")}
            </Button>
            <Button
              mode="outlined"
              onPress={() =>
                openDocument(
                  "https://hayotush.com/terms",
                  t("consent.modal.terms_of_service")
                )
              }
              icon="open-in-new"
            >
              {t("consent.modal.read_terms")}
            </Button>
          </View>

          {/* Checkboxes */}
          <View style={{ marginBottom: 20 }}>
            <Checkbox.Item
              label={t("consent.modal.accept_privacy")}
              status={privacyAccepted ? "checked" : "unchecked"}
              onPress={() => setPrivacyAccepted(!privacyAccepted)}
              labelStyle={{ color: colors.text }}
              color={colors.primary}
            />
            <Checkbox.Item
              label={t("consent.modal.accept_terms")}
              status={termsAccepted ? "checked" : "unchecked"}
              onPress={() => setTermsAccepted(!termsAccepted)}
              labelStyle={{ color: colors.text }}
              color={colors.primary}
            />
          </View>

          {/* Accept Button */}
          <Button
            mode="contained"
            onPress={handleAccept}
            disabled={!termsAccepted || !privacyAccepted || loading}
            loading={loading}
            buttonColor={colors.primary}
            style={{ marginBottom: 10 }}
          >
            {t("consent.modal.accept_button")}
          </Button>

          <Text
            variant="bodySmall"
            style={{
              color: colors.textSecondary,
              textAlign: "center",
              marginTop: 10,
            }}
          >
            {t("consent.modal.required_notice")}
          </Text>
        </ScrollView>
      </Modal>
    </Portal>
  );
};

export default ConsentUpdateModal;

