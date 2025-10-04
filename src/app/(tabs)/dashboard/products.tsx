import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  View,
  FlatList,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Header from "@/src/components/header";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { auth, db } from "@/src/database/firebaseConfig";
import { router } from "expo-router";
import SelectSetor from "@/src/components/picker";

interface Product {
  id: string;
  name: string;
  imageUrl: string;
  type: string;
}

const setores = [
  "Açougue",
  "Frios e Laticínios",
  "Hortifrúti",
  "Padaria",
  "Mercearia",
  "Adega e Bebidas",
  "Higiene Pessoal e Beleza",
  "Limpeza Doméstica",
  "Rotisseria",
  "Pescados/Peixaria",
  "Bazar",
];

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [newProductName, setNewProductName] = useState("");
  const [newProductImageUrl, setNewProductImageUrl] = useState("");
  const [newProductType, setNewProductType] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [productTypes, setProductTypes] = useState<string[]>([]);

  const fetchProducts = async () => {
    const snapshot = await getDocs(collection(db, "products"));
    const data: Product[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      name: doc.data().name,
      imageUrl: doc.data().imageUrl,
      type: doc.data().type,
    }));
    setProducts(data);

    const categories = Array.from(new Set(data.map((p) => p.type)));
    setProductTypes(categories);
  };

  const signOut = () => {
    auth.signOut();
    router.replace("/login");
  };

  const fallbackImage = require("../../../../assets/images/icon.png");
  useEffect(() => {
    fetchProducts();
  }, []);

  const addProduct = async () => {
    if (!newProductName || !newProductImageUrl || !newProductType) {
      Alert.alert("Erro", "Por favor, preencha todos os campos.");
      return;
    }

    try {
      const docRef = await addDoc(collection(db, "products"), {
        name: newProductName,
        imageUrl: newProductImageUrl,
        type: newProductType,
      });

      const newProduct: Product = {
        id: docRef.id,
        name: newProductName,
        imageUrl: newProductImageUrl,
        type: newProductType,
      };

      setProducts([...products, newProduct]);

      const categories = Array.from(new Set([...productTypes, newProductType]));
      setProductTypes(categories);

      setNewProductName("");
      setNewProductImageUrl("");
      setNewProductType("");
      setIsAdding(false);

      Alert.alert("Sucesso", "Produto adicionado com sucesso!");
    } catch (err) {
      console.error(err);
      Alert.alert("Erro", "Não foi possível adicionar o produto.");
    }
  };

  const renderSection = (type: string) => {
    const sectionProducts = products.filter((p) => p.type === type);
    if (sectionProducts.length === 0) return null;

    return (
      <View key={type} className="mb-6 p-4">
        <Text className="text-2xl font-bold mb-2 text-zinc-600">{type}</Text>
        <FlatList
          data={sectionProducts}
          horizontal
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={{ marginRight: 16, alignItems: "center" }}>
              <Image
                source={!item.imageUrl ? fallbackImage : { uri: item.imageUrl }}
                style={{ width: 100, height: 100, borderRadius: 8 }}
              />
              <Text className="text-center mt-2 text-zinc-500">
                {item.name}
              </Text>
            </View>
          )}
        />
      </View>
    );
  };

  return (
    <>
      <Header title="Produtos" signOut={signOut} />
      <SafeAreaView className="flex-1 p-4 bg-white">
        <View className="p-4 flex-row items-center justify-between mb-4">
          <Text className="text-xl font-bold text-purple-700">
            Produtos por categoria
          </Text>
          <TouchableOpacity
            onPress={() => setIsAdding(true)}
            className="bg-purple-700 p-2 rounded-lg"
          >
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <FlatList
          data={productTypes}
          keyExtractor={(item) => item}
          renderItem={({ item }) => renderSection(item)}
          showsVerticalScrollIndicator={false}
        />

        <Modal
          animationType="slide"
          transparent
          visible={isAdding}
          onRequestClose={() => setIsAdding(false)}
        >
          <View className="flex-1 justify-center items-center bg-black/50 p-4">
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              className="w-full"
            >
              <ScrollView
                contentContainerStyle={{
                  backgroundColor: "white",
                  borderRadius: 24,
                  padding: 20,
                }}
              >
                <TextInput
                  placeholder="Nome do produto"
                  value={newProductName}
                  onChangeText={setNewProductName}
                  className="border-2 border-purple-700 rounded-full p-4 mb-4 bg-gray-100"
                />
                <TextInput
                  placeholder="URL da imagem"
                  value={newProductImageUrl}
                  onChangeText={setNewProductImageUrl}
                  className="border-2 border-purple-700 rounded-full p-4 mb-4 bg-gray-100"
                />
                <SelectSetor
                  value={newProductType}
                  onChange={setNewProductType}
                />

                <TouchableOpacity
                  onPress={addProduct}
                  className="bg-purple-700 p-3 rounded-full items-center mb-2 mt-4"
                >
                  <Text className="text-white text-xl font-bold">
                    Adicionar Produto
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setIsAdding(false)}
                  className="border border-purple-700 items-center justify-center px-full py-4 rounded-full min-w-full"
                >
                  <Text className="border-purple-700 text-xl text-purple-700 font-bold">
                    Cancelar
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            </KeyboardAvoidingView>
          </View>
        </Modal>
      </SafeAreaView>
    </>
  );
};

export default Products;
