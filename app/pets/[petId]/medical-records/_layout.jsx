import React from "react";
import { Stack } from "expo-router";

export default function MedicalRecordsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="new" />
    </Stack>
  );
}
