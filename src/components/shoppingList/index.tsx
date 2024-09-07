import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, ScrollView, TouchableOpacity } from 'react-native';

interface Product {
  id: number;
  name: string;
  quantity: number;
  price: number;
  bought: boolean;
}

interface ShoppingListScreenProps {
  route: {
    params: {
      shoppingListName: string;
    };
  };
}

const ShoppingListScreen: React.FC<ShoppingListScreenProps> = ({ route }) => {
  const { shoppingListName } = route.params;

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
    <View className="flex-1 bg-white p-4">
      {/* Nome da Lista */}
      <Text className='text-xl font-bold text-center mb-4'>{shoppingListName}</Text>

      {/* Soma Total */}
      <Text className='text-xl font-bold text-center mb-4'>Total: R$ {totalPrice.toFixed(2)}</Text>

      {/* Lista de Produtos */}
      <ScrollView className='flex-1'>
        {products.map((product) => (
          <View key={product.id} className='flex-row items-center mb-4'>
            
            <Text className='ml-2 w-32'>{product.name}</Text>

            <TextInput
              className='border p-1 w-12 mr-2'
              keyboardType="numeric"
              placeholder="Qtd"
              value={product.quantity.toString()}
              editable={!product.bought}
              onChangeText={(text) => handleUpdateProduct(product.id, 'quantity', parseInt(text) || 0)}
            />
            <TextInput
              className='border p-1 w-24 mr-2'
              keyboardType="numeric"
              placeholder="Preço"
              value={product.price.toString()}
              editable={!product.bought}
              onChangeText={(text) => handleUpdateProduct(product.id, 'price', parseFloat(text) || 0)}
            />
          </View>
        ))}
      </ScrollView>

      {/* Botão para Adicionar Produto */}
      <TouchableOpacity
        className='bg-purple-700 rounded-full items-center mt-4'
        onPress={handleAddProduct}
      >
        <Text className="text-white font-bold text-xl">Adicionar Produto</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ShoppingListScreen;