import React, { useEffect, useState } from 'react';
import { FlatList, SafeAreaView, Text, TouchableOpacity, View, TextInput, Alert, Modal, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '@/src/components/header';
import { db } from '@/src/database/firebaseConfig';
import { collection, addDoc, getDocs, doc, updateDoc } from "firebase/firestore";

// Tipos
interface Product {
  id: string;
  name: string;
  imageUrl: string;
  type: string;
}

interface List {
  id: string;
  name: string;
  total_value: number;
}

// Componente do item do modal
interface ProductItemProps {
  product: Product;
  onAdd: (product: Product, quantity: number, unitValue: number) => void;
}

const ProductItem: React.FC<ProductItemProps> = ({ product, onAdd }) => {
  const [quantity, setQuantity] = useState(1);
  const [unitValue, setUnitValue] = useState('0');

  return (
    <View className='flex-row items-center justify-between mb-4 bg-zinc-100 p-4 rounded-xl'>
      <View className='flex-row items-center'>
        <Image source={{ uri: product.imageUrl }} style={{ width: 60, height: 60, borderRadius: 8, marginRight: 8 }} />
        <Text className='text-md font-semibold'>{product.name}</Text>
      </View>

      <View className='flex-row items-center space-x-2'>
        <TouchableOpacity onPress={() => setQuantity(prev => Math.max(1, prev - 1))} className='bg-gray-200 p-2 rounded'>
          <Text>-</Text>
        </TouchableOpacity>
        <Text className='text-md font-semibold w-6 text-center'>{quantity}</Text>
        <TouchableOpacity onPress={() => setQuantity(prev => prev + 1)} className='bg-gray-200 p-2 rounded'>
          <Text>+</Text>
        </TouchableOpacity>

        <TextInput
          placeholder="Valor"
          value={unitValue}
          keyboardType="numeric"
          onChangeText={setUnitValue}
          className='border-2 border-gray-300 rounded-full px-2 py-1 w-24 text-center bg-white'
        />

        <TouchableOpacity
          onPress={() => onAdd(product, quantity, parseFloat(unitValue))}
          className='bg-purple-700 p-2 rounded-lg'
        >
          <Text className='text-white font-bold'>Adicionar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const Orders: React.FC = () => {
  const [listas, setListas] = useState<List[]>([]);
  const [novaListaNome, setNovaListaNome] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);

  // Buscar listas
  const fetchListas = async () => {
    const snapshot = await getDocs(collection(db, "lists"));
    const data: List[] = snapshot.docs.map(doc => ({
      id: doc.id,
      name: doc.data().name,
      total_value: doc.data().total_value,
    }));
    setListas(data);
  };

  // Buscar produtos
  const fetchProducts = async () => {
    const snapshot = await getDocs(collection(db, "products"));
    const data: Product[] = snapshot.docs.map(doc => ({
      id: doc.id,
      name: doc.data().name,
      imageUrl: doc.data().imageUrl,
      type: doc.data().type,
    }));
    setProducts(data);
  };

  useEffect(() => {
    fetchListas();
    fetchProducts();
  }, []);

  // Criar nova lista
  const adicionarLista = async () => {
    if (!novaListaNome) {
      Alert.alert('Erro', 'Nome é obrigatório!');
      return;
    }

    try {
      const docRef = await addDoc(collection(db, "lists"), {
        name: novaListaNome,
        total_value: 0,
      });

      setListas([...listas, { id: docRef.id, name: novaListaNome, total_value: 0 }]);
      setNovaListaNome('');
    } catch (err) {
      console.error(err);
      Alert.alert('Erro', 'Não foi possível criar a lista.');
    }
  };

  // Abrir modal de produtos
  const openProductModal = (listId: string) => {
    setSelectedListId(listId);
    setModalVisible(true);
  };

  // Adicionar produto à lista
  const addProductToList = async (product: Product, quantity: number, unitValue: number) => {
    if (!selectedListId) return;

    try {
      const itemsCollection = collection(db, "lists", selectedListId, "items");

      await addDoc(itemsCollection, {
        productId: product.id,
        name: product.name,
        quantity,
        unitValue,
        category: product.type,
      });

      // Atualiza total da lista
      const itemsSnapshot = await getDocs(itemsCollection);
      const total = itemsSnapshot.docs.reduce((sum, doc) => {
        const data = doc.data();
        return sum + (data.unitValue || 0) * (data.quantity || 1);
      }, 0);

      await updateDoc(doc(db, "lists", selectedListId), { total_value: total });

      Alert.alert("Sucesso", `${product.name} adicionado à lista!`);
    } catch (err) {
      console.error(err);
      Alert.alert("Erro", "Não foi possível adicionar o produto.");
    }
  };

  return (
    <>
      <Header title='Pedidos' signOut={() => {}} />
      <SafeAreaView className='flex-1 p-4 bg-white'>

        {/* Adicionar Lista */}
        <View className="flex-row items-center justify-between w-full p-4">
          <Text className='text-purple-700 font-bold text-xl'>Listas Abertas</Text>
          <TouchableOpacity onPress={adicionarLista} className='p-2 bg-purple-700 rounded-xl'>
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
        <TextInput
          placeholder="Nome da nova lista"
          value={novaListaNome}
          onChangeText={setNovaListaNome}
          className='border-2 border-gray-300 rounded-full px-4 py-2 mb-4 bg-gray-100'
        />

        {/* Listas */}
        <FlatList
          data={listas}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View className='flex-row items-center justify-between p-4 rounded-xl bg-zinc-100 mb-2 ml-2 mr-2'>
              <View>
                <Text className='text-md text-purple-600 font-semibold'>{item.name}</Text>
                <Text className='text-md text-purple-400 font-semibold'>R$ {item.total_value}</Text>
              </View>
              <TouchableOpacity onPress={() => openProductModal(item.id)} className='bg-purple-700 p-2 rounded-lg'>
                <Ionicons name="add" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          )}
        />

        {/* Modal de Produtos */}
        <Modal
          visible={modalVisible}
          animationType="slide"
          onRequestClose={() => setModalVisible(false)}
        >
          <SafeAreaView className="flex-1 p-4 bg-white">
            <Text className="text-2xl font-bold text-purple-700 mb-4">Escolha um Produto</Text>

            <FlatList
              data={products}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <ProductItem product={item} onAdd={addProductToList} />
              )}
            />

            <TouchableOpacity onPress={() => setModalVisible(false)} className='bg-zinc-300 p-3 rounded-full items-center mt-4'>
              <Text className='text-zinc-500 font-semibold text-xl'>Fechar</Text>
            </TouchableOpacity>
          </SafeAreaView>
        </Modal>

      </SafeAreaView>
    </>
  );
};

export default Orders;
