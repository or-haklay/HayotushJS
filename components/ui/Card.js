import React from "react";
import { View, StyleSheet } from "react-native";
import { COLORS, SIZING } from "../../theme/theme";

const Card = ({ children, style, accentColor }) => {
  return (
    <View style={[styles.container, style]}>
      {/* פס ההדגשה הצבעוני בצד */}
      {accentColor && (
        <View style={[styles.accentBar, { backgroundColor: accentColor }]} />
      )}
      <View style={styles.content}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: SIZING.radius_md,
    marginVertical: SIZING.base,
    // הוספת הצללה עדינה
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
    flexDirection: "row",
  },
  accentBar: {
    width: 6,
    borderTopLeftRadius: SIZING.radius_md,
    borderBottomLeftRadius: SIZING.radius_md,
  },
  content: {
    padding: SIZING.padding,
    flex: 1,
  },
});

export default Card;
