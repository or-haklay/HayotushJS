import React from "react";
import { View, ViewStyle } from "react-native";
import { useTheme } from "react-native-paper";
import styles from "./styles";

const Card = ({
  children,
  style,
  variant = "default",
  padding = "medium",
}) => {
  const theme = useTheme();

  const cardStyle = [
    styles.card,
    styles[`variant_${variant}`],
    styles[`padding_${padding}`],
    style,
  ];

  return <View style={cardStyle}>{children}</View>;
};

export default Card;
