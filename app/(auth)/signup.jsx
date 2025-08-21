import React, { useState } from "react";
import {
  View,
  StyleSheet,
  SafeAreaView,
  Image,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  Linking,
  TouchableOpacity,
  Alert, // ← from react-native (correct)
} from "react-native";
import {
  Text,
  TextInput,
  Button,
  Checkbox,
  HelperText,
  Divider,
} from "react-native-paper";
import { COLORS, SIZING, FONTS } from "../../theme/theme";
import { useRouter } from "expo-router";
import LogoWithName from "../../components/ui/LogoWithName";
import authService from "../../services/authService";
import Joi from "joi";
import { useSafeAreaInsets } from "react-native-safe-area-context"; // Adjusted import path
import GoogleAuthButton from "../../components/auth/GoogleAuthButton";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useTranslation } from "react-i18next";

const image = require("../../assets/images/dogs/dog-happy.jpg");

const signUpSchema = Joi.object({
  name: Joi.string().min(2).required().messages({
    "string.empty": "Name is required",
    "string.min": "Name must be at least 2 characters long",
  }),
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      "string.empty": "Email is required",
      "string.email": "Email is not valid",
    }),
  password: Joi.string()
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/)
    .required()
    .messages({
      "string.empty": "Password is required",
      "string.pattern.base":
        "Password must be at least 8 characters long, and include an uppercase letter, a lowercase letter, and a number",
    }),
});

const SignUpScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [checked, setChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [termsError, setTermsError] = useState("");

  const computeErrors = (vals) => {
    const { error } = signUpSchema.validate(vals, { abortEarly: false });
    const map = {};
    if (error) {
      for (const d of error.details) {
        const key = d.path?.[0];
        if (key && !map[key]) map[key] = d.message;
      }
    }
    return map;
  };

  const handleBlur = (field) => {
    const map = computeErrors({ name, email, password });
    setErrors((prev) => ({ ...prev, [field]: map[field] }));
  };

  const handleSignUp = async () => {
    const map = computeErrors({ name, email, password });
    setErrors(map);

    if (!checked) {
      setTermsError(t("auth.signup.error.terms_required"));
    } else {
      setTermsError("");
    }

    if (Object.keys(map).length > 0 || !checked) return;

    setLoading(true);
    try {
      await authService.createUser({ name, email, password });
      Alert.alert(t("auth.signup.title"), t("auth.signup.success"));
      router.push("/(tabs)/home");
    } catch (e) {
      console.error("Sign-up error:", e);
      Alert.alert(t("auth.signup.title"), t("auth.signup.error.general"));
    } finally {
      setLoading(false);
    }
  };

  const openURL = (url) =>
    Linking.openURL(url).catch((err) =>
      console.error("Couldn't load page", err)
    );

  return (
    <SafeAreaView style={[styles.safeArea, { paddingTop: insets.top }]}>
      <KeyboardAwareScrollView
        contentContainerStyle={{
          flexGrow: 1,
          backgroundColor: COLORS.accent,
          paddingBottom: (insets?.bottom || 16) + SIZING.padding * 2,
        }}
        enableOnAndroid={true}
        extraScrollHeight={20} // מרים טיפה מעבר למקלדת
        keyboardShouldPersistTaps="handled"
      >
        <ScrollView
          contentContainerStyle={[
            styles.container,
            {
              paddingBottom: (insets?.bottom || 16) + SIZING.padding,
            },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={true}
          bounces={true}
          alwaysBounceVertical={true}
        >
          <View style={styles.header}>
            <LogoWithName />
            <Image source={image} style={styles.image} />
          </View>

          <View style={styles.contentWrapper}>
            <View style={styles.form}>
              <GoogleAuthButton />

              <View style={styles.dividerContainer}>
                <Divider style={styles.divider} />
                <Text style={styles.dividerText}>{t("auth.login.or")}</Text>
                <Divider style={styles.divider} />
              </View>

              <Text style={styles.welcomeTitle}>{t("auth.signup.title")}</Text>
              <Text style={styles.loginText}>{t("auth.signup.subtitle")}</Text>

              <TextInput
                label={t("auth.signup.name")}
                value={name}
                onChangeText={(v) => {
                  setName(v);
                  if (errors.name) handleBlur("name");
                }}
                onBlur={() => handleBlur("name")}
                mode="outlined"
                style={styles.input}
                error={!!errors.name}
                dense
              />
              <HelperText type="error" visible={!!errors.name}>
                {errors.name}
              </HelperText>

              <TextInput
                label={t("auth.signup.email")}
                value={email}
                onChangeText={(v) => {
                  setEmail(v);
                  if (errors.email) handleBlur("email");
                }}
                onBlur={() => handleBlur("email")}
                mode="outlined"
                style={styles.input}
                keyboardType="email-address"
                autoCapitalize="none"
                error={!!errors.email}
                dense
              />
              <HelperText type="error" visible={!!errors.email}>
                {errors.email}
              </HelperText>

              <TextInput
                label={t("auth.signup.password")}
                value={password}
                onChangeText={(v) => {
                  setPassword(v);
                  if (errors.password) handleBlur("password");
                }}
                onBlur={() => handleBlur("password")}
                mode="outlined"
                style={styles.input}
                secureTextEntry
                error={!!errors.password}
                dense
              />
              <HelperText type="error" visible={!!errors.password}>
                {errors.password}
              </HelperText>

              <View style={styles.termsContainer}>
                <Checkbox
                  status={checked ? "checked" : "unchecked"}
                  onPress={() => setChecked((c) => !c)}
                  color={COLORS.primary}
                />
                <Text style={styles.termsText}>
                  {t("auth.signup.terms_agree")}{" "}
                  <Text
                    accessibilityRole="link"
                    onPress={() => openURL("https://example.com/terms.html")}
                    style={styles.link}
                  >
                    {t("auth.signup.terms_of_service")}
                  </Text>{" "}
                  {t("auth.signup.and")}{" "}
                  <Text
                    accessibilityRole="link"
                    onPress={() => openURL("https://example.com/privacy.html")}
                    style={styles.link}
                  >
                    {t("auth.signup.privacy_policy")}
                  </Text>
                </Text>
              </View>

              <HelperText
                type="error"
                visible={!!termsError}
                style={{
                  marginHorizontal: SIZING.padding,
                  marginBottom: SIZING.base / 4,
                }}
              >
                {termsError}
              </HelperText>
            </View>

            <View style={styles.footer}>
              <Button
                mode="contained"
                onPress={handleSignUp}
                style={styles.button}
                labelStyle={styles.buttonLabel}
                disabled={loading}
              >
                {loading ? t("auth.signup.loading") : t("auth.signup.button")}
              </Button>
              <Button
                mode="text"
                onPress={() => router.push("/(auth)/login")}
                style={styles.loginButton}
                labelStyle={{ color: COLORS.primary, fontWeight: "600" }}
              >
                {t("auth.signup.has_account")}
              </Button>
            </View>
          </View>
        </ScrollView>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  keyboardAvoidingView: { flex: 1 },
  container: {
    flexGrow: 1,
    backgroundColor: COLORS.accent,
  },
  header: {
    alignItems: "center",
    marginBottom: SIZING.base / 2,
    borderBottomLeftRadius: SIZING.radius_3xl,
    borderBottomRightRadius: SIZING.radius_3xl,
    overflow: "hidden",
    backgroundColor: COLORS.background,
    width: "100%",
    height: "22%",
    justifyContent: "flex-end",
  },
  image: {
    width: "90%",
    height: "90%",
    zIndex: -1,
    resizeMode: "contain",
    marginTop: SIZING.margin,
  },
  welcomeTitle: {
    ...FONTS.h1,
    textAlign: "center",
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: SIZING.base / 2,
  },
  form: {
    flex: 0,
    paddingHorizontal: SIZING.padding,
    paddingTop: SIZING.base,
    paddingBottom: SIZING.base,
  },
  footer: {
    paddingTop: SIZING.base,
    paddingBottom: SIZING.padding,
    marginTop: SIZING.base,
    minHeight: 80,
    zIndex: 20,
    backgroundColor: COLORS.accent,
    borderTopLeftRadius: SIZING.radius_lg,
    borderTopRightRadius: SIZING.radius_lg,
    elevation: 8,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  loginText: {
    ...FONTS.body,
    fontFamily: "Rubik",
    color: COLORS.black,
    textAlign: "center",
    marginBottom: SIZING.base,
  },
  input: {
    marginBottom: SIZING.base / 2,
    fontSize: 16,
    backgroundColor: COLORS.white,
  },
  button: {
    backgroundColor: COLORS.primary,
    padding: SIZING.base / 2,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: SIZING.radius_md,
    marginHorizontal: SIZING.margin + SIZING.base,
    marginTop: SIZING.base / 2,
    zIndex: 10,
    elevation: 5,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
  textContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  link: { color: COLORS.primary, textDecorationLine: "underline" },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: SIZING.base / 2,
    paddingHorizontal: SIZING.padding,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.gray,
  },
  dividerText: {
    marginHorizontal: SIZING.base,
    fontSize: 16,
    color: COLORS.gray,
  },
  termsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: SIZING.base / 2,
    marginBottom: SIZING.base / 4,
  },
  termsText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.black,
    marginLeft: SIZING.base,
  },
  loginButton: {
    marginTop: SIZING.base / 2,
    marginHorizontal: SIZING.margin + SIZING.base,
    paddingVertical: SIZING.base / 2,
    borderRadius: SIZING.radius_md,
    elevation: 2,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    zIndex: 10,
  },
  contentWrapper: {
    flex: 1,
    justifyContent: "space-between",
    minHeight: 280,
  },
});

export default SignUpScreen;
