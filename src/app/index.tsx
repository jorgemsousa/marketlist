import { Text, View } from "react-native";

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text className="text-gray-800 text-4xl">Essa é a nova tela inicial.</Text>
    </View>
  );
}
