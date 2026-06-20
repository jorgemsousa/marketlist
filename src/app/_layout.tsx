import { View } from "react-native";
import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import { ThemeProvider } from "../contexts/ThemeContext";
import OfflineBanner from "../components/OfflineBanner";
import "../../global.css";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    SpaceMono: require("../../assets/fonts/SpaceMono-Regular.ttf"),
  });

  if (!fontsLoaded) {
    return null;
  }
  return (
    <ThemeProvider>
      <View className="flex-1 bg-white">
        <OfflineBanner />
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="list/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
      </View>
    </ThemeProvider>
  );
}
