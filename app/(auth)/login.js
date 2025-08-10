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
} from "react-native";
import { COLORS, FONTS, SIZING } from "../../theme/theme";
import authService from "../../services/authService";
import Joi from "joi";
import { useRouter } from "expo-router";
import { Text, TextInput, Button, HelperText } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import LogoWithName from "../../components/ui/LogoWithName";

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

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

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
        err?.response?.data?.message || "Incorrect email or password.";
      console.error("Login error:", err);
      Alert.alert("Login failed", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { paddingTop: insets.top }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          contentContainerStyle={[
            styles.container,
            {
              // ensures footer buttons are fully visible on all devices
              paddingBottom: (insets?.bottom || 16) + SIZING.padding * 2,
              minHeight: "100%",
            },
          ]}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <LogoWithName />
            <Image source={image} style={styles.image} />
          </View>

          <View style={styles.form}>
            <Text style={styles.welcomeTitle}>Login</Text>
            <Text style={styles.loginText}>Login to continue</Text>

            <TextInput
              label="Email"
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
            />
            <HelperText type="error" visible={!!errors.email}>
              {errors.email}
            </HelperText>

            <TextInput
              label="Password"
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
              {loading ? "Logging in..." : "Login"}
            </Button>

            <Button
              mode="text"
              onPress={() => router.push("/(auth)/signup")}
              style={styles.registerButton}
              labelStyle={{ color: COLORS.dark }}
            >
              Don’t have an account? Sign Up
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    justifyContent: "space-between",
    backgroundColor: COLORS.accent,
  },
  header: {
    alignItems: "center",
    marginBottom: SIZING.padding * 2,
    borderBottomLeftRadius: SIZING.radius_3xl,
    borderBottomRightRadius: SIZING.radius_3xl,
    overflow: "hidden",
    backgroundColor: COLORS.background,
    width: "100%",
    height: "40%",
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
    fontSize: 48,
    fontWeight: "bold",
    color: COLORS.black,
  },
  form: {
    flex: 1,
    paddingHorizontal: SIZING.padding,
  },
  footer: {
    paddingTop: SIZING.padding,
    paddingBottom: SIZING.padding * 2,
  },
  loginText: {
    ...FONTS.body,
    fontFamily: "Rubik",
    color: COLORS.black,
    textAlign: "center",
  },
  input: {
    margin: SIZING.base,
    fontSize: 16,
  },
  button: {
    backgroundColor: COLORS.dark,
    padding: SIZING.base,
    borderWidth: 1,
    borderColor: COLORS.dark,
    borderRadius: SIZING.radius_md,
    marginHorizontal: SIZING.margin + SIZING.base,
  },
  registerButton: {
    ...FONTS.body,
  },
});

export default LoginScreen;
