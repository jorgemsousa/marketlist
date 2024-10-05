import type React from "react";
import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";

type Props = {
    title: string;
    children?: React.ReactNode;
    page?: string | null;
    signOut?: () => void;
}


const Header = ({ children, title, page, signOut }: Props) => {
    return (
        <View className="flex-row items-center justify-between w-full h-40 bg-purple-700 rounded-b-3xl px-4">
            <TouchableOpacity onPress={() => router.replace(page)}>
                <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text className="text-white text-md font-bold ml-4">{title}</Text>
            <TouchableOpacity onPress={signOut}>
                <Ionicons name="exit" size={24} color="#fff" />
            </TouchableOpacity>
            {children}
        </View>
    );
}
export default Header;