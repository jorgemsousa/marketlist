import { View, Text } from "react-native";
import { useNetworkStatus } from "../hooks/useNetworkStatus";

export default function OfflineBanner() {
  const isConnected = useNetworkStatus();

  if (isConnected) return null;

  return (
    <View className="bg-yellow-500 px-4 py-2">
      <Text className="text-white text-center font-semibold text-sm">
        Você está offline — as alterações serão sincronizadas quando conectar
      </Text>
    </View>
  );
}
