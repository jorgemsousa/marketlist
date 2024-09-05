import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

type Props = {
    title: string;
    children?: React.ReactNode;
    signOut?: () => void;
}

const Header = ({ children, title, signOut }: Props) => {
    return (
        <View className="flex-row items-center justify-between w-full h-40 bg-purple-700 rounded-b-3xl px-4">
            <Text className="text-white text-2xl font-bold ml-4">{title}</Text>
            <TouchableOpacity onPress={signOut}>
                <Ionicons name="exit" size={24} color="#fff" />
            </TouchableOpacity>
            {children}
        </View>
    );
}

export default Header;