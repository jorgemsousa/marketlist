import React, { createContext, useContext, useMemo } from "react";
import { useColorScheme } from "react-native";

export type Theme = "light" | "dark";

export const lightColors = {
  background: "#FFFFFF",
  card: "#F3F4F6",
  cardAlt: "#E5E7EB",
  text: "#000000",
  textSecondary: "#6B7280",
  textOnPrimary: "#FFFFFF",
  primary: "#7e22ce",
  primaryLight: "#ac24db",
  primaryFaded: "rgba(126, 34, 206, 0.1)",
  border: "#E5E7EB",
  success: "#86EFAC",
  successText: "#166534",
  danger: "#EF4444",
  white: "#FFFFFF",
  black: "#000000",
  overlay: "rgba(0,0,0,0.5)",
  tabBarBg: "#FFFFFF",
};

export const darkColors: typeof lightColors = {
  background: "#121212",
  card: "#1E1E2E",
  cardAlt: "#2D2D44",
  text: "#F3F4F6",
  textSecondary: "#9CA3AF",
  textOnPrimary: "#FFFFFF",
  primary: "#A855F7",
  primaryLight: "#C084FC",
  primaryFaded: "rgba(168, 85, 247, 0.15)",
  border: "#374151",
  success: "#166534",
  successText: "#86EFAC",
  danger: "#EF4444",
  white: "#1E1E2E",
  black: "#000000",
  overlay: "rgba(0,0,0,0.7)",
  tabBarBg: "#1E1E2E",
};

interface ThemeContextType {
  theme: Theme;
  colors: typeof lightColors;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "light",
  colors: lightColors,
  isDark: false,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = isDark ? darkColors : lightColors;
  const theme = colorScheme ?? "light";

  const value = useMemo(() => ({ theme, colors, isDark }), [theme, colors, isDark]);

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
