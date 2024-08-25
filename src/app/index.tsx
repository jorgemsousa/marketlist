import { Text, View } from "react-native";
import {Onboarding} from "../components/onboarding";

export default function Index() {
  return (
    <View className="flex-1 bg-white">
      <Onboarding.List />
    </View>
  );
}
