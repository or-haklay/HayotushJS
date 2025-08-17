import React from "react";
import { View } from "react-native";
import { Text } from "react-native-paper";
import { styles } from "./styles";

const PetsScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>הוצאות</Text>
      <Text>המסך הזה יתווסף בגרסה הבאה – לא חלק מה־MVP המינימלי.</Text>
    </View>
  );
};

export default PetsScreen;
