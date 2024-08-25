import { View } from "react-native";

type Props = {
  children: React.ReactNode;
};

export default function Container({ children }: Props) {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      {children}
    </View>
  );
}
