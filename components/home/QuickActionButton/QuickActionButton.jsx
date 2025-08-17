import React from "react";
import { TouchableOpacity } from "react-native";
import { Text } from "react-native-paper";
import styles from "./styles";

const QuickActionButton = ({ title, icon, color, onPress }) => {
  return (
    <TouchableOpacity
      style={[styles.quickAction, { backgroundColor: color }]}
      onPress={onPress}
    >
      {icon}
      <Text style={styles.quickActionText}>{title}</Text>
    </TouchableOpacity>
  );
};

export default QuickActionButton;
