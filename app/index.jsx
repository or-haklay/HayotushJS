import { Redirect } from "expo-router";
import { useAuth } from "../hooks/useAuth";
import { View, ActivityIndicator } from "react-native";
import { COLORS } from "../theme/theme";

export default function Index() {
  const { user, isLoading } = useAuth();
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (user) {
    return <Redirect href="/(tabs)/home" />;
  } else {
    return <Redirect href="/welcome" />;
  }
}
