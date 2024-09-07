import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams } from 'expo-router'; 
import Header from '../../components/header';

interface Product {
  id: number;
  name: string;
  quantity: number;
  price: number;
  bought: boolean;
}

const ShoppingListScreen: React.FC = () => {
  // Acessando parâmetros usando o hook useSearchParams
  const { shoppingListName } = useLocalSearchParams();

  const [products, setProducts] = useState<Product[]>([
    { id: 1, name: 'Arroz', quantity: 1, price: 0, bought: false },
    { id: 2, name: 'Feijão', quantity: 1, price: 0, bought: false },
    { id: 3, name: 'Macarrão', quantity: 1, price: 0, bought: false },
  ]);

  const [totalPrice, setTotalPrice] = useState<number>(0);

  useEffect(() => {
    const calculateTotal = () => {
      const total = products.reduce((sum, product) => {
        return sum + (product.bought ? 0 : product.quantity * product.price);
      }, 0);
      setTotalPrice(total);
    };

    calculateTotal();
  }, [products]);

  const handleAddProduct = () => {
    const newProduct: Product = {
      id: products.length + 1,
      name: 'Novo Produto',
      quantity: 1,
      price: 0,
      bought: false,
    };
    setProducts([...products, newProduct]);
  };

  const handleUpdateProduct = (id: number, field: 'quantity' | 'price' | 'bought', value: number | boolean) => {
    const updatedProducts = products.map((product) =>
      product.id === id ? { ...product, [field]: value } : product
    );
    setProducts(updatedProducts);
  };

  return (
    <>    
        <Header title={shoppingListName.toString()} />
        <View className="flex-1 bg-white p-4">
        <View className='flex-row items-center justify-between'>
            <Text className='text-xl font-bold text-center mb-4'>{shoppingListName}</Text>

            <Text className='text-xl font-bold text-center mb-4'>Total: R$ {totalPrice.toFixed(2)}</Text>
        </View>

        <ScrollView className='flex-1'>
            {products.map((product) => (
            <View key={product.id} className='flex-row items-center  justify-between mb-2 bg-zinc-200 p-1 rounded-xl' >
                
                <Text className='ml-2 w-32 text-purple-700 font-semibold text-lg'>{product.name}</Text>
                <View className='flex-row items-center'>
                    <TextInput
                    className='py-1 text-center w-12 mr-2 rounded-xl bg-zinc-100'
                    keyboardType="numeric"
                    placeholder="Qtd"
                    value={product.quantity.toString()}
                    editable={!product.bought}
                    onChangeText={(text) => handleUpdateProduct(product.id, 'quantity', parseInt(text) || 0)}
                    />
                    <TextInput
                    className='py-1 w-16 bg-zinc-100 text-center mr-2'
                    keyboardType="numeric"
                    placeholder="Preço"
                    value={product.price.toString()}
                    editable={!product.bought}
                    onChangeText={(text) => handleUpdateProduct(product.id, 'price', parseFloat(text) || 0)}
                    />                
                </View>    
            </View>
            ))}
        </ScrollView>

        {/* Botão para Adicionar Produto */}
        <TouchableOpacity
            className='bg-purple-700 rounded-full items-center mt-4 p-3'
            onPress={handleAddProduct}
        >
            <Text className="text-white font-bold text-xl">Adicionar Produto</Text>
        </TouchableOpacity>
        </View>
    </>
  );
};

export default ShoppingListScreen;