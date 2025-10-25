import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Text } from "react-native-paper";
import { createStyles } from "./styles";
import { useTheme } from "../../../context/ThemeContext";

const ReminderCard = ({
  reminderText1,
  reminderText2,
  reminderText3,
  petName,
  buttonText,
  onButtonPress,
}) => {
  const { isDark } = useTheme();
  const styles = createStyles(isDark);

  return (
    <View style={styles.reminderCard}>
      <View style={styles.reminderTextContainer}>
        <Text style={styles.reminderText}>{reminderText1}</Text>
        <Text style={styles.reminderPetName}>
          {reminderText2} {petName}
        </Text>
        <Text style={styles.reminderText}>{reminderText3}</Text>
      </View>
      <TouchableOpacity style={styles.reminderButton} onPress={onButtonPress}>
        <Text style={styles.reminderButtonText}>{buttonText}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ReminderCard;
