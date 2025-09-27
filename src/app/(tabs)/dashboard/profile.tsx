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
import { collection, query, getDocs, where, limit } from "firebase/firestore";
import Header from "@/src/components/header";
import { auth, db } from "@/src/database/firebaseConfig";
import { router } from "expo-router";

interface UserProps {
  email: string,
  name: string,
  image: string,
}

const Profile = () => {
  const [userData, setUserData] = useState<UserProps | null>(null);
  const [editando, setEditando] = useState(false);
  
  const signOut = () => {
    auth.signOut();
    router.replace('/login');
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

          setUserData(data as UserProps)

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
      <View className="flex-1 p-4 bg-white">
        <View className="items-center mb-16">
        
          {editando ? (
            <>
              <TextInput
                placeholder="Nome"
                value={userData?.name || ""}
                onChangeText={(text) =>
                  setUserData((prev) => prev ? { ...prev, name: text } : { email: "", image: "", password: "", name: text })
                }
                className="border-2 border-gray-300 rounded-full p-4 mt-8 bg-gray-100 w-full"
              />
              <TextInput
                placeholder="E-mail"
                value={userData?.email}
                onChangeText={(text) =>
                  setUserData((prev) => prev ? { ...prev, email: text } : { email: text, image: "", password: "", name: "" })
                }
                className="border-2 border-gray-300 rounded-full p-4 mt-4 bg-gray-100 w-full"
              />
            </>
          ) : (
            <View className="w-full items-center bg-purple-700 pb-8 pt-16 rounded-2xl mt-16">
              <Image
                source={{ uri: userData?.image || 'User' }}
                style={{ width: 140, height: 140, borderRadius: 70, borderWidth: 3, borderColor: "#cccccc", marginBottom: 4 }}
              />
              <Text className="text-2xl font-bold text-white mt-4">{userData?.name}</Text>
              <Text className="text-lg text-purple-200">{userData?.email}</Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          onPress={editando ? salvarPerfil : () => setEditando(true)}
          className="bg-purple-700 p-3 rounded-full items-center mb-4 mt-8"
        >
          <Text className="text-white text-xl font-bold">
            {editando ? "Salvar Perfil" : "Editar Perfil"}
          </Text>
        </TouchableOpacity>

        {editando && (
          <TouchableOpacity
            onPress={() => setEditando(false)}
            className='border border-purple-700 items-center justify-center px-full py-4 rounded-full min-w-full my-2'
          >
            <Text className="text-zinc-500 text-xl font-semibold">
              Cancelar
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </>
  );
};

export default Profile;
