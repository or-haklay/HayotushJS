import React from "react";
import { View, Image, Text } from "react-native";
import { COLORS, SIZING, FONTS, getColors } from "../../theme/theme";
import { useTheme } from "../../context/ThemeContext";
import { useRTL } from "../../hooks/useRTL";

export default function ContentRenderer({ blocks }) {
  const { isDark } = useTheme();
  const colors = getColors(isDark);
  const rtl = useRTL();


  if (!blocks || !Array.isArray(blocks)) return null;

  // כל הטקסט במאמרים משתמש בכיוון של שפת האפליקציה (rtl.textAlign ו-rtl.writingDirection)

  return (
    <View style={{ gap: 12, direction: rtl.direction }}>
      {blocks.map((b, idx) => {
        if (b.type === "paragraph") {
          return (
            <View key={idx} style={{ direction: rtl.direction }}>
              <Text
                style={{
                  ...FONTS.body,
                  color: colors.text,
                  lineHeight: 22,
                  textAlign: rtl.textAlign,
                  writingDirection: rtl.writingDirection,
                }}
              >
                {b.text}
              </Text>
              <View
                style={{
                  height: 1,
                  backgroundColor: colors.border,
                  marginVertical: 10,
                }}
              />
            </View>
          );
        }
        if (b.type === "tip") {
          return (
            <View
              key={idx}
              style={{
                backgroundColor: isDark ? "#3A3A1A" : "#FFF8E1",
                borderColor: isDark ? "#FFD54F44" : "#F2A90044",
                borderWidth: 1,
                padding: 12,
                borderRadius: 12,
                direction: rtl.direction,
              }}
            >
              {b.title ? (
                <Text
                  style={{
                    ...FONTS.h3,
                    color: "#8B6A00",
                    marginBottom: 6,
                    textAlign: rtl.textAlign,
                    writingDirection: rtl.writingDirection,
                  }}
                >
                  {b.title}
                </Text>
              ) : null}
              <Text 
                style={{ 
                  color: "#6A5E00", 
                  textAlign: rtl.textAlign,
                  writingDirection: rtl.writingDirection,
                }}
              >
                {b.text}
              </Text>
            </View>
          );
        }
        if (b.type === "image" && b.url) {
          return (
            <View key={idx} style={{ direction: rtl.direction }}>
              <Image
                source={{ uri: b.url }}
                style={{
                  width: "100%",
                  height: 220,
                  borderRadius: 12,
                  backgroundColor: "#eaeaea",
                }}
                resizeMode="cover"
              />
              {b.caption ? (
                <Text
                  style={{
                    color: COLORS.neutral,
                    marginTop: 4,
                    textAlign: rtl.textAlign,
                    writingDirection: rtl.writingDirection,
                  }}
                >
                  {b.caption}
                </Text>
              ) : null}
            </View>
          );
        }
        return null;
      })}
    </View>
  );
}
