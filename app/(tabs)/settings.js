import React from "react";
import { View, StyleSheet } from "react-native";
import { Text, Button, Switch, List } from "react-native-paper";
import { COLORS, SIZING, FONTS } from "../../theme/theme";
import authService from "../../services/authService";
import { useRouter } from "expo-router";

export default function SettingsScreen() {
  const router = useRouter();

  const logout = async () => {
    try {
      await authService.logout?.();
    } catch (e) {
      console.log(e);
    }
    router.replace("/(auth)/login");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>הגדרות</Text>
      <List.Item
        title="התראות Push"
        right={() => <Switch value={true} onValueChange={() => {}} />}
      />
      <List.Item title="שפה" description="עברית" />
      <Button
        mode="outlined"
        onPress={logout}
        style={{ marginTop: SIZING.margin }}
      >
        התנתק
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SIZING.padding,
    backgroundColor: COLORS.background,
  },
  title: { ...FONTS.h2, color: COLORS.neutral, marginBottom: SIZING.margin },
});
