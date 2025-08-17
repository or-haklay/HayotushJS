import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { SIZING, FONTS, COLORS } from "../../theme/theme";

const logo = require("../../assets/images/logo.png");

const LogoWithName = ({ isWhite = false }) => {
  return (
    <View style={styles.container}>
      <Text style={[styles.name, isWhite && styles.nameWhite]}>Hayotush</Text>
      <Image source={logo} style={styles.logo} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginBottom: SIZING.margin,
    flex: 1,
    justifyContent: "center",
    alignItems: "flex-end",
    flexDirection: "row",
    position: "absolute",
    top: SIZING.margin,
    left: SIZING.margin + 30,
  },
  logo: {
    width: 30,
    height: 30,
    resizeMode: "contain",
  },
  name: {
    ...FONTS.h3,
    color: COLORS.neutral,
    fontWeight: "bold",
  },
  nameWhite: {
    color: COLORS.white,
  },
});

export default LogoWithName;
