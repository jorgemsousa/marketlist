import React, { useState } from 'react';
import { SafeAreaView, View, FlatList, Text, TouchableOpacity, TextInput, Alert, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from "@/src/components/header";

const Products = () => {
  const [products, setProducts] = useState([
    { id: '1', name: 'Maçã', imageUrl: 'https://t4.ftcdn.net/jpg/02/52/93/81/360_F_252938192_JQQL8VoqyQVwVB98oRnZl83epseTVaHe.jpg', type: 'Fruta' },
    { id: '2', name: 'Camiseta', imageUrl: 'https://i.pinimg.com/736x/42/16/05/4216056287954a1560f1e68ef237d3eb.jpg', type: 'Vestuário' },
    { id: '3', name: 'Banana', imageUrl: 'https://png.pngtree.com/png-vector/20220708/ourmid/pngtree-banana-clipart-design-png-image_5766012.png', type: 'Fruta' },
  ]);

  const [newProductName, setNewProductName] = useState('');
  const [newProductNameFocused, setNewProductNameFocused] = useState(false);
  const [newProductImageUrl, setNewProductImageUrl] = useState('');
  const [newProductImageUrlFocused, setNewProductImageUrlFocused] = useState(false);
  const [newProductType, setNewProductType] = useState('');
  const [newProductTypeFocused, setNewProductTypeFocused] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const productTypes = ['Fruta', 'Vestuário', 'Eletrônicos', 'Alimento'];

  const addProduct = () => {
    if (!newProductName || !newProductImageUrl || !newProductType) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }

    const newProduct = {
      id: (products.length + 1).toString(),
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
  };

  const renderSection = (type: string) => {
    const sectionProducts = products.filter(product => product.type === type);

    if (sectionProducts.length === 0) return null;

    return (
      <View key={type} className='mb-6 p-4'>
        <Text className='text-2xl font-bold mb-2 text-zinc-600'>{type}</Text>
        <FlatList
          data={sectionProducts}
          horizontal
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={{ marginRight: 16 }}>
              <Image
                source={{ uri: item.imageUrl }}
                style={{ width: 100, height: 100, borderRadius: 8 }}
              />
              <Text className='text-center mt-2 text-zinc-500'>{item.name}</Text>
            </View>
          )}
        />
      </View>
    );
  };

  return (
    <>    
      <Header title="Produtos" />
      <SafeAreaView className="flex-1 p-8 bg-zinc-200">
        <View className='p-4 flex-row items-center justify-between mb-4'>
          <Text className='text-xl font-bold text-purple-700'>Produtos por categoria</Text>
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
          <View className='p-4 rounded-3xl mt-4 bg-white border border-purple-700 -mb-10'>
            <TextInput
              placeholder="Nome do produto"
              value={newProductName}
              onChangeText={setNewProductName}
              onFocus={() => setNewProductNameFocused(true)}
              onBlur={() => setNewProductNameFocused(false)}
              className={`border-2 ${newProductNameFocused ? 'border-purple-700': 'border-gray-300'} rounded-full p-4 mb-4 bg-gray-100`}
              
            />
            <TextInput
              placeholder="URL da imagem"
              value={newProductImageUrl}
              onChangeText={setNewProductImageUrl}
              onFocus={() => setNewProductImageUrlFocused(true)}
              onBlur={() => setNewProductImageUrlFocused(false)}
              className={`border ${newProductImageUrlFocused ? 'border-purple-700': 'border-gray-300'} rounded-full p-4 mb-4 bg-gray-100`}
             
            />
            <TextInput
              placeholder="Tipo do produto (Alimento, Vestuário, etc.)"
              value={newProductType}
              onChangeText={setNewProductType}
              onFocus={() => setNewProductTypeFocused(true)}
              onBlur={() => setNewProductTypeFocused(false)}
              className={`border ${newProductTypeFocused ? 'border-purple-700': 'border-gray-300'} rounded-full p-4 mb-4 bg-gray-100`}
             
            />

            <TouchableOpacity onPress={addProduct} className='bg-purple-700 p-3 rounded-full items-center mb-2 mt-4'>
              <Text className='text-white text-xl font-bold'>Adicionar Produto</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setIsAdding(false)} className='bg-zinc-300 mb-28 items-center rounded-full p-3'>
              <Text className='text-zinc-500 text-xl font-semibold'>Cancelar</Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    </>
  );
};

export default Products;
