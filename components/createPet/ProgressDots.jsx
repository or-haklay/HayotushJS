import React from "react";
import { View } from "react-native";

export default function ProgressDots({ step, total }) {
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
            backgroundColor: step === index + 1 ? "#017A82" : "#BDBDBD",
          }}
        />
      ))}
    </View>
  );
}
