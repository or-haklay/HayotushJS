import React from "react";
import { Tabs } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons"; // ספריית אייקונים פופולרית
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SIZING, COLORS } from "../../theme/theme"; // יבוא קבצי נושא
import { useTranslation } from "react-i18next";

const TabsLayout = () => {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  return (
    <Tabs
      screenOptions={{
        headerShown: false, // נסתיר את הכותרת הדיפולטיבית, כי לכל מסך יש כותרת משלו
        tabBarActiveTintColor: COLORS.accent, // צבע לאייקון פעיל (Teal)
        tabBarInactiveTintColor: COLORS.background, // צבע לאייקון לא פעיל (אפור)
        tabBarStyle: {
          backgroundColor: COLORS.neutral, // צבע רקע התפריט (לבן)
          borderTopWidth: 1,
          borderTopColor: "#E0E0E0",
          height: 60,
          paddingBottom: 5,
          marginBottom: insets.bottom ? insets.bottom : 10,
          marginHorizontal: SIZING.pageMargin,
          borderRadius: SIZING.radius_xl, // 4. פינות מעוגלות
          elevation: 2,
        },
        tabBarLabelStyle: {
          fontFamily: "Poppins-SemiBold",
          fontSize: 10,
        },
      }}
    >
      {/* מסך הבית */}
      <Tabs.Screen
        name="home"
        options={{
          title: t("common.home"),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />

      {/* כפתור הוספה מרכזי - זהו "טאב" מיוחד שהוא בעצם כפתור */}

      {/* מסך הפרופיל */}
      <Tabs.Screen
        name="profile"
        options={{
          title: t("common.profile"),
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="paw" size={size} color={color} />
          ),
        }}
      />

      {/* מסך חיפוש שירות */}
      <Tabs.Screen
        name="search"
        options={{
          title: t("common.search"),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search" size={size} color={color} />
          ),
        }}
      />
      {/* מסך הצ'אט */}
      <Tabs.Screen
        name="chat"
        options={{
          title: t("common.chat"),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubble-ellipses" size={size} color={color} />
          ),
        }}
      />
      {/* מסך הגדרות */}
      <Tabs.Screen
        name="settings"
        options={{
          title: t("common.settings"),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
};

export default TabsLayout;
