import React, { useState } from 'react';
import { SafeAreaView, View, FlatList, Text, TouchableOpacity, TextInput, Alert, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from "@/src/components/header";

const Products = () => {
  const [products, setProducts] = useState([
    { id: '1', name: 'Maçã', imageUrl: 'https://via.placeholder.com/100', type: 'Alimento' },
    { id: '2', name: 'Camiseta', imageUrl: 'https://via.placeholder.com/100', type: 'Vestuário' },
    { id: '3', name: 'Banana', imageUrl: 'https://via.placeholder.com/100', type: 'Alimento' },
  ]);

  const [newProductName, setNewProductName] = useState('');
  const [newProductImageUrl, setNewProductImageUrl] = useState('');
  const [newProductType, setNewProductType] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const productTypes = ['Alimento', 'Vestuário', 'Eletrônicos'];

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
      <View key={type} style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 8 }}>{type}</Text>
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
              <Text style={{ textAlign: 'center', marginTop: 8 }}>{item.name}</Text>
            </View>
          )}
        />
      </View>
    );
  };

  return (
    <>    
      <Header title="Produtos" />
      <SafeAreaView style={{ flex: 1, padding: 16, backgroundColor: '#f2f2f2' }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Produtos</Text>
          <TouchableOpacity onPress={() => setIsAdding(true)} style={{ backgroundColor: '#007bff', padding: 8, borderRadius: 8 }}>
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <FlatList
          data={productTypes}
          keyExtractor={(item) => item}
          renderItem={({ item }) => renderSection(item)}
        />

        {isAdding && (
          <View style={{ marginTop: 16, padding: 16, backgroundColor: '#fff', borderRadius: 8 }}>
            <TextInput
              placeholder="Nome do produto"
              value={newProductName}
              onChangeText={setNewProductName}
              style={{ borderBottomWidth: 1, marginBottom: 8 }}
            />
            <TextInput
              placeholder="URL da imagem"
              value={newProductImageUrl}
              onChangeText={setNewProductImageUrl}
              style={{ borderBottomWidth: 1, marginBottom: 8 }}
            />
            <TextInput
              placeholder="Tipo do produto (Alimento, Vestuário, etc.)"
              value={newProductType}
              onChangeText={setNewProductType}
              style={{ borderBottomWidth: 1, marginBottom: 16 }}
            />

            <TouchableOpacity onPress={addProduct} style={{ backgroundColor: '#28a745', padding: 12, borderRadius: 8, alignItems: 'center', marginBottom: 8 }}>
              <Text style={{ color: '#fff', fontSize: 16 }}>Adicionar Produto</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setIsAdding(false)} style={{ backgroundColor: '#dc3545', padding: 12, borderRadius: 8, alignItems: 'center' }}>
              <Text style={{ color: '#fff', fontSize: 16 }}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    </>
  );
};

export default Products;
