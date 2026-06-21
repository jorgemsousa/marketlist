import React, { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { auth } from "@/src/database/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Onboarding } from "../components/onboarding";

export default function Index() {
  const [screen, setScreen] = useState<"loading" | "onboarding" | null>("loading");

  useEffect(() => {
    const init = async () => {
      try {
        // 1. Check if onboarding was already completed
        const onboarded = await AsyncStorage.getItem("onboarding_completed");

        if (onboarded === "true") {
          // 2. Onboarding já visto — verificar auth e redirecionar
          const unsubscribe = onAuthStateChanged(auth, (user) => {
            unsubscribe();
            if (user) {
              router.replace("/(tabs)/dashboard");
            } else {
              router.replace("/login");
            }
          });
        } else {
          // 3. Primeira vez — mostrar onboarding
          setScreen("onboarding");
        }
      } catch {
        // Em caso de erro, mostra onboarding como fallback seguro
        setScreen("onboarding");
      }
    };

    init();
  }, []);

  if (screen === "loading") {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" }}>
        <ActivityIndicator size="large" color="#7c3aed" />
      </View>
    );
  }

  return <Onboarding.List />;
}
