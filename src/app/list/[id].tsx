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
  ActivityIndicator,
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
import { Ionicons } from "@expo/vector-icons";
import { exportListAsHtml, shareFile } from "@/src/utils/exportList";
import { useTheme } from "@/src/contexts/ThemeContext";
import { incrementProductUsage, getMostUsedProductIds } from "@/src/hooks/useProductUsage";
import BarcodeScanner from "@/src/components/barcodeScanner";
import { lookupByEan } from "@/src/hooks/useEanLookup";

interface Product {
  id: string;
  name: string;
  quantity: number;
  price: number;
  stock: number | null;
  imageUrl: string | null;
  done?: boolean;
  type: string;
}

export default function ListScreen() {
  const { id } = useLocalSearchParams();
  const { colors, isDark } = useTheme();
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
  const [searchQuery, setSearchQuery] = useState("");
  const [scannerVisible, setScannerVisible] = useState(false);
  const [scanningLoading, setScanningLoading] = useState(false);

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
      const formatted = items.map((it: any) => ({
        id: it.id,
        name: it.name || it.product_name || "Sem nome",
        imageUrl: it.imageUrl || null,
        type: it.type || "Sem categoria",
      }));
      const mostUsedIds = await getMostUsedProductIds();
      const sorted = [...formatted].sort((a, b) => {
        const aFreq = mostUsedIds.indexOf(a.id);
        const bFreq = mostUsedIds.indexOf(b.id);
        // Se ambos são mais usados, mantém ordem do ranking
        if (aFreq !== -1 && bFreq !== -1) return aFreq - bFreq;
        // Mais usados primeiro
        if (aFreq !== -1) return -1;
        if (bFreq !== -1) return 1;
        // Ordem alfabética como fallback
        return a.name.localeCompare(b.name);
      });
      setAvailableProducts(sorted);
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
        await incrementProductUsage(product.id);
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

  const handleAddSingleProduct = async (
    product: { id: string; name: string; imageUrl?: string }
  ) => {
    if (!id) return;
    try {
      const itemsRef = collection(db, "lists", id as string, "items");
      await addDoc(itemsRef, {
        name: product.name,
        quantity: 1,
        price: 0,
        stock: null,
        imageUrl: product.imageUrl || null,
      });
      await incrementProductUsage(product.id);
      Alert.alert("✅ Produto adicionado", `${product.name} foi adicionado à lista!`);
    } catch (err) {
      console.error("Erro ao adicionar produto via scan:", err);
      Alert.alert("Erro", "Não foi possível adicionar o produto.");
    }
  };

  const handleBarCodeScanned = async (ean: string) => {
    setScannerVisible(false);
    setScanningLoading(true);
    try {
      const result = await lookupByEan(ean);
      if (result) {
        const { product, isNew } = result;
        if (isNew) {
          Alert.alert(
            "🆕 Novo Produto",
            `"${product.name}" foi cadastrado automaticamente!\nCategoria: ${product.type}`,
            [
              {
                text: "Adicionar à Lista",
                onPress: () => handleAddSingleProduct(product as any),
              },
            ]
          );
        } else {
          await handleAddSingleProduct(product as any);
        }
      } else {
        Alert.alert(
          "Produto não encontrado",
          `Nenhum produto encontrado para o código ${ean}.\n\nCadastre manualmente no botão "Adicionar".`,
          [{ text: "Ok" }]
        );
      }
    } catch (err) {
      console.error("Erro no scan EAN:", err);
      Alert.alert("Erro", "Falha ao buscar produto. Tente novamente.");
    } finally {
      setScanningLoading(false);
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

  const handleShare = async () => {
    try {
      const filePath = await exportListAsHtml(listName, products, total);
      await shareFile(filePath);
    } catch (error) {
      console.error("Erro ao compartilhar:", error);
      Alert.alert("Erro", "Não foi possível compartilhar a lista.");
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
        style={{
          flexDirection: "row",
          alignItems: "center",
          padding: 12,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          backgroundColor: isSelected ? colors.primaryFaded : "transparent",
        }}
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
            style={{ width: 40, height: 40, borderRadius: 8, marginRight: 12 }}
          />
        )}
        <View style={{ flex: 1 }}>
          <Text style={{ color: colors.primary }}>{item.name}</Text>
        </View>
        {isSelected && (
          <Text style={{ color: "#22C55E", fontWeight: "bold" }}>✓</Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <>
      <Header title={listName} signOut={signOut}>
        <TouchableOpacity onPress={handleShare} style={{ marginRight: 12 }}>
          <Ionicons name="share-outline" size={22} color="#fff" />
        </TouchableOpacity>
      </Header>
      <Container>
        <View style={{ flex: 1, backgroundColor: colors.background }}>
          <TouchableOpacity
            onPress={handleFinalizeList}
            style={{
              position: "absolute",
              top: 8,
              right: 8,
              backgroundColor: colors.primary,
              paddingHorizontal: 12,
              paddingVertical: 4,
              borderRadius: 6,
              zIndex: 10,
            }}
          >
            <Text style={{ color: "#fff", fontSize: 14 }}>
              Finalizar compras
            </Text>
          </TouchableOpacity>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: 40,
              marginBottom: 16,
            }}
          >
            <Text
              style={{ fontSize: 16, fontWeight: "bold", color: colors.primary }}
            >
              {listName}
            </Text>
            <Text
              style={{
                fontSize: 20,
                fontWeight: "600",
                color: isDark ? colors.successText : "#166534",
              }}
            >
              Total: R$ {total.toFixed(2)}
            </Text>
          </View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              padding: 8,
              marginBottom: 8,
              backgroundColor: colors.card,
              borderRadius: 8,
            }}
          >
            <Text
              style={{
                color: colors.primary,
                fontWeight: "bold",
                width: "33.333%",
                fontSize: 14,
              }}
            >
              Produto
            </Text>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                width: "66.666%",
                paddingHorizontal: 8,
              }}
            >
              <Text
                style={{
                  color: colors.primary,
                  fontWeight: "bold",
                  width: 48,
                  textAlign: "center",
                  fontSize: 14,
                }}
              >
                Est.
              </Text>
              <Text
                style={{
                  color: colors.primary,
                  fontWeight: "bold",
                  width: 48,
                  textAlign: "center",
                  fontSize: 14,
                }}
              >
                Qtd
              </Text>
              <Text
                style={{
                  color: colors.primary,
                  fontWeight: "bold",
                  width: 80,
                  textAlign: "center",
                  fontSize: 14,
                }}
              >
                Valor
              </Text>
              <View style={{ width: 96 }} />
            </View>
          </View>
          <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
            {products.map((p) => {
              const isComplete = p.quantity > 0 && p.price > 0;
              return (
                <View
                  key={p.id}
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    padding: 8,
                    borderRadius: 12,
                    marginBottom: 12,
                    backgroundColor: isComplete
                      ? isDark
                        ? "#1a3a1a"
                        : "#86EFAC"
                      : colors.card,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      width: "33.333%",
                    }}
                  >
                    <Text
                      style={{
                        color: colors.primary,
                        fontSize: 14,
                      }}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {p.name}
                    </Text>
                  </View>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginTop: 8,
                      width: "66.666%",
                      gap: 4,
                      marginRight: 8,
                    }}
                  >
                    <TextInput
                      style={{
                        paddingVertical: 4,
                        textAlign: "center",
                        width: 40,
                        borderRadius: 6,
                        backgroundColor: isDark ? colors.cardAlt : "#e5e7eb",
                        color: colors.text,
                      }}
                      keyboardType="numeric"
                      value={stockInputs[p.id] || ""}
                      onChangeText={(text) =>
                        setStockInputs((prev) => ({
                          ...prev,
                          [p.id]: text.replace(/[^0-9]/g, ""),
                        }))
                      }
                      placeholder="0"
                      placeholderTextColor={colors.textSecondary}
                    />
                    <TextInput
                      style={{
                        padding: 4,
                        textAlign: "center",
                        width: 40,
                        borderRadius: 6,
                        backgroundColor: isDark ? colors.cardAlt : "#e5e7eb",
                        color: colors.text,
                      }}
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
                      style={{
                        padding: 4,
                        textAlign: "center",
                        width: 64,
                        marginRight: 8,
                        borderRadius: 6,
                        backgroundColor: isDark ? colors.cardAlt : "#e5e7eb",
                        color: colors.text,
                      }}
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
                      style={{ paddingHorizontal: 12, paddingVertical: 4 }}
                      onPress={() => handleSaveProduct(p.id)}
                    >
                      <Text style={{ fontSize: 18 }}>✅</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={{ paddingHorizontal: 12, paddingVertical: 4 }}
                      onPress={() => handleRemoveProduct(p.id)}
                    >
                      <Text style={{ fontSize: 14, fontWeight: "bold" }}>
                        🗑️
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </ScrollView>
          <TouchableOpacity
            style={{
              backgroundColor: colors.primary,
              borderRadius: 999,
              alignItems: "center",
              marginTop: 16,
              padding: 12,
            }}
            onPress={openModal}
          >
            <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 20 }}>
              Adicionar Produto
            </Text>
          </TouchableOpacity>
          <Modal visible={modalVisible} transparent animationType="slide">
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: colors.overlay,
              }}
            >
              <View
                style={{
                  backgroundColor: colors.white,
                  padding: 16,
                  borderRadius: 16,
                  width: "91.666%",
                  maxHeight: "90%",
                }}
              >
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "bold",
                    marginBottom: 16,
                    color: colors.primary,
                  }}
                >
                  Selecione um ou mais Produtos
                </Text>

                <View style={{ marginBottom: 16 }}>
                  <View style={{ flexDirection: "row", gap: 8 }}>
                    <TextInput
                      style={{
                        flex: 1,
                        borderWidth: 2,
                        borderColor: searchQuery ? colors.primary : colors.border,
                        borderRadius: 999,
                        paddingVertical: 8,
                        paddingHorizontal: 24,
                        marginBottom: 16,
                        backgroundColor: colors.card,
                        color: colors.text,
                      }}
                      placeholder="Buscar produto por nome..."
                      placeholderTextColor={colors.textSecondary}
                      value={searchQuery}
                      onChangeText={setSearchQuery}
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                    <TouchableOpacity
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: 21,
                        backgroundColor: colors.primary,
                        justifyContent: "center",
                        alignItems: "center",
                        marginBottom: 16,
                      }}
                      onPress={() => setScannerVisible(true)}
                    >
                      <Ionicons name="camera" size={22} color="#fff" />
                    </TouchableOpacity>
                  </View>
                </View>

                <SectionList
                  sections={Object.values(
                    availableProducts
                      .filter((item) =>
                        item.name
                          ?.toLowerCase()
                          .includes(searchQuery.toLowerCase())
                      )
                      .reduce((acc, item) => {
                        const type = item.type || "Outros";
                        if (!acc[type]) acc[type] = { title: type, data: [] };
                        acc[type].data.push(item);
                        return acc;
                      }, {} as Record<string, { title: string; data: typeof availableProducts }>)
                  )}
                  keyExtractor={(item) => item.id}
                  renderItem={renderItem}
                  renderSectionHeader={({ section: { title } }) => (
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "bold",
                        backgroundColor: colors.card,
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        color: colors.primary,
                      }}
                    >
                      {title}
                    </Text>
                  )}
                  style={{ maxHeight: 320 }}
                  ListEmptyComponent={
                    <Text
                      style={{
                        textAlign: "center",
                        color: colors.textSecondary,
                        paddingVertical: 16,
                      }}
                    >
                      {searchQuery
                        ? `Nenhum produto encontrado para "${searchQuery}"`
                        : "Nenhum produto disponível"}
                    </Text>
                  }
                />

                <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 16 }}>
                  <TouchableOpacity
                    style={{
                      flex: 1,
                      alignItems: "center",
                      justifyContent: "center",
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                      borderRadius: 6,
                      marginRight: 8,
                      backgroundColor:
                        selectedProducts.length > 0
                          ? colors.primary
                          : "#9CA3AF",
                    }}
                    onPress={() => {
                      handleAddProducts(selectedProducts);
                      setSearchQuery("");
                    }}
                    disabled={selectedProducts.length === 0}
                  >
                    <Text style={{ color: "#fff", fontWeight: "bold" }}>
                      Adicionar{" "}
                      {selectedProducts.length > 0
                        ? `(${selectedProducts.length})`
                        : ""}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{
                      flex: 1,
                      borderWidth: 1,
                      borderColor: colors.border,
                      alignItems: "center",
                      justifyContent: "center",
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                      borderRadius: 6,
                      marginLeft: 8,
                      backgroundColor: colors.card,
                    }}
                    onPress={() => {
                      setModalVisible(false);
                      setSearchQuery("");
                    }}
                  >
                    <Text
                      style={{
                        color: isDark ? colors.textSecondary : "#4B5563",
                        fontWeight: "bold",
                      }}
                    >
                      Fechar
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

          <BarcodeScanner
            visible={scannerVisible}
            onScan={handleBarCodeScanned}
            onClose={() => setScannerVisible(false)}
          />

          {scanningLoading && (
            <View
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(0,0,0,0.4)",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 999,
              }}
            >
              <View
                style={{
                  backgroundColor: colors.card,
                  padding: 32,
                  borderRadius: 16,
                  alignItems: "center",
                }}
              >
                <ActivityIndicator size="large" color={colors.primary} />
                <Text
                  style={{
                    color: colors.text,
                    marginTop: 12,
                    fontSize: 16,
                  }}
                >
                  Buscando produto...
                </Text>
              </View>
            </View>
          )}
        </View>
      </Container>
    </>
  );
}
