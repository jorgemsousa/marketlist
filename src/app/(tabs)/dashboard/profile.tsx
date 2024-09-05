import React, { useState } from 'react';
import { SafeAreaView, Text, TouchableOpacity, View, TextInput, Alert, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '@/src/components/header'

const Profile = () => {
  const [nome, setNome] = useState('João da Silva');
  const [email, setEmail] = useState('joao.silva@email.com');
  const [editando, setEditando] = useState(false);

  const salvarPerfil = () => {
    setEditando(false);
    Alert.alert('Sucesso', 'Perfil atualizado com sucesso!');
  };

  return (
    <>
    <Header title='Perfil' signOut={() => {}} />
    <SafeAreaView style={{ flex: 1, padding: 16, backgroundColor: '#f2f2f2' }}>
      <View style={{ alignItems: 'center', marginBottom: 32 }}>
        <Image
          source={{ uri: 'https://via.placeholder.com/150' }}
          style={{ width: 150, height: 150, borderRadius: 75, marginBottom: 16 }}
        />
        {editando ? (
          <>
            <TextInput
              value={nome}
              onChangeText={setNome}
              style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 8, borderBottomWidth: 1, width: '80%' }}
            />
            <TextInput
              value={email}
              onChangeText={setEmail}
              style={{ fontSize: 16, marginBottom: 16, borderBottomWidth: 1, width: '80%' }}
            />
          </>
        ) : (
          <>
            <Text style={{ fontSize: 24, fontWeight: 'bold' }}>{nome}</Text>
            <Text style={{ fontSize: 16, color: '#666', marginBottom: 16 }}>{email}</Text>
          </>
        )}
      </View>

      <TouchableOpacity
        onPress={editando ? salvarPerfil : () => setEditando(true)}
        style={{
          backgroundColor: editando ? '#28a745' : '#007bff',
          padding: 12,
          borderRadius: 8,
          alignItems: 'center',
          marginBottom: 16,
        }}
      >
        <Text style={{ color: '#fff', fontSize: 16 }}>
          {editando ? 'Salvar Perfil' : 'Editar Perfil'}
        </Text>
      </TouchableOpacity>

      {editando && (
        <TouchableOpacity
          onPress={() => setEditando(false)}
          style={{
            backgroundColor: '#dc3545',
            padding: 12,
            borderRadius: 8,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: '#fff', fontSize: 16 }}>Cancelar</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
    </>
  );
};

export default Profile;
