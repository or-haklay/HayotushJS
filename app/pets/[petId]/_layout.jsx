import React from "react";
import { Stack } from "expo-router";

export default function PetDetailLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="expenses" />
      <Stack.Screen name="medical-records" />
      <Stack.Screen name="reminders" />
    </Stack>
  );
}
