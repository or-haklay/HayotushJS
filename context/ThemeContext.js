import React, { createContext, useContext, useState, useEffect } from "react";
import { Appearance } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ThemeContext = createContext();

const THEME_STORAGE_KEY = "@theme_preference";

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState("light"); // ברירת מחדל - עיצוב בהיר
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    loadTheme();
  }, []);

  useEffect(() => {
    updateTheme();
  }, [theme]);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme) {
        setTheme(savedTheme);
      }
    } catch (error) {
      console.error("Error loading theme:", error);
    }
  };

  const updateTheme = async () => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, theme);

      let shouldBeDark = false;

      switch (theme) {
        case "dark":
          shouldBeDark = true;
          break;
        case "light":
          shouldBeDark = false;
          break;
        case "auto":
        default:
          // ברירת מחדל - עיצוב בהיר גם במצב auto
          shouldBeDark = false;
          break;
      }

      setIsDark(shouldBeDark);
    } catch (error) {
      console.error("Error saving theme:", error);
    }
  };

  const toggleTheme = () => {
    const newTheme = isDark ? "light" : "dark";
    setTheme(newTheme);
  };

  const value = {
    theme,
    isDark,
    setTheme,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};
