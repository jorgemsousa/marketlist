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

const hideIcon = ['Dashboard', 'Listas de Compras', 'Produtos', 'Perfil'];

const Header = ({ children, title, page, signOut }: Props) => {
    return (
        <View className="flex   w-full bg-purple-700 h-30 rounded-b-2xl px-4 pt-4">
            <View className="flex-row  items-center justify-between mt-10 mb-5">
                {!hideIcon.includes(title) ? (
                    <TouchableOpacity onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    ) : (
                        <View />    
                    )
                }
                <Text className="text-white text-md font-bold ml-4">{title}</Text>
                <TouchableOpacity onPress={signOut}>
                    <Ionicons name="exit" size={24} color="#fff" />
                </TouchableOpacity>
                {children}
            </View>
        </View>
    );
}
export default Header;