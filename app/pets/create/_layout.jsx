import React from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
} from "react-native";
import { Text, Button } from "react-native-paper";
import { Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS, SIZING, getColors } from "@/theme/theme";
import { useTheme } from "@/context/ThemeContext";

// הגדרת צבעים וגדלים ישירות כאן כדי למנוע בעיות import

export const StepNavigationHeader = ({
  step,
  total,
  onBack,
  onNext,
  canGoBack = true,
  canGoNext = true,
  backText = "חזור",
  nextText = "הבא",
  nextDisabled = false,
  loading = false,
  onStepPress,
}) => {
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();
  const colors = getColors(isDark);
  const renderStepButtons = () => {
    const steps = [];
    for (let i = 1; i <= total; i++) {
      steps.push(
        <TouchableOpacity
          key={i}
          style={[
            styles.stepButton,
            i === step && styles.activeStepButton,
            i < step && styles.completedStepButton,
          ]}
          onPress={() => onStepPress && onStepPress(i)}
          disabled={!onStepPress}
        >
          <Text
            style={[
              styles.stepButtonText,
              i === step && styles.activeStepButtonText,
              i < step && styles.completedStepButtonText,
            ]}
          >
            {i}
          </Text>
        </TouchableOpacity>
      );
    }
    return steps;
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + 10 }]}>
      <ImageBackground
        source={
          isDark
            ? require("../../../assets/images/pet-new-background2.png")
            : require("../../../assets/images/pet-new-background.png")
        }
        style={[styles.background, { paddingTop: insets.top + 10 }]}
      >
        {/* Progress Bar and Step Buttons at Top */}
        <View style={styles.header}>
          {/* Step Navigation Buttons */}
          <View style={styles.stepButtonsContainer}>{renderStepButtons()}</View>
        </View>

        {/* Navigation Buttons at Bottom */}
        <View
          style={[
            styles.bottomNavigation,
            { paddingBottom: insets.bottom + 10 },
          ]}
        >
          {/* Left Half Circle */}

          {/* Navigation Buttons */}
          <View
            style={[
              styles.navigationContainer,
              { marginBottom: insets.bottom + 10 },
            ]}
          >
            {canGoBack && (
              <Button
                mode="outlined"
                onPress={onBack}
                style={[styles.navButton, styles.prevButton]}
                textColor={COLORS.primary}
                disabled={loading}
              >
                {backText}
              </Button>
            )}

            {canGoNext && (
              <Button
                mode="contained"
                onPress={onNext}
                style={[styles.navButton, styles.nextButton]}
                buttonColor={COLORS.primary}
                disabled={nextDisabled || loading}
                loading={loading}
              >
                {nextText}
              </Button>
            )}
          </View>
        </View>
      </ImageBackground>
    </View>
  );
};

const TabsLayout = () => {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: "white" },
      }}
    >
      <Stack.Screen
        name="Step1"
        options={{
          title: "שלב 1 - פרטי החיה",
        }}
      />
      <Stack.Screen
        name="Step2"
        options={{
          title: "שלב 2 - אופי ויצירה",
        }}
      />
      <Stack.Screen
        name="Step3"
        options={{
          title: "שלב 3 - תמונה",
        }}
      />
      <Stack.Screen
        name="Step4"
        options={{
          title: "שלב 4 - פרטים נוספים",
        }}
      />
    </Stack>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    flex: 1,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
  header: {},
  background: {
    flex: 1,
    position: "absolute",
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    zIndex: -1,
  },

  progressContainer: {
    alignItems: "center",
    marginBottom: SIZING.margin_xl,
    paddingTop: SIZING.padding_sm,
    backgroundColor: "rgba(255, 255, 255, 0.98)",
    paddingVertical: SIZING.padding_md,
    borderRadius: SIZING.radius_md,
    marginHorizontal: SIZING.margin_sm,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.1)",
  },
  progressBar: {
    width: "90%",
    height: 10,
    backgroundColor: "#E0E0E0",
    borderRadius: SIZING.radius_md,
    overflow: "hidden",
    marginBottom: SIZING.margin_sm,
    marginHorizontal: SIZING.margin_xl,
    marginTop: SIZING.margin_sm,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  progressFill: {
    height: "100%",
    backgroundColor: COLORS.primary,
    borderRadius: SIZING.radius_md,
    elevation: 3,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  progressText: {
    fontSize: SIZING.font_md,
    color: COLORS.text,
    fontFamily: "Poppins-Medium",
    fontWeight: "700",
    textAlign: "center",
  },
  bottomNavigation: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 0, // Will be set dynamically with safe area
  },
  navigationContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 60, // Add space for the half-circles
    marginBottom: 0, // Will be set dynamically with safe area
    marginTop: 20,
  },
  navButton: {
    minWidth: 120,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    position: "absolute",
    bottom: 10, // Reduced from 30 to avoid overlap
    height: 40,
    zIndex: 1000,
  },
  prevButton: {
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    borderTopRightRadius: SIZING.radius_md,
    borderBottomRightRadius: SIZING.radius_md,
    left: 0,
    backgroundColor: COLORS.background,
  },
  nextButton: {
    elevation: 6,
    shadowOpacity: 0.2,
    shadowRadius: 8,
    borderTopLeftRadius: SIZING.radius_md,
    borderBottomLeftRadius: SIZING.radius_md,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    right: 0,
  },

  stepButtonsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: SIZING.margin_xs,
    gap: SIZING.margin_md,
    paddingHorizontal: SIZING.padding_sm,
  },
  stepButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F5F5F5",
    borderWidth: 2,
    borderColor: "#E0E0E0",
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  activeStepButton: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.primary,
    elevation: 8,
    shadowOpacity: 0.3,
    shadowRadius: 6,
    transform: [{ scale: 1.15 }],
  },
  completedStepButton: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
    elevation: 6,
    shadowOpacity: 0.25,
    shadowRadius: 5,
  },
  stepButtonText: {
    fontSize: SIZING.font_md,
    color: "#666",
    fontFamily: "Poppins-Medium",
    fontWeight: "700",
  },
  activeStepButtonText: {
    color: "white",
    fontWeight: "800",
  },
  completedStepButtonText: {
    color: "white",
    fontWeight: "800",
  },
});

export default TabsLayout;
