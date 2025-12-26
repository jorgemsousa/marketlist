import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  SectionList,
  Platform,
  Image,
  Alert,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { auth, db } from "@/src/database/firebaseConfig";
import {
  doc,
  updateDoc,
  collection,
  addDoc,
  onSnapshot,
  getDocs,
  deleteDoc,
} from "firebase/firestore";
import Header from "@/src/components/header";
import Container from "@/src/components/container";

interface Product {
  id: string;
  name: string;
  quantity: number;
  price: number;
  stock?: number | null;
  imageUrl?: string;
  type: string;
}

export default function ListScreen() {
  const { id } = useLocalSearchParams();
  const [listName, setListName] = useState("");
  const [status, setStatus] = useState("open");
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [availableProducts, setAvailableProducts] = useState<
    { id: string; name: string; imageUrl?: string; type: string }[]
  >([]);
  const [priceInputs, setPriceInputs] = useState<Record<string, string>>({});
  const [qtyInputs, setQtyInputs] = useState<Record<string, string>>({});
  const [stockInputs, setStockInputs] = useState<Record<string, string>>({});
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  const signOut = () => {
    auth.signOut();
    router.replace("/login");
  };

  useEffect(() => {
    if (!id) return;
    const unsubList = onSnapshot(doc(db, "lists", id as string), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setListName(data.name);
        setStatus(data.status);
      }
    });
    const itemsRef = collection(db, "lists", id as string, "items");
    const unsubItems = onSnapshot(itemsRef, (snapshot) => {
      let items = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as any),
      })) as Product[];
      items = [...items].sort((a, b) => {
        if (a.done && !b.done) return 1;
        if (!a.done && b.done) return -1;
        return 0;
      });
      setProducts(items);
      const newPriceMap: Record<string, string> = {};
      const newQtyMap: Record<string, string> = {};
      const newStockMap: Record<string, string> = {};
      items.forEach((it) => {
        newPriceMap[it.id] = (it.price ?? 0).toString();
        newQtyMap[it.id] = (it.quantity ?? 1).toString();
        newStockMap[it.id] = it.stock != null ? it.stock.toString() : "";
      });
      setPriceInputs(newPriceMap);
      setQtyInputs(newQtyMap);
      setStockInputs(newStockMap);
    });
    return () => {
      unsubList();
      unsubItems();
    };
  }, [id]);

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
          type: it.type || "Sem categoria",
        }))
      );
    };
    fetchProducts();
  }, []);

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

  const handleSaveProduct = async (productId: string) => {
    if (!id) return;
    const rawQty = qtyInputs[productId] ?? "0";
    const rawPrice = priceInputs[productId] ?? "0";
    const rawStock = stockInputs[productId] ?? "0";
    const qty = parseInt(normalizeNumberString(rawQty)) || 0;
    const price = parseFloat(normalizeNumberString(rawPrice)) || 0;
    const stock = rawStock
      ? parseInt(normalizeNumberString(rawStock)) || null
      : null;
    try {
      const productRef = doc(db, "lists", id as string, "items", productId);
      await updateDoc(productRef, {
        quantity: qty,
        price: price,
        stock: stock,
        done: true,
      });
    } catch (err) {
      console.error("Erro ao salvar produto:", err);
    }
  };

  const handleAddProducts = async (productIds: string[]) => {
    if (!id || productIds.length === 0) return;
    try {
      const itemsRef = collection(db, "lists", id as string, "items");
      const selectedItems = availableProducts.filter((p) =>
        productIds.includes(p.id)
      );
      for (const product of selectedItems) {
        await addDoc(itemsRef, {
          name: product.name,
          quantity: 1,
          price: 0,
          stock: null,
          imageUrl: product.imageUrl || null,
        });
      }
      setSelectedProducts([]);
      Alert.alert(
        "Sucesso",
        `${selectedItems.length} produto(s) adicionado(s)!`
      );
    } catch (err) {
      console.error("Erro ao adicionar produtos:", err);
      Alert.alert("Erro", "Não foi possível adicionar os produtos.");
    }
  };

  const handleRemoveProduct = (productId: string) => {
    if (!id) return;
    Alert.alert(
      "Remover item",
      "Tem certeza que deseja remover este item da lista?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Remover",
          style: "destructive",
          onPress: async () => {
            try {
              const productRef = doc(
                db,
                "lists",
                id as string,
                "items",
                productId
              );
              await deleteDoc(productRef);
            } catch (err) {
              console.error("Erro ao remover produto:", err);
            }
          },
        },
      ]
    );
  };

  const handleFinalizeList = async () => {
    try {
      if (!id) return;
      const docRef = doc(db, "lists", id as string);
      await updateDoc(docRef, {
        status: "finalizada",
        total,
        updatedAt: new Date(),
      });
      Alert.alert("✅ Sucesso", "Lista finalizada com sucesso!");
      router.push("/(tabs)/dashboard");
    } catch (error) {
      console.error("Erro ao finalizar lista:", error);
      Alert.alert("❌ Erro", "Não foi possível finalizar a lista.");
    }
  };

  const openModal = () => {
    setSelectedProducts([]);
    setModalVisible(true);
  };

  const renderItem = ({
    item,
  }: {
    item: { id: string; name: string; imageUrl?: string };
  }) => {
    const isSelected = selectedProducts.includes(item.id);
    return (
      <TouchableOpacity
        className={`flex-row items-center p-3 border-b border-gray-200 ${
          isSelected ? "bg-blue-50" : ""
        }`}
        onPress={() => {
          if (isSelected) {
            setSelectedProducts((prev) => prev.filter((id) => id !== item.id));
          } else {
            setSelectedProducts((prev) => [...prev, item.id]);
          }
        }}
      >
        {item.imageUrl && (
          <Image
            source={{ uri: item.imageUrl }}
            className="w-10 h-10 rounded-md mr-3"
          />
        )}
        <View className="flex-1">
          <Text className="text-purple-700">{item.name}</Text>
        </View>
        {isSelected && <Text className="text-green-500 font-bold">✓</Text>}
      </TouchableOpacity>
    );
  };

  return (
    <>
      <Header title={listName} signOut={signOut} />
      <Container>
        <View className="flex-1 bg-white">
          <TouchableOpacity
            onPress={handleFinalizeList}
            className="absolute top-2 right-2 bg-purple-700 px-3 py-1 rounded-md"
          >
            <Text className="text-white text-sm">Finalizar compras</Text>
          </TouchableOpacity>
          <View className="flex-row justify-between items-center mt-10 mb-4">
            <Text className="text-base font-bold text-purple-700">
              {listName}
            </Text>
            <Text className="text-xl text-green-900 font-semibold">
              Total: R$ {total.toFixed(2)}
            </Text>
          </View>
          <View className="flex-row justify-between p-2 mb-2 bg-gray-200 rounded-lg">
            <Text className="text-purple-700 font-bold w-1/3 text-sm">
              Produto
            </Text>
            <View className="flex-row justify-between w-2/3 px-2">
              <Text className="text-purple-700 font-bold text-sm w-12 text-center">
                Est.
              </Text>
              <Text className="text-purple-700 font-bold text-sm w-12 text-center">
                Qtd
              </Text>
              <Text className="text-purple-700 font-bold text-sm w-20 text-center">
                Valor
              </Text>
              <View className="w-24" />
            </View>
          </View>
          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            {products.map((p) => {
              const isComplete = p.quantity > 0 && p.price > 0;
              const backgroundClass = isComplete
                ? "bg-green-300"
                : "bg-zinc-100";
              return (
                <View
                  key={p.id}
                  className={`flex-row justify-between p-2 rounded-xl mb-3 ${backgroundClass}`}
                >
                  <View className="flex-row items-center w-1/3">
                    <Text
                      className="text-purple-700 text-sm"
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {p.name}
                    </Text>
                  </View>
                  <View className="flex-row items-center mt-2 w-2/3 px-2 gap-1">
                    <TextInput
                      className="py-1 text-center w-10 rounded-md bg-zinc-200"
                      keyboardType="numeric"
                      value={stockInputs[p.id] || ""}
                      onChangeText={(text) =>
                        setStockInputs((prev) => ({
                          ...prev,
                          [p.id]: text.replace(/[^0-9]/g, ""),
                        }))
                      }
                      placeholder="0"
                    />
                    <TextInput
                      className="p-1 text-center w-10 rounded-md bg-zinc-200"
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
                      className="p-1 text-center w-16 mr-2 rounded-md bg-zinc-200"
                      keyboardType={
                        Platform.OS === "ios" ? "decimal-pad" : "numeric"
                      }
                      value={priceInputs[p.id]}
                      onChangeText={(text) =>
                        setPriceInputs((prev) => ({
                          ...prev,
                          [p.id]: text.replace(/[^0-9.,]/g, ""),
                        }))
                      }
                    />
                    <TouchableOpacity
                      className="bg-gray-100 px-3 py-1 rounded-md"
                      onPress={() => handleSaveProduct(p.id)}
                    >
                      <Text className="text-white text-lg">✅</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      className="bg-gray-100 px-3 py-1 rounded-md mx-1"
                      onPress={() => handleRemoveProduct(p.id)}
                    >
                      <Text className="text-white text-sm font-bold">🗑️</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </ScrollView>
          <TouchableOpacity
            className="bg-purple-700 rounded-full items-center mt-4 p-3"
            onPress={openModal}
          >
            <Text className="text-white font-bold text-xl">
              Adicionar Produto
            </Text>
          </TouchableOpacity>
          <Modal visible={modalVisible} transparent animationType="slide">
            <View className="flex-1 justify-center items-center bg-black/50">
              <View className="bg-white p-4 rounded-2xl w-11/12 max-h-[90%]">
                <Text className="text-lg font-bold mb-4 text-purple-700">
                  Selecione um ou mais Produtos
                </Text>
                <SectionList
                  sections={Object.values(
                    availableProducts.reduce((acc, item) => {
                      const type = item.type || "Outros";
                      if (!acc[type]) acc[type] = { title: type, data: [] };
                      acc[type].data.push(item);
                      return acc;
                    }, {} as Record<string, { title: string; data: typeof availableProducts }>)
                  )}
                  keyExtractor={(item) => item.id}
                  renderItem={renderItem}
                  renderSectionHeader={({ section: { title } }) => (
                    <Text className="text-base font-bold bg-gray-100 px-2 py-1 text-purple-700">
                      {title}
                    </Text>
                  )}
                  style={{ maxHeight: 320 }}
                />
                <View className="flex-row justify-between mt-4">
                  <TouchableOpacity
                    className={`flex-1 items-center justify-center px-4 py-2 rounded-md mr-2 ${
                      selectedProducts.length > 0
                        ? "bg-purple-700 border border-purple-700"
                        : "bg-gray-200 border border-gray-300"
                    }`}
                    onPress={() => handleAddProducts(selectedProducts)}
                    disabled={selectedProducts.length === 0}
                  >
                    <Text
                      className={`font-bold ${
                        selectedProducts.length > 0
                          ? "text-white"
                          : "text-gray-500"
                      }`}
                    >
                      Adicionar{" "}
                      {selectedProducts.length > 0
                        ? `(${selectedProducts.length})`
                        : ""}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="flex-1 border border-gray-300 items-center justify-center px-4 py-2 rounded-md ml-2 bg-gray-100"
                    onPress={() => setModalVisible(false)}
                  >
                    <Text className="text-gray-600 font-bold">Fechar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </View>
      </Container>
    </>
  );
}
