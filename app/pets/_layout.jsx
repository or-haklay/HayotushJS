import React from "react";
import { Stack } from "expo-router";
import { PetCreationProvider } from "../../context/PetCreationContext";

export default function PetsLayout() {
  return (
    <PetCreationProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="new" />
        <Stack.Screen name="create" />
        <Stack.Screen name="[petId]" />
      </Stack>
    </PetCreationProvider>
  );
}
