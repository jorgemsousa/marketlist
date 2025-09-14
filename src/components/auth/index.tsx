import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Animated, Easing, Modal, Image, useWindowDimensions } from 'react-native';
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
  
  
  
  async function handleSignIn() {    
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        console.log('Usuário autenticado:', user);
        router.replace('/dashboard');    
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.error('Erro ao autenticar usuário:', errorCode, errorMessage);
      });
    onClose();
  }

  return (        
    <View>         
      <TextInput
        placeholder="E-mail"
        keyboardType="email-address"
        onFocus={() => setEmailFocused(true)}
        onBlur={() => setEmailFocused(false)}
        onChangeText={setEmail}
        className={`border-2 ${emailFocused ? 'border-purple-700': 'border-gray-300'} rounded-full px-4 py-4 mb-4 bg-gray-100`}
      />
      <TextInput
        placeholder="Senha"
        secureTextEntry
        onFocus={() => setPasswordFocused(true)}
        onBlur={() => setPasswordFocused(false)}
        onChangeText={setPassword}
        className={`border-2 ${passwordFocused ? 'border-purple-700': 'border-gray-300'} rounded-full px-4 py-4 mb-4 bg-gray-100`}       
      />
      <TouchableOpacity onPress={() => {
        onClose();
        handleSignIn()
      }} 
        className='bg-purple-700 p-4 rounded-full mb-20'>
        <Text className='text-white font-bold text-center text-lg'>Entrar</Text>
      </TouchableOpacity>
    </View>      
  );
};
export default Auth;
