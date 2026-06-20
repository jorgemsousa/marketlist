import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  Alert,
  Image,
} from "react-native";
import { collection, query, getDocs, where } from "firebase/firestore";
import Header from "@/src/components/header";
import { auth, db } from "@/src/database/firebaseConfig";
import { router } from "expo-router";
import { useTheme } from "@/src/contexts/ThemeContext";

interface UserProps {
  email: string;
  name: string;
  image: string;
}

const Profile = () => {
  const { colors, isDark } = useTheme();
  const [userData, setUserData] = useState<UserProps | null>(null);
  const [editando, setEditando] = useState(false);

  const signOut = () => {
    auth.signOut();
    router.replace("/login");
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("email", "==", auth.currentUser?.email));
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
          const userDoc = snapshot.docs[0];
          const data = userDoc.data();
          setUserData(data as UserProps);
        } else {
          console.log("Nenhum usuário encontrado");
        }
      } catch (err) {
        console.error("Erro ao buscar usuário:", err);
      }
    };

    fetchUser();
  }, []);

  const salvarPerfil = () => {
    setEditando(false);
    Alert.alert("Sucesso", "Perfil atualizado com sucesso!");
  };

  return (
    <>
      <Header title="Perfil" signOut={signOut} />
      <View style={{ flex: 1, padding: 16, backgroundColor: colors.background }}>
        <View style={{ alignItems: "center", marginBottom: 64 }}>
          {editando ? (
            <>
              <TextInput
                placeholder="Nome"
                placeholderTextColor={colors.textSecondary}
                value={userData?.name || ""}
                onChangeText={(text) =>
                  setUserData((prev) =>
                    prev
                      ? { ...prev, name: text }
                      : { email: "", image: "", name: text }
                  )
                }
                style={{
                  borderWidth: 2,
                  borderColor: colors.border,
                  borderRadius: 999,
                  padding: 16,
                  marginTop: 32,
                  backgroundColor: colors.card,
                  color: colors.text,
                  width: "100%",
                }}
              />
              <TextInput
                placeholder="E-mail"
                placeholderTextColor={colors.textSecondary}
                value={userData?.email}
                onChangeText={(text) =>
                  setUserData((prev) =>
                    prev
                      ? { ...prev, email: text }
                      : { email: text, image: "", name: "" }
                  )
                }
                style={{
                  borderWidth: 2,
                  borderColor: colors.border,
                  borderRadius: 999,
                  padding: 16,
                  marginTop: 16,
                  backgroundColor: colors.card,
                  color: colors.text,
                  width: "100%",
                }}
              />
            </>
          ) : (
            <View
              style={{
                width: "100%",
                alignItems: "center",
                backgroundColor: colors.primary,
                paddingBottom: 32,
                paddingTop: 64,
                borderRadius: 16,
                marginTop: 64,
              }}
            >
              <Image
                source={{ uri: userData?.image || "User" }}
                style={{
                  width: 140,
                  height: 140,
                  borderRadius: 70,
                  borderWidth: 3,
                  borderColor: "#cccccc",
                  marginBottom: 4,
                }}
              />
              <Text
                style={{
                  fontSize: 24,
                  fontWeight: "bold",
                  color: "#fff",
                  marginTop: 16,
                }}
              >
                {userData?.name}
              </Text>
              <Text style={{ fontSize: 18, color: "#D8B4FE" }}>
                {userData?.email}
              </Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          onPress={editando ? salvarPerfil : () => setEditando(true)}
          style={{
            backgroundColor: colors.primary,
            padding: 12,
            borderRadius: 999,
            alignItems: "center",
            marginBottom: 16,
            marginTop: 32,
          }}
        >
          <Text style={{ color: "#fff", fontSize: 20, fontWeight: "bold" }}>
            {editando ? "Salvar Perfil" : "Editar Perfil"}
          </Text>
        </TouchableOpacity>

        {editando && (
          <TouchableOpacity
            onPress={() => setEditando(false)}
            style={{
              borderWidth: 1,
              borderColor: colors.primary,
              alignItems: "center",
              justifyContent: "center",
              paddingVertical: 16,
              borderRadius: 999,
              marginVertical: 8,
            }}
          >
            <Text
              style={{
                color: isDark ? colors.textSecondary : "#71717a",
                fontSize: 20,
                fontWeight: "600",
              }}
            >
              Cancelar
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </>
  );
};

export default Profile;
