import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "@/src/database/firebaseConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";

type Props = {
  onClose: () => void;
};

const Auth = ({ onClose }: Props) => {
  const [email, setEmail] = useState("");
  const [emailFocused, setEmailFocused] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [loading, setLoading] = useState(false);

  // Função para salvar credenciais no AsyncStorage após login bem-sucedido
  const saveCredentials = async (email: string, password: string) => {
    try {
      await AsyncStorage.setItem(
        "userCredentials",
        JSON.stringify({ email, password })
      );
      console.log("Credenciais salvas com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar credenciais:", error);
    }
  };

  // Função para limpar credenciais (logout)
  const clearCredentials = async () => {
    try {
      await AsyncStorage.removeItem("userCredentials");
      console.log("Credenciais removidas!");
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
      const user = userCredential.user;

      // Salva as credenciais localmente
      await saveCredentials(email, password);

      Alert.alert("Muito bom ter você de volta, aproveite as compras!");
      router.push("/dashboard");
      onClose();
    } catch (error: any) {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.error("Erro ao autenticar usuário:", errorCode, errorMessage);

      // Mensagens amigáveis para erros comuns
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
      router.push("/login"); // Ou onde for a tela de login (ajusta se precisar)
    } catch (error) {
      console.error("Erro no logout:", error);
      Alert.alert("Erro", "Falha no logout. Tente novamente.");
    }
  }

  return (
    <View>
      <TextInput
        placeholder="E-mail"
        keyboardType="email-address"
        onFocus={() => setEmailFocused(true)}
        onBlur={() => setEmailFocused(false)}
        onChangeText={setEmail}
        value={email}
        className={`border-2 ${
          emailFocused ? "border-purple-700" : "border-gray-300"
        } rounded-full px-4 py-4 mb-4 bg-gray-100`}
        editable={!loading}
      />
      <TextInput
        placeholder="Senha"
        secureTextEntry
        onFocus={() => setPasswordFocused(true)}
        onBlur={() => setPasswordFocused(false)}
        onChangeText={setPassword}
        value={password}
        className={`border-2 ${
          passwordFocused ? "border-purple-700" : "border-gray-300"
        } rounded-full px-4 py-4 mb-4 bg-gray-100`}
        editable={!loading}
      />
      <TouchableOpacity
        onPress={handleSignIn}
        className="bg-purple-700 p-4 rounded-full mb-20"
        disabled={loading || !email || !password}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text className="text-white font-bold text-center text-lg">
            Entrar
          </Text>
        )}
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => {
          onClose();
        }}
        className="border border-purple-700 items-center justify-center px-full py-4 rounded-full min-w-full"
        disabled={loading}
      >
        <Text className="text-purple-700 font-bold text-center text-lg">
          Cancelar
        </Text>
      </TouchableOpacity>
    </View>
  );
};

// Hook personalizado para auto-login (use na tela inicial)
export const useAutoLogin = () => {
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAndAutoLogin = async () => {
      try {
        // Verifica se tem credenciais salvas
        const credentialsJson = await AsyncStorage.getItem("userCredentials");
        if (!credentialsJson) {
          setIsChecking(false);
          return;
        }

        const { email, password } = JSON.parse(credentialsJson);

        // Verifica conexão com internet
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

        // Se online e tem creds, faz auto-login
        await signInWithEmailAndPassword(auth, email, password);
        console.log("Auto-login realizado com sucesso!");
        router.replace("/(tabs)/dashboard"); // ← Ajusta pro seu path do dashboard
      } catch (error) {
        console.error("Erro no auto-login:", error);
        // Se falhar (creds inválidas), remove e força login manual
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
