import React, { useState } from "react";
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
  Linking,
} from "react-native";
import { COLORS, FONTS, SIZING } from "../../theme/theme";
import authService from "../../services/authService";
import Joi from "joi";
import { useRouter } from "expo-router";
import {
  Text,
  TextInput,
  Button,
  HelperText,
  Divider,
} from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import LogoWithName from "../../components/ui/LogoWithName";
import GoogleAuthButton from "../../components/auth/GoogleAuthButton";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useTranslation } from "react-i18next";

const image = require("../../assets/images/dog-strach.jpg");

// Joi validation schema (EN messages)
const loginSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      "string.empty": "Email is required",
      "string.email": "Invalid email address",
    }),
  password: Joi.string().min(1).required().messages({
    "string.empty": "Password is required",
  }),
});

const LoginScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const openURL = (url) =>
    Linking.openURL(url).catch((err) =>
      console.error("An error occurred", err)
    );

  const computeErrors = (vals) => {
    const { error } = loginSchema.validate(vals, { abortEarly: false });
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
    const map = computeErrors({ email, password });
    setErrors((prev) => ({ ...prev, [field]: map[field] }));
  };

  const handleLogin = async () => {
    const map = computeErrors({ email, password });
    setErrors(map);
    if (Object.keys(map).length > 0) return;

    setLoading(true);
    try {
      console.log("====================================");
      console.log("Attempting to login with:", { email, password });
      console.log("====================================");
      await authService.login(email, password); // if your service expects {email, password}, change accordingly
      router.replace("/home"); // keep as your routing setup
    } catch (err) {
      const errorMessage =
        err?.response?.data?.message || t("auth.login.error.incorrect_credentials");
      console.error("Login error:", err);
      Alert.alert(t("auth.login.title"), errorMessage);
    } finally {
      setLoading(false);
    }
  };

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

            <Text style={styles.welcomeTitle}>{t("auth.login.title")}</Text>
            <Text style={styles.loginText}>{t("auth.login.subtitle")}</Text>

            <TextInput
              label={t("auth.login.email")}
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
              label={t("auth.login.password")}
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
          </View>

          <View style={styles.footer}>
            <Button
              mode="contained"
              onPress={handleLogin}
              style={styles.button}
              labelStyle={styles.buttonLabel}
              disabled={loading}
            >
              {loading ? t("auth.login.loading") : t("auth.login.button")}
            </Button>

            <Button
              mode="text"
              onPress={() => router.push("/(auth)/signup")}
              style={styles.registerButton}
              labelStyle={{ color: COLORS.primary, fontWeight: "600" }}
            >
              {t("auth.login.no_account")}
            </Button>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  keyboardAvoidingView: { flex: 1 },

  header: {
    alignItems: "center",
    marginBottom: SIZING.base,
    borderBottomLeftRadius: SIZING.radius_3xl,
    borderBottomRightRadius: SIZING.radius_3xl,
    overflow: "hidden",
    backgroundColor: COLORS.background,
    width: "100%",
    height: "30%",
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
    fontSize: 36,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: SIZING.base,
  },
  form: {
    flex: 1,
    paddingHorizontal: SIZING.padding,
    paddingTop: SIZING.padding,
    paddingBottom: SIZING.padding,
  },
  footer: {
    paddingTop: SIZING.base,
    paddingBottom: SIZING.padding * 2,
    minHeight: 100,

    zIndex: 20,
  },
  loginText: {
    ...FONTS.body,
    fontFamily: "Rubik",
    color: COLORS.black,
    textAlign: "center",
    marginBottom: SIZING.padding,
  },
  input: {
    marginBottom: SIZING.base,
    fontSize: 16,
    backgroundColor: COLORS.white,
  },
  button: {
    backgroundColor: COLORS.primary,
    padding: SIZING.base,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: SIZING.radius_md,
    marginHorizontal: SIZING.margin + SIZING.base,
    zIndex: 10,
    elevation: 5,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
  registerButton: {
    ...FONTS.body,
    marginTop: SIZING.base,
    marginHorizontal: SIZING.margin + SIZING.base,
    paddingVertical: SIZING.base / 2,
    zIndex: 10,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: SIZING.base,
    marginHorizontal: SIZING.margin,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.gray,
  },
  dividerText: {
    marginHorizontal: SIZING.base,
    color: COLORS.gray,
    fontSize: 16,
  },
  contentWrapper: {
    flex: 1,
  },
});

export default LoginScreen;
