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
import { useTheme } from "@/src/contexts/ThemeContext";

interface List {
  id: string;
  name: string;
  total_value: number;
  status: string;
}

const Orders: React.FC = () => {
  const { colors, isDark } = useTheme();
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
      const docRef = await addDoc(collection(db, "lists"), {
        name: novaListaNome.trim(),
        total_value: 0,
        uid: auth.currentUser?.uid,
        status: "open",
        created_at: serverTimestamp(),
      });

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
    } catch (err) {
      console.error("Erro ao criar lista:", err);
      Alert.alert("Erro", "Não foi possível criar a lista.");
    }
  };

  return (
    <>
      <Header title="Listas de Compras" signOut={signOut} />
      <Container>
        <SafeAreaView
          style={{ flex: 1, backgroundColor: colors.background }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 16,
            }}
          >
            <Text
              style={{
                color: colors.primary,
                fontWeight: "bold",
                fontSize: 20,
              }}
            >
              Listas Abertas
            </Text>
          </View>

          <View style={{ marginBottom: 16 }}>
            <TextInput
              placeholder="Nome da nova lista"
              placeholderTextColor={colors.textSecondary}
              value={novaListaNome}
              onChangeText={setNovaListaNome}
              style={{
                borderWidth: 2,
                borderColor: colors.border,
                borderRadius: 999,
                paddingHorizontal: 16,
                paddingVertical: 8,
                backgroundColor: colors.card,
                color: colors.text,
              }}
            />
            <TouchableOpacity
              onPress={adicionarLista}
              style={{
                backgroundColor: colors.primary,
                marginTop: 12,
                padding: 12,
                borderRadius: 999,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "bold" }}>
                Criar Lista
              </Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={listas}
            keyExtractor={(item) => item.id}
            ListEmptyComponent={
              <View style={{ marginTop: 32, alignItems: "center" }}>
                <Text style={{ color: colors.textSecondary }}>
                  Nenhuma lista aberta
                </Text>
              </View>
            }
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => router.push(`/list/${item.id}`)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: 16,
                  borderRadius: 12,
                  backgroundColor: colors.card,
                  marginBottom: 12,
                }}
              >
                <View>
                  <Text
                    style={{
                      fontSize: 16,
                      color: colors.primary,
                      fontWeight: "600",
                    }}
                  >
                    {item.name}
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      color: isDark ? colors.textSecondary : "#A855F7",
                    }}
                  >
                    R$ {item.total_value?.toFixed(2)}
                  </Text>
                </View>

                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={colors.primary}
                />
              </TouchableOpacity>
            )}
          />
        </SafeAreaView>
      </Container>
    </>
  );
};

export default Orders;
