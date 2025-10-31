import { registerRootComponent } from "expo";
import { ExpoRoot } from "expo-router";

import { usePushNotifications } from "./hooks/usePushNotifications";

// Must be exported or Fast Refresh won't update the context
export function App() {
  const { expoPushToken, notification } = usePushNotifications();
  
  const ctx = require.context("./app");
  return <ExpoRoot context={ctx} />;
}

registerRootComponent(App);
