import React from "react";
import { View, SafeAreaView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import styles from "./styles";

const ScreenContainer = ({
  children,
  style,
  safeArea = true,
  backgroundColor = null,
}) => {
  const insets = useSafeAreaInsets();

  if (safeArea) {
    return (
      <SafeAreaView style={[styles.safeContainer, { backgroundColor }]}>
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
