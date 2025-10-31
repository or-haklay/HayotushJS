import React from "react";
import { Tabs } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons"; // ספריית אייקונים פופולרית
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SIZING, getColors } from "../../theme/theme"; // יבוא קבצי נושא
import { useTranslation } from "react-i18next";
import { StyleSheet } from "react-native";
import { useTheme } from "../../context/ThemeContext";
import { COLORS } from "../../theme/theme";

const TabsLayout = () => {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const colors = getColors(isDark);

  return (
    <Tabs
      screenOptions={{
        headerShown: false, // נסתיר את הכותרת הדיפולטיבית, כי לכל מסך יש כותרת משלו
        tabBarActiveTintColor: COLORS.accent, // צבע לאייקון פעיל (Teal)
        tabBarInactiveTintColor: COLORS.background, // צבע לאייקון לא פעיל (אפור)
        tabBarStyle: {
          backgroundColor: colors.neutral, // צבע רקע התפריט (לבן)
          borderTopWidth: 1,
          borderTopColor: colors.border,
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
      
      {/* מסך טיולים */}
      <Tabs.Screen
        name="walks"
        options={{
          title: t("walks.title"),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="walk" size={size} color={color} />
          ),
        }}
      />
      
      {/* טאב ידע */}
      <Tabs.Screen
        name="learn"
        options={{
          title: "ידע",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="book-open-variant"
              size={size}
              color={color}
            />
          ),
        }}
      />
      {/* מסך הצ'אט */}
      {/* <Tabs.Screen
          name="chat"
          options={{
            title: t("common.chat"),
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="chatbubble-ellipses" size={size} color={color} />
            ),
          }}
        /> */}
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

const styles = StyleSheet.create({
  background: {
    flex: 1,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});
