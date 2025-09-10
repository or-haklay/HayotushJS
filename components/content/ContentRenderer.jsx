import React from "react";
import { View, Image } from "react-native";
import { Text } from "react-native-paper";
import { COLORS, SIZING, FONTS } from "../../theme/theme";

export default function ContentRenderer({ blocks }) {
  if (!blocks || !Array.isArray(blocks)) return null;

  const isHebrew = (s) => typeof s === "string" && /[\u0590-\u05FF]/.test(s);
  const dirStyles = (s) =>
    isHebrew(s)
      ? { writingDirection: "rtl", textAlign: "right" }
      : { writingDirection: "ltr", textAlign: "left" };

  return (
    <View style={{ gap: 12 }}>
      {blocks.map((b, idx) => {
        if (b.type === "paragraph") {
          return (
            <View key={idx}>
              <Text
                style={{
                  ...FONTS.body,
                  color: COLORS.dark,
                  lineHeight: 22,
                  ...dirStyles(b.text),
                }}
              >
                {b.text}
              </Text>
              <View
                style={{
                  height: 1,
                  backgroundColor: COLORS.neutral + "33",
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
                backgroundColor: "#FFF8E1",
                borderColor: "#F2A90044",
                borderWidth: 1,
                padding: 12,
                borderRadius: 12,
              }}
            >
              {b.title ? (
                <Text
                  style={{
                    ...FONTS.h3,
                    color: "#8B6A00",
                    marginBottom: 6,
                    ...dirStyles(b.title),
                  }}
                >
                  {b.title}
                </Text>
              ) : null}
              <Text style={{ color: "#6A5E00", ...dirStyles(b.text) }}>
                {b.text}
              </Text>
            </View>
          );
        }
        if (b.type === "image" && b.url) {
          return (
            <View key={idx}>
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
                    ...dirStyles(b.caption),
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
