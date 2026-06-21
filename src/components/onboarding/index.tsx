import React, { useState, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  useWindowDimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth } from "@/src/database/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

type OnboardingItem = {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
};

const DATA: OnboardingItem[] = [
  {
    id: "1",
    icon: "list",
    title: "Crie Listas",
    description: "Organize suas compras em listas personalizadas e nunca mais esqueça nada.",
  },
  {
    id: "2",
    icon: "cart",
    title: "Gerencie Produtos",
    description: "Adicione produtos com fotos, preços e quantidades de forma simples.",
  },
  {
    id: "3",
    icon: "stats-chart",
    title: "Acompanhe Gastos",
    description: "Veja gráficos dos seus gastos e identifique padrões de consumo.",
  },
];

function List() {
  const { width } = useWindowDimensions();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [finishing, setFinishing] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / width);
    setCurrentIndex(index);
  };

  const goNext = async () => {
    if (currentIndex < DATA.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      // Último slide — finalizar onboarding
      setFinishing(true);
      try {
        // Salvar que onboarding foi concluído
        await AsyncStorage.setItem("onboarding_completed", "true");

        // Verificar se usuário já está logado
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          unsubscribe();
          if (user) {
            router.replace("/(tabs)/dashboard");
          } else {
            router.replace("/login");
          }
        });
      } catch {
        router.replace("/login");
      }
    }
  };

  const renderItem = ({ item }: { item: OnboardingItem }) => (
    <View
      style={{
        width,
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 32,
      }}
    >
      <View
        style={{
          width: 120,
          height: 120,
          borderRadius: 60,
          backgroundColor: "#7c3aed",
          justifyContent: "center",
          alignItems: "center",
          marginBottom: 48,
        }}
      >
        <Ionicons name={item.icon} size={56} color="#fff" />
      </View>
      <Text
        style={{
          fontSize: 28,
          fontWeight: "700",
          color: "#1f2937",
          marginBottom: 16,
          textAlign: "center",
        }}
      >
        {item.title}
      </Text>
      <Text
        style={{
          fontSize: 16,
          color: "#6b7280",
          textAlign: "center",
          lineHeight: 24,
        }}
      >
        {item.description}
      </Text>
    </View>
  );

  if (finishing) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#fff", justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#7c3aed" />
        <Text style={{ marginTop: 16, color: "#6b7280", fontSize: 16 }}>Preparando...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <View style={{ flex: 1 }}>
        <FlatList
          ref={flatListRef}
          data={DATA}
          renderItem={renderItem}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={onScroll}
          scrollEventThrottle={16}
          keyExtractor={(item) => item.id}
        />
      </View>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          marginBottom: 24,
        }}
      >
        {DATA.map((_, i) => (
          <View
            key={i}
            style={{
              width: i === currentIndex ? 24 : 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: i === currentIndex ? "#7c3aed" : "#d1d5db",
              marginHorizontal: 4,
            }}
          />
        ))}
      </View>
      <View style={{ paddingHorizontal: 32, paddingBottom: 48 }}>
        <View
          style={{
            backgroundColor: "#7c3aed",
            paddingVertical: 16,
            borderRadius: 12,
            alignItems: "center",
          }}
        >
          <Text
            onPress={goNext}
            style={{ color: "#fff", fontSize: 18, fontWeight: "600" }}
          >
            {currentIndex < DATA.length - 1 ? "Próximo" : "Começar"}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

export const Onboarding = { List };
