// app/(tabs)/orders.tsx
import React, { useEffect, useState } from "react";
import {
  FlatList,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { db, auth } from "@/src/database/firebaseConfig";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import Container from "@/src/components/container";
import Header from "@/src/components/header";

interface List {
  id: string;
  name: string;
  total_value: number;
  status: string;
}

const Orders: React.FC = () => {
  const [listas, setListas] = useState<List[]>([]);
  const [novaListaNome, setNovaListaNome] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const fetchListas = async () => {
    try {
      setLoading(true);
      const q = query(
        collection(db, "lists"),
        where("status", "==", "open"),
        where("uid", "==", auth.currentUser?.uid)
      );
      const snap = await getDocs(q);
      const data: List[] = snap.docs.map((d) => ({
        id: d.id,
        name: d.data().name,
        total_value: d.data().total_value ?? 0,
        status: d.data().status ?? "open",
      }));
      setListas(data);
    } catch (err) {
      console.error("Erro ao buscar listas:", err);
      Alert.alert("Erro", "Não foi possível carregar as listas.");
    } finally {
      setLoading(false);
    }
  };

  const signOut = () => {
    auth.signOut();
    router.replace("/login");
  };

  useEffect(() => {
    fetchListas();
  }, []);

  const adicionarLista = async () => {
    if (!novaListaNome.trim()) {
      Alert.alert("Erro", "Informe o nome da lista.");
      return;
    }

    try {
      // cria no Firestore
      const docRef = await addDoc(collection(db, "lists"), {
        name: novaListaNome.trim(),
        total_value: 0,
        uid: auth.currentUser?.uid,
        status: "open",
        created_at: serverTimestamp(),
      });

      // atualiza estado localmente para refletir imediatamente
      setListas((prev) => [
        {
          id: docRef.id,
          name: novaListaNome.trim(),
          total_value: 0,
          status: "open",
        },
        ...prev,
      ]);

      setNovaListaNome("");
      Alert.alert("Sucesso", "Lista criada com sucesso!");
      // opcional: navegar direto para a lista criada:
      // router.push(`/list/${docRef.id}`);
    } catch (err) {
      console.error("Erro ao criar lista:", err);
      Alert.alert("Erro", "Não foi possível criar a lista.");
    }
  };

  return (
    <>
      <Header title="Listas de Compras" signOut={signOut} />
      <Container>
        <SafeAreaView className="flex-1 x-4 bg-white">
          {/* Cabeçalho + botão de criar */}
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-purple-700 font-bold text-xl">
              Listas Abertas
            </Text>
          </View>

          {/* Input para nova lista + botão */}
          <View className="mb-4">
            <TextInput
              placeholder="Nome da nova lista"
              value={novaListaNome}
              onChangeText={setNovaListaNome}
              className="border-2 border-gray-300 rounded-full px-4 py-2 bg-gray-100"
            />
            <TouchableOpacity
              onPress={adicionarLista}
              className="bg-purple-700 mt-3 p-3 rounded-full items-center"
            >
              <Text className="text-white font-bold">Criar Lista</Text>
            </TouchableOpacity>
          </View>

          {/* Lista de listas abertas */}
          <FlatList
            data={listas}
            keyExtractor={(item) => item.id}
            ListEmptyComponent={
              <View className="mt-8 items-center">
                <Text className="text-gray-400">Nenhuma lista aberta</Text>
              </View>
            }
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => router.push(`/list/${item.id}`)}
                className="flex-row items-center justify-between p-4 rounded-xl bg-zinc-100 mb-3"
              >
                <View>
                  <Text className="text-md text-purple-600 font-semibold">
                    {item.name}
                  </Text>
                  <Text className="text-sm text-purple-400">
                    R$ {item.total_value?.toFixed(2)}
                  </Text>
                </View>

                <Ionicons name="chevron-forward" size={20} color="#9333ea" />
              </TouchableOpacity>
            )}
          />
        </SafeAreaView>
      </Container>
    </>
  );
};

export default Orders;
