import React from "react";
import {
  View,
  StyleSheet,
  SafeAreaView,
  Image,
  ScrollView,
  ImageBackground,
} from "react-native";
// 1. ייבוא רכיבים מ-React Native Paper
import { Text, Button } from "react-native-paper";
import { getColors, SIZING, FONTS } from "../theme/theme"; // ודא שהנתיב נכון
import { useRouter } from "expo-router";
import LogoWithName from "../components/ui/LogoWithName";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { useTheme } from "../context/ThemeContext";

const image = require("../assets/images/dogs/dog-sit.png"); // ודא שהנתיב נכון

const WelcomeScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  // מסך WELCOME תמיד בהיר
  const colors = getColors(false);
  const styles = createStyles(colors);

  return (
    <SafeAreaView style={[styles.safeArea, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <LogoWithName isWhite />
        </View>
        <View style={styles.background}>
          <Image source={image} style={styles.image} resizeMode="contain" />
        </View>
        <View style={styles.footer}>
          <Text style={styles.welcomeTitle}>{t("welcome.title")}</Text>
          <Button
            mode="contained"
            onPress={() => router.push("/(auth)/signup")}
            labelStyle={styles.buttonLabel}
            style={styles.button}
            buttonColor={colors.accent}
          >
            {t("welcome.start_button")} →
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (colors) =>
  StyleSheet.create({
    background: {
      flex: 1,
      zIndex: -1,
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      height: "80%",
      justifyContent: "center",
      backgroundColor: colors.background,
    },
    image: {
      width: "100%",
      position: "relative",
      zIndex: -1,
      top: 0,
    },
    safeArea: {
      flex: 1,
    },
    container: {
      flex: 1,
      justifyContent: "space-between", // דוחף את הכותרת למעלה ואת התוכן למטה
      padding: SIZING.padding,
    },
    header: {
      alignItems: "center",
    },
    footer: {
      alignItems: "center",
      paddingBottom: SIZING.padding * 2,
    },
    welcomeTitle: {
      ...FONTS.h1,
      fontSize: 42,
      lineHeight: 50,
      color: colors.text, // טקסט לבן לקריאות על הרקע
      textAlign: "left",
      alignSelf: "flex-start",
      margin: SIZING.margin,
      marginBottom: SIZING.margin * 2,
      fontFamily: "Poppins-Bold",
    },
    button: {
      width: "90%",
      borderRadius: SIZING.radius_xl,
      paddingVertical: SIZING.base / 2,
    },
    buttonLabel: {
      ...FONTS.h3,
      fontFamily: "Poppins-Bold",
      color: colors.text, // טקסט לבן לקריאות על הרקע
    },
  });

export default WelcomeScreen;
