import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "@/src/database/firebaseConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import { useTheme } from "@/src/contexts/ThemeContext";

type Props = {
  onClose: () => void;
};

const Auth = ({ onClose }: Props) => {
  const { colors, isDark } = useTheme();
  const [email, setEmail] = useState("");
  const [emailFocused, setEmailFocused] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [loading, setLoading] = useState(false);

  const saveCredentials = async (email: string, password: string) => {
    try {
      await AsyncStorage.setItem(
        "userCredentials",
        JSON.stringify({ email, password })
      );
    } catch (error) {
      console.error("Erro ao salvar credenciais:", error);
    }
  };

  const clearCredentials = async () => {
    try {
      await AsyncStorage.removeItem("userCredentials");
    } catch (error) {
      console.error("Erro ao remover credenciais:", error);
    }
  };

  async function handleSignIn() {
    if (!email || !password) {
      Alert.alert("Erro", "Por favor, preencha email e senha.");
      return;
    }

    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      await saveCredentials(email, password);

      Alert.alert("Muito bom ter você de volta, aproveite as compras!");
      router.push("/dashboard");
      onClose();
    } catch (error: any) {
      const errorCode = error.code;
      let message = "Erro ao fazer login. Tente novamente.";
      if (errorCode === "auth/user-not-found") {
        message = "Usuário não encontrado.";
      } else if (errorCode === "auth/wrong-password") {
        message = "Senha incorreta.";
      } else if (errorCode === "auth/invalid-email") {
        message = "Email inválido.";
      }
      Alert.alert("Erro", message);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    try {
      await signOut(auth);
      await clearCredentials();
      Alert.alert("Logout", "Você foi desconectado com sucesso.");
      router.push("/login");
    } catch (error) {
      console.error("Erro no logout:", error);
      Alert.alert("Erro", "Falha no logout. Tente novamente.");
    }
  }

  return (
    <View>
      <TextInput
        placeholder="E-mail"
        placeholderTextColor={colors.textSecondary}
        keyboardType="email-address"
        onFocus={() => setEmailFocused(true)}
        onBlur={() => setEmailFocused(false)}
        onChangeText={setEmail}
        value={email}
        style={{
          borderWidth: 2,
          borderColor: emailFocused ? colors.primary : colors.border,
          borderRadius: 999,
          paddingHorizontal: 16,
          paddingVertical: 16,
          marginBottom: 16,
          backgroundColor: colors.card,
          color: colors.text,
        }}
        editable={!loading}
      />
      <TextInput
        placeholder="Senha"
        placeholderTextColor={colors.textSecondary}
        secureTextEntry
        onFocus={() => setPasswordFocused(true)}
        onBlur={() => setPasswordFocused(false)}
        onChangeText={setPassword}
        value={password}
        style={{
          borderWidth: 2,
          borderColor: passwordFocused ? colors.primary : colors.border,
          borderRadius: 999,
          paddingHorizontal: 16,
          paddingVertical: 16,
          marginBottom: 16,
          backgroundColor: colors.card,
          color: colors.text,
        }}
        editable={!loading}
      />
      <TouchableOpacity
        onPress={handleSignIn}
        style={{
          backgroundColor: colors.primary,
          padding: 16,
          borderRadius: 999,
          marginBottom: 80,
        }}
        disabled={loading || !email || !password}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text
            style={{
              color: "#fff",
              fontWeight: "bold",
              textAlign: "center",
              fontSize: 18,
            }}
          >
            Entrar
          </Text>
        )}
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => onClose()}
        style={{
          borderWidth: 1,
          borderColor: colors.primary,
          alignItems: "center",
          justifyContent: "center",
          paddingVertical: 16,
          borderRadius: 999,
        }}
        disabled={loading}
      >
        <Text
          style={{
            color: colors.primary,
            fontWeight: "bold",
            textAlign: "center",
            fontSize: 18,
          }}
        >
          Cancelar
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export const useAutoLogin = () => {
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAndAutoLogin = async () => {
      try {
        const credentialsJson = await AsyncStorage.getItem("userCredentials");
        if (!credentialsJson) {
          setIsChecking(false);
          return;
        }

        const { email, password } = JSON.parse(credentialsJson);

        const netInfoState = await NetInfo.fetch();
        if (!netInfoState.isConnected) {
          Alert.alert(
            "Sem Internet",
            "Você está offline. Faça login manualmente quando voltar a conectar.",
            [{ text: "OK" }]
          );
          setIsChecking(false);
          return;
        }

        await signInWithEmailAndPassword(auth, email, password);
        console.log("Auto-login realizado com sucesso!");
        router.replace("/(tabs)/dashboard");
      } catch (error) {
        console.error("Erro no auto-login:", error);
        await AsyncStorage.removeItem("userCredentials");
        Alert.alert("Sessão Expirada", "Faça login novamente.");
      } finally {
        setIsChecking(false);
      }
    };

    checkAndAutoLogin();
  }, []);

  return { isChecking };
};

export default Auth;
