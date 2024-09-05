import React, { useState } from 'react';
import { FlatList, SafeAreaView, Text, TouchableOpacity, View, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '@/src/components/header';

const Orders = () => {
  const [listas, setListas] = useState([
    { id: '1', nome: 'Lista 1', valor: 'R$ 100' },
    { id: '2', nome: 'Lista 2', valor: 'R$ 200' },
  ]);

  const [novaListaNome, setNovaListaNome] = useState('');
  const [novaListaValor, setNovaListaValor] = useState('');

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
        
        <SafeAreaView style={{ flex: 1, padding: 16 }}>
        <View className="flex-row items-center justify-between w-full">
            <Text className='text-purple-600 font-bold size-15'>Minhas Listas</Text>
            <TouchableOpacity onPress={adicionarLista} style={{ padding: 8, backgroundColor: '#ac24db', borderRadius: 8 }}>
            <Ionicons name="add" size={24} color="#fff" />
            </TouchableOpacity>
        </View>

        <View style={{ marginTop: 16, marginBottom: 16 }}>
            <TextInput
                placeholder="Nome da nova lista"
                value={novaListaNome}
                onChangeText={setNovaListaNome}
                className='border border-purple-700 rounded-xl p-2 mb-2'            
            />
            <TextInput
                placeholder="Valor"
                value={novaListaValor}
                onChangeText={setNovaListaValor}
                className='border border-purple-700 rounded-xl p-2 mb-2'  
            />
        </View>

        <FlatList
            data={listas}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 16, marginBottom: 8, backgroundColor: '#f9f9f9', borderRadius: 8 }}>
                <Text style={{ fontSize: 16 }}>{item.nome}</Text>
                <Text style={{ fontSize: 16 }}>{item.valor}</Text>
            </View>
            )}
        />
        </SafeAreaView>
    </>
  );
};

export default Orders;

