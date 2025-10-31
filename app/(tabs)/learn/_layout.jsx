import React from "react";
import { Stack } from "expo-router";
import { useRTL } from "../../../hooks/useRTL";

export default function LearnLayout() {
  const rtl = useRTL();
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { direction: rtl.direction },
      }}
    />
  );
}
