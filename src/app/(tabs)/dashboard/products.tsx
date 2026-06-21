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
import { useTheme } from "@/src/contexts/ThemeContext";

interface Product {
  id: string;
  name: string;
  imageUrl: string;
  type: string;
  ean?: string;
  brand?: string;
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
  const { colors, isDark } = useTheme();
  const [products, setProducts] = useState<Product[]>([]);
  const [newProductName, setNewProductName] = useState("");
  const [newProductImageUrl, setNewProductImageUrl] = useState("");
  const [newProductType, setNewProductType] = useState("");
  const [newProductEan, setNewProductEan] = useState("");
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
        ean: newProductEan || "",
        brand: "",
      });

      const newProduct: Product = {
        id: docRef.id,
        name: newProductName,
        imageUrl: newProductImageUrl,
        type: newProductType,
        ean: newProductEan || "",
      };

      setProducts([...products, newProduct]);

      const categories = Array.from(new Set([...productTypes, newProductType]));
      setProductTypes(categories);

      setNewProductName("");
      setNewProductImageUrl("");
      setNewProductType("");
      setNewProductEan("");
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
      <View key={type} style={{ marginBottom: 24, padding: 16 }}>
        <Text
          style={{
            fontSize: 24,
            fontWeight: "bold",
            marginBottom: 8,
            color: isDark ? colors.textSecondary : "#52525b",
          }}
        >
          {type}
        </Text>
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
              <Text
                style={{
                  textAlign: "center",
                  marginTop: 8,
                  color: isDark ? colors.textSecondary : "#71717a",
                }}
              >
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
      <SafeAreaView
        style={{ flex: 1, padding: 16, backgroundColor: colors.background }}
      >
        <View
          style={{
            padding: 16,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 16,
          }}
        >
          <Text
            style={{
              fontSize: 20,
              fontWeight: "bold",
              color: colors.primary,
            }}
          >
            Produtos por categoria
          </Text>
          <TouchableOpacity
            onPress={() => setIsAdding(true)}
            style={{
              backgroundColor: colors.primary,
              padding: 8,
              borderRadius: 8,
            }}
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
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: colors.overlay,
              padding: 16,
            }}
          >
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              style={{ width: "100%" }}
            >
              <ScrollView
                contentContainerStyle={{
                  backgroundColor: colors.white,
                  borderRadius: 24,
                  padding: 20,
                }}
              >
                <TextInput
                  placeholder="Nome do produto"
                  placeholderTextColor={colors.textSecondary}
                  value={newProductName}
                  onChangeText={setNewProductName}
                  style={{
                    borderWidth: 2,
                    borderColor: colors.primary,
                    borderRadius: 999,
                    padding: 16,
                    marginBottom: 16,
                    backgroundColor: colors.card,
                    color: colors.text,
                  }}
                />
                <TextInput
                  placeholder="URL da imagem"
                  placeholderTextColor={colors.textSecondary}
                  value={newProductImageUrl}
                  onChangeText={setNewProductImageUrl}
                  style={{
                    borderWidth: 2,
                    borderColor: colors.primary,
                    borderRadius: 999,
                    padding: 16,
                    marginBottom: 16,
                    backgroundColor: colors.card,
                    color: colors.text,
                  }}
                />
                <TextInput
                  placeholder="Código de barras (EAN) — opcional"
                  placeholderTextColor={colors.textSecondary}
                  value={newProductEan}
                  onChangeText={setNewProductEan}
                  keyboardType="number-pad"
                  style={{
                    borderWidth: 2,
                    borderColor: colors.primary,
                    borderRadius: 999,
                    padding: 16,
                    marginBottom: 16,
                    backgroundColor: colors.card,
                    color: colors.text,
                  }}
                />
                <SelectSetor
                  value={newProductType}
                  onChange={setNewProductType}
                />

                <TouchableOpacity
                  onPress={addProduct}
                  style={{
                    backgroundColor: colors.primary,
                    padding: 12,
                    borderRadius: 999,
                    alignItems: "center",
                    marginBottom: 8,
                    marginTop: 16,
                  }}
                >
                  <Text style={{ color: "#fff", fontSize: 20, fontWeight: "bold" }}>
                    Adicionar Produto
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setIsAdding(false)}
                  style={{
                    borderWidth: 1,
                    borderColor: colors.primary,
                    alignItems: "center",
                    justifyContent: "center",
                    paddingVertical: 16,
                    borderRadius: 999,
                  }}
                >
                  <Text
                    style={{
                      color: colors.primary,
                      fontSize: 20,
                      fontWeight: "bold",
                    }}
                  >
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
