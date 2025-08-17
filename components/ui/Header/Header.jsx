import React from "react";
import { View, Image } from "react-native";
import { Text, IconButton } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import styles from "./styles";
import NotificationBell from "../NotificationBell";

const Header = ({
  title,
  showLogo = false,
  rightIcon = null,
  onRightPress = null,
  showBackButton = false,
  onBackPress = null,
}) => {
  return (
    <View style={styles.header}>
      <View style={styles.leftSection}>
        {showBackButton && <NotificationBell />}

        {showLogo && (
          <View style={styles.logoContainer}>
            <Image
              source={require("../../../assets/images/logo.png")}
              style={styles.logoImage}
            />
            <Text style={styles.logoText}>{title}</Text>
          </View>
        )}

        {!showLogo && <Text style={styles.title}>{title}</Text>}
      </View>

      {rightIcon && (
        <IconButton
          icon={rightIcon}
          iconColor={styles.rightIcon.color}
          size={28}
          onPress={onRightPress}
        />
      )}
    </View>
  );
};

export default Header;
