import React, { useState } from 'react';
import { FlatList, SafeAreaView, Text, TouchableOpacity, View, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '@/src/components/header';
import { router } from 'expo-router';


const Orders = () => {
  const [listas, setListas] = useState([
    { id: '1', nome: 'Lista 1', valor: 'R$ 100' },
    { id: '2', nome: 'Lista 2', valor: 'R$ 200' },
  ]);

  const [novaListaNome, setNovaListaNome] = useState('');
  const [novaListaNomeFocused, setNovaListaNomeFocused] = useState(false);
  const [novaListaValor, setNovaListaValor] = useState('');
  const [novaListaValorFocused, setNovaListaValorFocused] = useState(false);
  

  const handleOpenList = (listName: string) => {
    // Navega para a tela 'shopping-list' e passa o parâmetro 'shoppingListName'
    router.replace({
      pathname: '/shoppingList' as const,
      params: { shoppingListName: listName },
    });
  };

  const adicionarLista = () => {
    if (novaListaNome === '' || novaListaValor === '') {
      Alert.alert('Erro', 'Nome e valor são obrigatórios!');
      return;
    }

    const novaLista = {
      id: (listas.length + 1).toString(),
      nome: novaListaNome,
      valor: novaListaValor,
    };

    setListas([...listas, novaLista]);
    setNovaListaNome('');
    setNovaListaValor('');
  };

  return (
    <>    
        <Header title='Pedidos' signOut={() => {}} />
        
        <SafeAreaView className='flex-1 p-4 bg-white'>
        <View className="flex-row items-center justify-between w-full p-4">
            <Text className='text-purple-700 font-bold text-xl'>Listas Abertas</Text>
            <TouchableOpacity onPress={adicionarLista} className='p-2 bg-purple-700 rounded-xl'>
              <Ionicons name="add" size={24} color="#fff" />
            </TouchableOpacity>
        </View>

        <View className="m-2">
            <TextInput
                placeholder="Nome da nova lista"
                value={novaListaNome}
                onChangeText={setNovaListaNome}
                onFocus={() => setNovaListaNomeFocused(true)}
                onBlur={() => setNovaListaNomeFocused(false)}
                className={`border-2 ${novaListaNomeFocused ? 'border-purple-700': 'border-gray-300'} rounded-full px-4 py-2 mb-4 bg-gray-100`}                 
            />
            <TextInput
                placeholder="Valor"
                value={novaListaValor}
                onChangeText={setNovaListaValor}
                onFocus={() => setNovaListaValorFocused(true)}
                onBlur={() => setNovaListaValorFocused(false)}
                className={`border-2 ${novaListaValorFocused ? 'border-purple-700': 'border-gray-300'} rounded-full px-4 py-2 mb-4 bg-gray-100`}                 
            />
        </View>
        <View className=''>
          <FlatList
              data={listas}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => handleOpenList(item.nome)}>
                  <View className='flex-row items-center justify-between p-4 rounded-xl bg-zinc-100 mb-2 ml-2 mr-2'>
                      <Text className='text-md text-purple-600 font-semibold'>{item.nome}</Text>
                      <Text className='text-md text-purple-600 font-semibold'>{item.valor}</Text>
                  </View>
                </TouchableOpacity>
              )}
          />
        </View>
        </SafeAreaView>
    </>
  );
};

export default Orders;

