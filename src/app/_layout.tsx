import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import "../../global.css";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    SpaceMono: require("../../assets/fonts/SpaceMono-Regular.ttf"),
  });

  if (!fontsLoaded) {
    return null; // ou um componente de loading
  }
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="list/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}
