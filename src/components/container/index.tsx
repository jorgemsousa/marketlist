import { View } from "react-native";
import { useTheme } from "../../contexts/ThemeContext";

type Props = {
  children: React.ReactNode;
};

export default function Container({ children }: Props) {
  const { colors } = useTheme();
  return (
    <View className="flex-1 p-4" style={{ backgroundColor: colors.background }}>
      {children}
    </View>
  );
}
