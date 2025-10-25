import { Redirect } from "expo-router";
import { useAuth } from "../hooks/useAuth";
import { View, ActivityIndicator } from "react-native";
import { getColors } from "../theme/theme";
import { useTheme } from "../context/ThemeContext";

export default function Index() {
  const { user, isLoading } = useAuth();
  const { isDark } = useTheme();
  const colors = getColors(isDark);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (user) {
    return <Redirect href="/(tabs)/home" />;
  } else {
    return <Redirect href="/welcome" />;
  }
}
