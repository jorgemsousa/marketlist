import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Animated, Easing, Modal, Image, useWindowDimensions } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '@/src/database/supabase';

type Props = {
  open: boolean;
  onClose: () => void;
};

type PropsAccount = {
  name: string;
  email: string;
  password: string;
  passwordRepeat: string;
  image: string;
};

const RegisterModal = ({ open, onClose }: Props) => {
  const [modalVisible, setModalVisible] = useState(open);
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
  const { width, height} = useWindowDimensions()
  const slideAnim = useRef(new Animated.Value(300)).current;

 
  const slideIn = () => {
    setModalVisible(true);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 500,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  };

  const slideOut = () => {
    Animated.timing(slideAnim, {
      toValue: 700,
      duration: 500,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start(() => {
      setModalVisible(false);
      onClose();
    });
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleCreateAccount = async (account: PropsAccount) => {
    const response = await supabase.from('usuarios').insert({
      nome: account.name,
      email: account.email,
      senha: account.password,
      senha_repetida: account.passwordRepeat,
      imagem: account.image,
    })
    if (response.error) {
      console.error('Erro ao criar usuário:', response.error);
    } else {
      console.log('Usuário criado com sucesso!');
    }
  };

  useEffect(() => {
    if (open) {
      slideIn();
    } else {
      slideOut();
    }
  }, [open]);

  return (
    <View className='flex-4 justify-center items-center'>
      {modalVisible && (
        <Modal transparent={true} visible={modalVisible} animationType="none">
          <View className='flex-1 justify-end'>
            <Animated.View
              style={{
                transform: [{ translateY: slideAnim }],
              }}
              className='bg-zinc-50 border border-zinc-300 p-6 rounded-t-3xl'
            >
              <Text className='text-purple-700 text-center font-bold text-3xl mb-4'>Cadastro</Text>
              <Image 
                source={require('../../assets/images/register.png')}
                style={{ width, height: height * 0.2, resizeMode: 'contain', marginVertical: 20 }}
              />

                           
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
                className={`border-2 ${imageFocused ? 'border-purple-700': 'border-gray-300'} rounded-full p-4 mb-10 bg-gray-100`}
              /> 

              <TouchableOpacity 
                onPress={() => {
                  slideOut();
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
            </Animated.View>
          </View>
        </Modal>
      )}
    </View>
  );
};

export default RegisterModal;
