import React from "react";
import { View } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { createStyles } from "./styles";
import { useTheme } from "../../../context/ThemeContext";
import { useRTL } from "../../../hooks/useRTL";

const ScreenContainer = ({
  children,
  style,
  safeArea = true,
  backgroundColor = null,
}) => {
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();
  const rtl = useRTL();
  const styles = createStyles(isDark);

  if (safeArea) {
    return (
      <SafeAreaView
        style={[
          styles.safeContainer,
          {
            backgroundColor:
              backgroundColor || styles.container.backgroundColor,
            direction: rtl.direction,
          },
        ]}
      >
        <View style={[styles.container, { direction: rtl.direction }, style]}>{children}</View>
      </SafeAreaView>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor, direction: rtl.direction }, style]}>
      {children}
    </View>
  );
};

export default ScreenContainer;
