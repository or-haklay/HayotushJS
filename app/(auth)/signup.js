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
} from "react-native-paper";
import { COLORS, SIZING, FONTS } from "../../theme/theme";
import { useRouter } from "expo-router";
import LogoWithName from "../../components/ui/LogoWithName";
import authService from "../../services/authService";
import Joi from "joi";
import { useSafeAreaInsets } from "react-native-safe-area-context"; // Adjusted import path

const image = require("../../assets/images/dog-happy.jpg");

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
      setTermsError("You must accept the terms and conditions");
    } else {
      setTermsError("");
    }

    if (Object.keys(map).length > 0 || !checked) return;

    setLoading(true);
    try {
      await authService.createUser({ name, email, password });
      Alert.alert("Success", "Registration completed successfully");
      router.push("/(auth)/login");
    } catch (e) {
      console.error("Sign-up error:", e);
      Alert.alert("Error", "Registration failed, please try again later");
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
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          contentContainerStyle={[
            styles.container,
            {
              paddingBottom: insets.bottom + SIZING.padding * 2,
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
            <Text style={styles.welcomeTitle}>Register</Text>
            <Text style={styles.loginText}>Create an account to continue</Text>

            <TextInput
              label="Name"
              value={name}
              onChangeText={(v) => {
                setName(v);
                if (errors.name) handleBlur("name");
              }}
              onBlur={() => handleBlur("name")}
              mode="outlined"
              style={styles.input}
              error={!!errors.name}
            />
            <HelperText type="error" visible={!!errors.name}>
              {errors.name}
            </HelperText>

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

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: SIZING.padding,
              }}
            >
              <Checkbox
                status={checked ? "checked" : "unchecked"}
                onPress={() => setChecked((c) => !c)}
                color="#00897B"
              />
              <Text
                style={{
                  flex: 1,
                  lineHeight: 22,
                  fontSize: 12,
                }}
              >
                Accept the{" "}
                <Text
                  accessibilityRole="link"
                  onPress={() => openURL("https://example.com/terms.html")}
                  style={styles.link}
                >
                  Terms of Service
                </Text>
                and the{" "}
                <Text
                  accessibilityRole="link"
                  onPress={() => openURL("https://example.com/privacy.html")}
                  style={styles.link}
                >
                  Privacy Policy
                </Text>
              </Text>
            </View>
            <HelperText
              type="error"
              visible={!!termsError}
              style={{ marginHorizontal: SIZING.padding }}
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
              {loading ? "Registering..." : "Register"}
            </Button>
            <Button
              mode="text"
              onPress={() => router.push("/(auth)/login")}
              style={{ marginTop: SIZING.base }}
              labelStyle={{ color: COLORS.dark }}
            >
              Already have an account? Login
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  keyboardAvoidingView: { flex: 1 },
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
    height: "35%",
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
    paddingBottom: SIZING.padding * 2,
  },
  loginText: {
    ...FONTS.body,
    fontFamily: "Rubik",
    color: COLORS.black,
    textAlign: "center",
  },
  input: { marginHorizontal: SIZING.base, fontSize: 16 },
  button: {
    backgroundColor: COLORS.dark,
    padding: SIZING.base,
    borderWidth: 1,
    borderColor: COLORS.dark,
    borderRadius: SIZING.radius_md,
    marginHorizontal: SIZING.margin + SIZING.base,
  },
  textContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  link: { color: COLORS.primary, textDecorationLine: "underline" },
});

export default SignUpScreen;
