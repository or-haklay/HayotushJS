import React, { useState } from "react";
import {
  View,
  StyleSheet,
  SafeAreaView,
  Alert,
} from "react-native";
import { getColors, FONTS, SIZING } from "../../theme/theme";
import { useTheme } from "../../context/ThemeContext";
import { useRouter } from "expo-router";
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
import * as passwordResetService from "../../services/passwordResetService";
import Joi from "joi";

const emailSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      "string.empty": "Email is required",
      "string.email": "Invalid email address",
    }),
});

const codeSchema = Joi.object({
  code: Joi.string()
    .length(6)
    .pattern(/^[0-9]+$/)
    .required()
    .messages({
      "string.length": "Code must be 6 digits",
      "string.pattern.base": "Code must contain only numbers",
    }),
});

const passwordSchema = Joi.object({
  password: Joi.string()
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/)
    .required()
    .messages({
      "string.pattern.base":
        "Password must be at least 8 characters and include uppercase, lowercase and a number",
    }),
});

const ForgotPasswordScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const colors = getColors(false);

  const [step, setStep] = useState(1); // 1: email, 2: code, 3: password
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const styles = createStyles(colors);

  const validate = (schema, data) => {
    const { error } = schema.validate(data, { abortEarly: false });
    const map = {};
    if (error) {
      for (const d of error.details) {
        const key = d.path?.[0];
        if (key && !map[key]) map[key] = d.message;
      }
    }
    return map;
  };

  const handleSendCode = async () => {
    const emailErrors = validate(emailSchema, { email });
    if (Object.keys(emailErrors).length > 0) {
      setErrors(emailErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const response = await passwordResetService.forgotPassword(email);
      
      if (response.success) {
        Alert.alert(
          "Success",
          "Password reset code sent to your email. Please check your inbox.",
          [{ text: "OK", onPress: () => setStep(2) }]
        );
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to send reset code";
      Alert.alert("Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    const codeErrors = validate(codeSchema, { code });
    if (Object.keys(codeErrors).length > 0) {
      setErrors(codeErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const response = await passwordResetService.verifyResetCode(email, code);
      
      if (response.success && response.verified) {
        setStep(3);
      }
    } catch (error) {
      console.error("Verify code error:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Invalid verification code";
      setErrors({ code: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    const passwordErrors = validate(passwordSchema, { password });
    if (Object.keys(passwordErrors).length > 0) {
      setErrors(passwordErrors);
      return;
    }

    if (password !== confirmPassword) {
      setErrors({ confirmPassword: "Passwords do not match" });
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const response = await passwordResetService.resetPassword(
        email,
        code,
        password
      );
      
      if (response.success) {
        Alert.alert(
          "Success",
          "Password reset successfully! You can now login with your new password.",
          [
            {
              text: "OK",
              onPress: () => router.replace("/(auth)/login"),
            },
          ]
        );
      }
    } catch (error) {
      console.error("Reset password error:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to reset password";
      Alert.alert("Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setLoading(true);
    try {
      await passwordResetService.resendResetCode(email);
      Alert.alert("Success", "Reset code sent successfully!");
    } catch (error) {
      console.error("Resend code error:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to resend code"
      );
    } finally {
      setLoading(false);
    }
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

          {step === 1 && (
            <>
              <Text variant="headlineMedium" style={styles.title}>
                {t("auth.forgotPassword.title", "Forgot Password")}
              </Text>

              <Text variant="bodyMedium" style={styles.subtitle}>
                {t(
                  "auth.forgotPassword.subtitle",
                  "Enter your email address and we'll send you a code to reset your password."
                )}
              </Text>

              <View style={styles.inputContainer}>
                <TextInput
                  label={t("auth.forgotPassword.emailLabel", "Email")}
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (errors.email) setErrors({ ...errors, email: "" });
                  }}
                  mode="outlined"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={styles.input}
                  error={!!errors.email}
                />
                {errors.email ? (
                  <HelperText type="error" visible={!!errors.email}>
                    {errors.email}
                  </HelperText>
                ) : null}
              </View>

              <Button
                mode="contained"
                onPress={handleSendCode}
                loading={loading}
                disabled={loading}
                style={styles.button}
              >
                {t("auth.forgotPassword.sendCode", "Send Code")}
              </Button>

              <Button
                mode="text"
                onPress={() => router.back()}
                style={styles.backButton}
              >
                {t("auth.forgotPassword.backButton", "Back to Login")}
              </Button>
            </>
          )}

          {step === 2 && (
            <>
              <Text variant="headlineMedium" style={styles.title}>
                {t("auth.forgotPassword.verifyCode", "Verify Code")}
              </Text>

              <Text variant="bodyMedium" style={styles.subtitle}>
                {t(
                  "auth.forgotPassword.codeSubtitle",
                  "Enter the 6-digit code sent to your email."
                )}
              </Text>

              <View style={styles.inputContainer}>
                <TextInput
                  label={t("auth.forgotPassword.codeLabel", "Verification Code")}
                  value={code}
                  onChangeText={(text) => {
                    const numericText = text.replace(/[^0-9]/g, "").slice(0, 6);
                    setCode(numericText);
                    if (errors.code) setErrors({ ...errors, code: "" });
                  }}
                  mode="outlined"
                  keyboardType="number-pad"
                  maxLength={6}
                  style={styles.input}
                  autoFocus
                  error={!!errors.code}
                />
                {errors.code ? (
                  <HelperText type="error" visible={!!errors.code}>
                    {errors.code}
                  </HelperText>
                ) : null}
              </View>

              <Button
                mode="contained"
                onPress={handleVerifyCode}
                loading={loading}
                disabled={loading || code.length !== 6}
                style={styles.button}
              >
                {t("auth.forgotPassword.verifyButton", "Verify")}
              </Button>

              <Button
                mode="text"
                onPress={handleResendCode}
                disabled={loading}
                style={styles.resendButton}
              >
                {t("auth.forgotPassword.resendCode", "Resend Code")}
              </Button>

              <Button
                mode="text"
                onPress={() => setStep(1)}
                style={styles.backButton}
              >
                {t("auth.forgotPassword.backButton", "Back")}
              </Button>
            </>
          )}

          {step === 3 && (
            <>
              <Text variant="headlineMedium" style={styles.title}>
                {t("auth.forgotPassword.newPassword", "New Password")}
              </Text>

              <Text variant="bodyMedium" style={styles.subtitle}>
                {t(
                  "auth.forgotPassword.newPasswordSubtitle",
                  "Enter your new password below."
                )}
              </Text>

              <View style={styles.inputContainer}>
                <TextInput
                  label={t("auth.forgotPassword.passwordLabel", "New Password")}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (errors.password) setErrors({ ...errors, password: "" });
                  }}
                  mode="outlined"
                  secureTextEntry
                  style={styles.input}
                  error={!!errors.password}
                />
                {errors.password ? (
                  <HelperText type="error" visible={!!errors.password}>
                    {errors.password}
                  </HelperText>
                ) : null}

                <TextInput
                  label={t("auth.forgotPassword.confirmPasswordLabel", "Confirm Password")}
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: "" });
                  }}
                  mode="outlined"
                  secureTextEntry
                  style={styles.input}
                  error={!!errors.confirmPassword}
                />
                {errors.confirmPassword ? (
                  <HelperText type="error" visible={!!errors.confirmPassword}>
                    {errors.confirmPassword}
                  </HelperText>
                ) : null}
              </View>

              <Button
                mode="contained"
                onPress={handleResetPassword}
                loading={loading}
                disabled={loading}
                style={styles.button}
              >
                {t("auth.forgotPassword.resetButton", "Reset Password")}
              </Button>

              <Button
                mode="text"
                onPress={() => setStep(2)}
                style={styles.backButton}
              >
                {t("auth.forgotPassword.backButton", "Back")}
              </Button>
            </>
          )}
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
    inputContainer: {
      marginBottom: SIZING.space * 2,
    },
    input: {
      marginBottom: SIZING.space,
    },
    button: {
      marginTop: SIZING.space,
      marginBottom: SIZING.space,
    },
    resendButton: {
      marginTop: SIZING.space,
      marginBottom: SIZING.space,
    },
    backButton: {
      marginTop: SIZING.space * 2,
    },
  });

export default ForgotPasswordScreen;








