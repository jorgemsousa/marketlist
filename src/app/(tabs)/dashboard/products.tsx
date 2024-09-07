import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, FlatList, Text, TouchableOpacity, TextInput, Alert, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from "@/src/components/header";
import { supabase } from '@/src/database/supabase';

// Definição dos tipos para os produtos
interface Product {
  id?: number;
  name: string;
  imageUrl: string;
  type: string;
}

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [newProductName, setNewProductName] = useState<string>('');
  const [newProductImageUrl, setNewProductImageUrl] = useState<string>('');
  const [newProductType, setNewProductType] = useState<string>('');
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [productTypes, setProductTypes] = useState<string[]>([]);

  // Função para buscar os produtos do Supabase
  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('produtos')
      .select('product_id, product_name, product_url_image, product_category');

    if (error) {
      console.error('Erro ao buscar produtos:', error);
    } else {
      console.log(data);
      const formattedProducts = data?.map((product: any) => ({
        id: product.product_id,
        name: product.product_name,
        imageUrl: product.product_url_image,
        type: product.product_category,
      })) || [];

      setProducts(formattedProducts);
      const uniqueCategories = [...new Set(data?.map((product: any) => product.product_category))];
      setProductTypes(uniqueCategories);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const addProduct = async () => {
    if (!newProductName || !newProductImageUrl || !newProductType) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }

    const { data, error } = await supabase
      .from('produtos')
      .insert([{ product_name: newProductName, product_url_image: newProductImageUrl, product_category: newProductType }]);

    if (error) {
      console.log(error.message);
      Alert.alert('Erro', 'Erro ao adicionar o produto.');
    } else {
      // Atualize a lista de produtos com o novo produto
      const newProduct: Product = {        
        name: newProductName,
        imageUrl: newProductImageUrl,
        type: newProductType,
      };

      setProducts([...products, newProduct]);
      setNewProductName('');
      setNewProductImageUrl('');
      setNewProductType('');
      setIsAdding(false);
      Alert.alert('Sucesso', 'Produto adicionado com sucesso!');
    }
  };

  const renderSection = (type: string) => {
    const sectionProducts = products.filter(product => product.type === type);

    if (sectionProducts.length === 0) return null;

    return (
      <View key={type} className="mb-6 p-4">
        <Text className="text-2xl font-bold mb-2 text-zinc-600">{type}</Text>
        <FlatList
          data={sectionProducts}
          horizontal
          keyExtractor={(item) => item.name}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={{ marginRight: 16 }}>
              <Image
                source={{ uri: item.imageUrl }}
                style={{ width: 100, height: 100, borderRadius: 8 }}             
              />
              <Text className="text-center mt-2 text-zinc-500">{item.name}</Text>
            </View>
          )}
        />
      </View>
    );
  };

  return (
    <>
      <Header title="Produtos" />
      <SafeAreaView className="flex-1 p-4 bg-white">
        <View className="p-4 flex-row items-center justify-between mb-4">
          <Text className="text-xl font-bold text-purple-700">Produtos por categoria</Text>
          <TouchableOpacity onPress={() => setIsAdding(true)} className="bg-purple-700 p-2 rounded-lg">
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <FlatList
          data={productTypes}
          keyExtractor={(item) => item}
          renderItem={({ item }) => renderSection(item)}
        />

        {isAdding && (
          <View className="p-4 rounded-3xl mt-4 bg-white border border-purple-700 -mb-10">
            <TextInput
              placeholder="Nome do produto"
              value={newProductName}
              onChangeText={setNewProductName}
              className="border-2 border-gray-300 rounded-full p-4 mb-4 bg-gray-100"
            />
            <TextInput
              placeholder="URL da imagem"
              value={newProductImageUrl}
              onChangeText={setNewProductImageUrl}
              className="border-2 border-gray-300 rounded-full p-4 mb-4 bg-gray-100"
            />
            <TextInput
              placeholder="Tipo do produto (Alimento, Vestuário, etc.)"
              value={newProductType}
              onChangeText={setNewProductType}
              className="border-2 border-gray-300 rounded-full p-4 mb-4 bg-gray-100"
            />
            <TouchableOpacity onPress={addProduct} className="bg-purple-700 p-3 rounded-full items-center mb-2 mt-4">
              <Text className="text-white text-xl font-bold">Adicionar Produto</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setIsAdding(false)} className="bg-zinc-300 mb-28 items-center rounded-full p-3">
              <Text className="text-zinc-500 text-xl font-semibold">Cancelar</Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    </>
  );
};

export default Products;
