import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Animated, Easing, Modal, Image, useWindowDimensions } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '@/src/database/supabase';

type Props = {
  onClose: () => void;
};

type PropsAccount = {
  name: string;
  email: string;
  password: string;
  passwordRepeat: string;
  image: string;
};

const Register = ({ onClose }: Props) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordRepeat, setPasswordRepeat] = useState('');
  const [image, setImage] = useState('');
  const [nameFocused, setNameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordRepeatFocused, setPasswordRepeatFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [imageFocused, setImageFocused] = useState(false);

  const handleCreateAccount = async (account: PropsAccount) => {
    console.log(account)
    const response = await supabase.auth.signUp({
      email: account.email,
      password: account.password,
    })
    onClose();
    if (response.error) {
      console.error('Erro ao criar usuário:', response.error);
    } else {
      console.log('Usuário criado com sucesso!');
    }
  };

  return (
    <View>                   
      <TextInput
        placeholder="Nome"
        onChangeText={setName}
        value={name}
        onFocus={() => setNameFocused(true)}
        onBlur={() => setNameFocused(false)}
        className={`border-2 ${nameFocused ? 'border-purple-700': 'border-gray-300'} rounded-full p-4 mb-4 bg-gray-100`}
      />

      <TextInput
        placeholder="E-mail"
        keyboardType="email-address"
        onChangeText={setEmail}
        onFocus={() => setEmailFocused(true)}
        onBlur={() => setEmailFocused(false)}
        className={`border-2 ${emailFocused ? 'border-purple-700': 'border-gray-300'} rounded-full p-4 mb-4 bg-gray-100`}
      />
      <TextInput
        placeholder="Senha"
        secureTextEntry
        onChangeText={setPassword}
        onFocus={() => setPasswordFocused(true)}
        onBlur={() => setPasswordFocused(false)}
        className={`border-2 ${passwordFocused ? 'border-purple-700': 'border-gray-300'} rounded-full p-4 mb-4 bg-gray-100`}
      />  
      <TextInput
        placeholder="Repita a Senha"
        secureTextEntry
        onChangeText={setPasswordRepeat}
        onFocus={() => setPasswordRepeatFocused(true)}
        onBlur={() => setPasswordRepeatFocused(false)}
        className={`border-2 ${passwordRepeatFocused ? 'border-purple-700': 'border-gray-300'} rounded-full p-4 mb-4 bg-gray-100`}
      />  

      <TextInput
        placeholder="url da imagem"
        secureTextEntry
        onChangeText={setImage}
        onFocus={() => setImageFocused(true)}
        onBlur={() => setImageFocused(false)}
        className={`border-2 ${imageFocused ? 'border-purple-700': 'border-gray-300'} rounded-full p-4 mb-10 bg-gray-100`}            /> 

      <TouchableOpacity 
        onPress={() => {
          handleCreateAccount({
            name: name,
            email: email,
            password: password,
            passwordRepeat: passwordRepeat,
            image: image
          })}}
        className='bg-purple-700 p-4 rounded-full mb-4'>
        <Text className='text-white font-bold text-center text-lg'>Cadastrar</Text>
      </TouchableOpacity>
    </View>
  );
};export default Register;
