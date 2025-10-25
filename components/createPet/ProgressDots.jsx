import React from "react";
import { View } from "react-native";
import { useTheme } from "../../context/ThemeContext";
import { getColors } from "../../theme/theme";

export default function ProgressDots({ step, total }) {
  const { isDark } = useTheme();
  const colors = getColors(isDark);

  return (
    <View style={{ flexDirection: "row", marginVertical: 16 }}>
      {Array.from({ length: total }).map((_, index) => (
        <View
          key={index}
          style={{
            height: 8,
            width: step === index + 1 ? 24 : 8,
            borderRadius: 8,
            marginHorizontal: 4,
            backgroundColor:
              step === index + 1 ? colors.primary : colors.disabled,
          }}
        />
      ))}
    </View>
  );
}
