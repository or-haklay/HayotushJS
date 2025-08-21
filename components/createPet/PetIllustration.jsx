import React from "react";
import { Image } from "react-native";

export default function PetIllustration({ source }) {
  return (
    <Image
      source={source}
      style={{ width: 220, height: 220, resizeMode: "contain" }}
    />
  );
}
