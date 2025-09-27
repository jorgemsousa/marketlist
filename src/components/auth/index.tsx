import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { router } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/src/database/firebaseConfig';

type Props = {
  onClose: () => void;
};

const Auth = ({ onClose }: Props) => {
  const [email, setEmail] = useState('');
  const [emailFocused, setEmailFocused] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [loading, setLoading] = useState(false); 

  async function handleSignIn() {
    setLoading(true); 
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      Alert.alert("Muito bom ter você de volta, aproveite as compras!")
      router.push('/dashboard');
      onClose();
    } catch (error: any) {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.error('Erro ao autenticar usuário:', errorCode, errorMessage);
      setLoading(false); 
    }
  }

  return (
    <View>
      <TextInput
        placeholder="E-mail"
        keyboardType="email-address"
        onFocus={() => setEmailFocused(true)}
        onBlur={() => setEmailFocused(false)}
        onChangeText={setEmail}
        className={`border-2 ${emailFocused ? 'border-purple-700' : 'border-gray-300'} rounded-full px-4 py-4 mb-4 bg-gray-100`}
        editable={!loading}
      />
      <TextInput
        placeholder="Senha"
        secureTextEntry
        onFocus={() => setPasswordFocused(true)}
        onBlur={() => setPasswordFocused(false)}
        onChangeText={setPassword}
        className={`border-2 ${passwordFocused ? 'border-purple-700' : 'border-gray-300'} rounded-full px-4 py-4 mb-4 bg-gray-100`}
        editable={!loading}
      />
      <TouchableOpacity
        onPress={handleSignIn}
        className='bg-purple-700 p-4 rounded-full mb-20'
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text className='text-white font-bold text-center text-lg'>Entrar</Text>
        )}
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => {
          onClose();
        }}
        className='border border-purple-700 items-center justify-center px-full py-4 rounded-full min-w-full'
        disabled={loading}
      >
        <Text className='text-purple-700 font-bold text-center text-lg'>Cancelar</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Auth;
