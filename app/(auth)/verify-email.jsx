import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { getColors, FONTS, SIZING } from "../../theme/theme";
import { useTheme } from "../../context/ThemeContext";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  Text,
  TextInput,
  Button,
  HelperText,
} from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import LogoWithName from "../../components/ui/LogoWithName";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useTranslation } from "react-i18next";
import * as verificationService from "../../services/verificationService";

const VerifyEmailScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const params = useLocalSearchParams();
  const colors = getColors(false);

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState("");
  const [timer, setTimer] = useState(60); // 60 seconds countdown
  const [canResend, setCanResend] = useState(false);
  const timerRef = useRef(null);

  const styles = createStyles(colors);

  // Countdown timer
  useEffect(() => {
    if (timer > 0 && !canResend) {
      timerRef.current = setTimeout(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [timer, canResend]);

  const handleVerify = async () => {
    if (!code || code.length !== 6) {
      setError("Please enter a 6-digit code");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await verificationService.verifyCode(code);
      
      if (response.success) {
        Alert.alert(
          "Success",
          "Email verified successfully!",
          [
            {
              text: "OK",
              onPress: () => {
                // Navigate to main app or home
                router.replace("/(tabs)");
              },
            },
          ]
        );
      }
    } catch (error) {
      console.error("Verification error:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Invalid verification code";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    setError("");

    try {
      const response = await verificationService.resendVerificationCode();
      
      if (response.success) {
        Alert.alert("Success", "Verification code sent successfully!");
        setTimer(60);
        setCanResend(false);
        setCode("");
      }
    } catch (error) {
      console.error("Resend error:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to resend verification code";
      setError(errorMessage);
      Alert.alert("Error", errorMessage);
    } finally {
      setResendLoading(false);
    }
  };

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollContent}
        enableOnAndroid={true}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          <LogoWithName style={styles.logo} />

          <Text variant="headlineMedium" style={styles.title}>
            {t("auth.verifyEmail.title", "Verify Your Email")}
          </Text>

          <Text variant="bodyMedium" style={styles.subtitle}>
            {t(
              "auth.verifyEmail.subtitle",
              "We've sent a verification code to your email. Please enter the 6-digit code below."
            )}
          </Text>

          <View style={styles.codeContainer}>
            <TextInput
              label={t("auth.verifyEmail.codeLabel", "Verification Code")}
              value={code}
              onChangeText={(text) => {
                // Only allow numbers and limit to 6 digits
                const numericText = text.replace(/[^0-9]/g, "").slice(0, 6);
                setCode(numericText);
                setError("");
              }}
              mode="outlined"
              keyboardType="number-pad"
              maxLength={6}
              style={styles.codeInput}
              autoFocus
              error={!!error}
            />
            {error ? (
              <HelperText type="error" visible={!!error}>
                {error}
              </HelperText>
            ) : null}
          </View>

          <Button
            mode="contained"
            onPress={handleVerify}
            loading={loading}
            disabled={loading || code.length !== 6}
            style={styles.verifyButton}
          >
            {t("auth.verifyEmail.verifyButton", "Verify")}
          </Button>

          <View style={styles.resendContainer}>
            {!canResend ? (
              <Text variant="bodyMedium" style={styles.timerText}>
                {t("auth.verifyEmail.resendIn", "Resend code in")} {formatTimer(timer)}
              </Text>
            ) : (
              <Button
                mode="text"
                onPress={handleResend}
                loading={resendLoading}
                disabled={resendLoading}
                style={styles.resendButton}
              >
                {t("auth.verifyEmail.resendButton", "Resend Code")}
              </Button>
            )}
          </View>

          <Button
            mode="text"
            onPress={() => router.back()}
            style={styles.backButton}
          >
            {t("auth.verifyEmail.backButton", "Back")}
          </Button>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

const createStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      flexGrow: 1,
      padding: SIZING.padding,
    },
    content: {
      flex: 1,
      justifyContent: "center",
      maxWidth: 400,
      alignSelf: "center",
      width: "100%",
    },
    logo: {
      marginBottom: SIZING.space * 3,
      alignSelf: "center",
    },
    title: {
      textAlign: "center",
      marginBottom: SIZING.space,
      color: colors.text,
      fontFamily: FONTS.bold,
    },
    subtitle: {
      textAlign: "center",
      marginBottom: SIZING.space * 3,
      color: colors.textSecondary,
    },
    codeContainer: {
      marginBottom: SIZING.space * 2,
    },
    codeInput: {
      marginBottom: SIZING.space,
    },
    verifyButton: {
      marginTop: SIZING.space,
      marginBottom: SIZING.space,
    },
    resendContainer: {
      alignItems: "center",
      marginTop: SIZING.space,
      marginBottom: SIZING.space,
    },
    timerText: {
      color: colors.textSecondary,
    },
    resendButton: {
      marginTop: SIZING.space,
    },
    backButton: {
      marginTop: SIZING.space * 2,
    },
  });

export default VerifyEmailScreen;








