import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  FlatList,
  Platform,
  Image,
  Alert,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { db } from "@/src/database/firebaseConfig";
import {
  doc,
  updateDoc,
  collection,
  addDoc,
  onSnapshot,
  getDocs,
} from "firebase/firestore";
import Header from "@/src/components/header";
import Container from "@/src/components/container";

interface Product {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

export default function ListScreen() {
  const { id } = useLocalSearchParams(); // ID da lista
  const [listName, setListName] = useState("");
  const [status, setStatus] = useState("open");
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);

  // Modal
  const [modalVisible, setModalVisible] = useState(false);

  // Produtos disponíveis no cadastro
  const [availableProducts, setAvailableProducts] = useState<
    { id: string; name: string; imageUrl?: string }[]
  >([]);

  // Inputs locais por produto (strings)
  const [priceInputs, setPriceInputs] = useState<Record<string, string>>({});
  const [qtyInputs, setQtyInputs] = useState<Record<string, string>>({});

  // Buscar lista e produtos já adicionados
  useEffect(() => {
    if (!id) return;

    const unsubList = onSnapshot(doc(db, "lists", id as string), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setListName(data.name);
        setStatus(data.status);
      }
    });

    // escuta produtos da subcoleção
    const productsRef = collection(db, "lists", id as string, "products");
    const unsubProducts = onSnapshot(productsRef, (snapshot) => {
      const items = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as any),
      })) as Product[];

      setProducts(items);

      // inicializa inputs locais
      const newPriceMap: Record<string, string> = {};
      const newQtyMap: Record<string, string> = {};
      items.forEach((it) => {
        newPriceMap[it.id] = (it.price ?? 0).toString();
        newQtyMap[it.id] = (it.quantity ?? 1).toString();
      });
      setPriceInputs(newPriceMap);
      setQtyInputs(newQtyMap);
    });

    return () => {
      unsubList();
      unsubProducts();
    };
  }, [id]);

  // Buscar todos os produtos cadastrados
  useEffect(() => {
    const fetchProducts = async () => {
      const snap = await getDocs(collection(db, "products"));
      const items = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as any),
      }));
      setAvailableProducts(
        items.map((it: any) => ({
          id: it.id,
          name: it.name || it.product_name || "Sem nome",
          imageUrl: it.imageUrl || null,
        }))
      );
    };
    fetchProducts();
  }, []);

  // Calcular total
  useEffect(() => {
    const totalValue = products.reduce(
      (sum, p) => sum + (Number(p.quantity) || 0) * (Number(p.price) || 0),
      0
    );
    setTotal(totalValue);
  }, [products]);

  const normalizeNumberString = (text: string | undefined) => {
    if (!text) return "";
    const cleaned = text.replace(/[^0-9.,]/g, "");
    return cleaned.replace(/,/g, ".");
  };

  // Atualizar produto no Firestore
  const handleSaveProduct = async (productId: string) => {
    if (!id) return;
    const rawQty = qtyInputs[productId] ?? "0";
    const rawPrice = priceInputs[productId] ?? "0";

    const qty = parseInt(normalizeNumberString(rawQty)) || 0;
    const price = parseFloat(normalizeNumberString(rawPrice)) || 0;

    try {
      const productRef = doc(db, "lists", id as string, "products", productId);
      await updateDoc(productRef, { quantity: qty, price: price });
    } catch (err) {
      console.error("Erro ao salvar produto:", err);
    }
  };

  // Adicionar produto escolhido
  const handleSelectProduct = async (product: {
    id: string;
    name: string;
    imageUrl?: string;
  }) => {
    if (!id) return;
    try {
      const productRef = collection(db, "lists", id as string, "products");
      await addDoc(productRef, {
        name: product.name,
        quantity: 1,
        price: 0,
        imageUrl: product.imageUrl || null,
      });
      setModalVisible(false);
    } catch (err) {
      console.error("Erro ao adicionar produto:", err);
    }
  };

  const handleFinalizeList = async () => {
    try {
      if (!id) return;

      const docRef = doc(db, "lists", id as string);
      await updateDoc(docRef, {
        status: "finalizada",
        total,
        items: products,
        updatedAt: new Date(),
      });

      Alert.alert("✅ Sucesso", "Lista finalizada com sucesso!");
      router.push("/(tabs)/dashboard"); // volta para dashboard
    } catch (error) {
      console.error("Erro ao finalizar lista:", error);
      Alert.alert("❌ Erro", "Não foi possível finalizar a lista.");
    }
  };

  return (
    <>
      <Header title={listName} />
      <Container>
        <View className="flex-1 bg-white p-2">
        {/* FAB - Finalizar */}
        <TouchableOpacity
            onPress={handleFinalizeList}
            className="absolute bg-purple-700 px-3 py-1 rounded-md">
            <Text className="text-white text-sm">Finalizar compras</Text>
        </TouchableOpacity>
          {/* Cabeçalho */}
          <View className="flex-row justify-between items-center mt-8 mb-4">
                <Text className="text-base font-bold text-purple-700">{listName}</Text>
            <Text className="text-base font-semibold">
              Total: R$ {total.toFixed(2)}
            </Text>
          </View>

          {/* Lista de produtos */}
          <ScrollView className="flex-1">
            {products.map((p) => (
              <View
                key={p.id}
                className="flex-col bg-zinc-100 p-2 rounded-xl mb-3"
              >
                <View className="flex-row justify-between items-center">
                    
                  <Text className="text-purple-700 text-sm">{p.name}</Text>                  
                

                <View className="flex-row items-center just mt-2">
                  <TextInput
                    className="py-1 text-center w-12 mr-2 rounded-md bg-zinc-200"
                    keyboardType="numeric"
                    value={qtyInputs[p.id]}
                    onChangeText={(text) =>
                      setQtyInputs((prev) => ({
                        ...prev,
                        [p.id]: text.replace(/[^0-9]/g, ""),
                      }))
                    }
                  />
                  <TextInput
                    className="py-1 text-center w-20 mr-2 rounded-md bg-zinc-200"
                    keyboardType={Platform.OS === "ios" ? "decimal-pad" : "numeric"}
                    value={priceInputs[p.id]}
                    onChangeText={(text) =>
                      setPriceInputs((prev) => ({
                        ...prev,
                        [p.id]: text.replace(/[^0-9.,]/g, ""),
                      }))
                    }
                  />
                  <TouchableOpacity
                    className="bg-purple-700 px-3 py-1 rounded-md"
                    onPress={() => handleSaveProduct(p.id)}
                  >
                    <Text className="text-white text-sm">Salvar</Text>
                  </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>           

          {/* Botão abrir modal */}
          <TouchableOpacity
            className="bg-purple-700 rounded-full items-center mt-4 p-3"
            onPress={() => setModalVisible(true)}
          >
            <Text className="text-white font-bold text-xl">Adicionar Produto</Text>
          </TouchableOpacity>

          {/* Modal de seleção */}
          <Modal visible={modalVisible} transparent animationType="slide">
            <View className="flex-1 justify-center items-center bg-black/50">
              <View className="bg-white p-4 rounded-2xl w-11/12 max-h-[80%]">
                <Text className="text-lg font-bold mb-4 text-purple-700">
                  Selecione um Produto
                </Text>

                <FlatList
                  data={availableProducts}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      className="flex-row items-center p-3 border-b border-gray-200"
                      onPress={() => handleSelectProduct(item)}
                    >
                      {item.imageUrl && (
                        <Image
                          source={{ uri: item.imageUrl }}
                          className="w-10 h-10 rounded-md mr-3"
                        />
                      )}
                      <Text className="text-purple-700">{item.name}</Text>
                    </TouchableOpacity>
                  )}
                  style={{ maxHeight: 320 }}
                />

                <TouchableOpacity
                  className="bg-gray-400 px-4 py-2 rounded-md mt-4"
                  onPress={() => setModalVisible(false)}
                >
                  <Text className="text-white text-center">Fechar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </View>
      </Container>
    </>
  );
}
