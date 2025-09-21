import { View } from "react-native";

type Props = {
  children: React.ReactNode;
};

export default function Container({ children }: Props) {
  return (
    <View className="flex-1 p-4 bg-white">
      {children}
    </View>
  );
}
