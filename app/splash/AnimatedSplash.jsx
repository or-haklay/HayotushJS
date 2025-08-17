import React, { useEffect, useRef } from "react";
import { View, StyleSheet } from "react-native";
import LottieView from "lottie-react-native";
import { Text, useTheme } from "react-native-paper";

export default function AnimatedSplash({ navigation }) {
  const animation = useRef(null);
  const theme = useTheme();

  useEffect(() => {
    // אחרי 3 שניות או טעינת נתונים -> מעבר
    const timer = setTimeout(() => {
      navigation.replace("home"); // או "login" אם אין טוקן
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.primary }]}>
      <LottieView
        autoPlay
        loop={false}
        ref={animation}
        style={{ width: 200, height: 200 }}
        source={require("../../assets/animations/splash-animation.json")}
      />
      <Text
        variant="headlineMedium"
        style={{ color: theme.colors.onPrimary, marginTop: 16 }}
      >
        Hayotush
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
