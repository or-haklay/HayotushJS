import React from "react";
import { Stack } from "expo-router";

export default function PetsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="add-pet" />
      <Stack.Screen name="[petId]" />
    </Stack>
  );
}
