import React from "react";
import { View } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { createStyles } from "./styles";
import { useTheme } from "../../../context/ThemeContext";

const ScreenContainer = ({
  children,
  style,
  safeArea = true,
  backgroundColor = null,
}) => {
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();
  const styles = createStyles(isDark);

  if (safeArea) {
    return (
      <SafeAreaView
        style={[
          styles.safeContainer,
          {
            backgroundColor:
              backgroundColor || styles.container.backgroundColor,
          },
        ]}
      >
        <View style={[styles.container, style]}>{children}</View>
      </SafeAreaView>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor }, style]}>
      {children}
    </View>
  );
};

export default ScreenContainer;
