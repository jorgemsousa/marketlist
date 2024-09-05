import React, { useState } from 'react';
import { SafeAreaView, Text, TouchableOpacity, View, TextInput, Alert, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '@/src/components/header'

const Profile = () => {
  const [nome, setNome] = useState('João da Silva');
  const [nomeFocused, setNomeFocused] = useState(false);
  const [email, setEmail] = useState('joao.silva@email.com');
  const [emailFocused, setEmailFocused] = useState(false);
  const [editando, setEditando] = useState(false);

  const salvarPerfil = () => {
    setEditando(false);
    Alert.alert('Sucesso', 'Perfil atualizado com sucesso!');
  };

  return (
    <>
    <Header title='Perfil' signOut={() => {}} />
    <View className='flex-1 p-4 bg-white'>
      <View className='items-center mb-4'>
        <Image
          source={{ uri: 'https://via.placeholder.com/150' }}
          style={{ width: 150, height: 150, borderRadius: 75, marginBottom: 16, marginTop: 32 }}
        />
        {editando ? (
          <>
            <TextInput
              placeholder="Nome"
              value={nome}
              onChangeText={setNome}
              onFocus={() => setNomeFocused(true)}
              onBlur={() => setNomeFocused(false)}
              className={`border-2 ${nomeFocused ? 'border-purple-700': 'border-gray-300'} rounded-full p-4 mt-8 bg-gray-100 w-full`}
            />  
            <TextInput
              placeholder="E-mail"
              value={email}
              onChangeText={setEmail}
              onFocus={() => setEmailFocused(true)}
              onBlur={() => setEmailFocused(false)}
              className={`border-2 ${emailFocused ? 'border-purple-700': 'border-gray-300'} rounded-full p-4 mt-4 bg-gray-100 w-full`}
            />            
          </>
        ) : (
          <>
            <Text className='text-3xl font-semibold text-zinc-600'>{nome}</Text>
            <Text className='text-xl font-semibold text-zinc-400 mb-4'>{email}</Text>
          </>
        )}
      </View>

      <TouchableOpacity onPress={editando ? salvarPerfil : () => setEditando(true)} className='bg-purple-700 p-3 rounded-full items-center mb-4 mt-8'>
        <Text className='text-white text-xl font-bold'>{editando ? 'Salvar Perfil' : 'Editar Perfil'}</Text>
      </TouchableOpacity>      

      {editando && (
        <TouchableOpacity onPress={() => setEditando(false)} className='bg-zinc-300 mb-20 items-center rounded-full p-3'>
          <Text className='text-zinc-500 text-xl font-semibold'>Cancelar</Text>
        </TouchableOpacity>       
      )}
    </View>
    </>
  );
};

export default Profile;
