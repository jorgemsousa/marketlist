import { supabase } from '@/src/database/supabase';
import { useNavigation, router } from 'expo-router';
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Animated, Easing, Modal, Image, useWindowDimensions } from 'react-native';
import Entypo from '@expo/vector-icons/Entypo';

type Props = {
  open: boolean;
  onClose: () => void;
};

const LoginModal = ({ open, onClose }: Props) => {
  const [modalVisible, setModalVisible] = useState(open);
  const [email, setEmail] = useState('');
  const [emailFocused, setEmailFocused] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordFocused, setPasswordFocused] = useState(false);
  const { width, height} = useWindowDimensions()
  const {navigate} = useNavigation();
  const navigation = navigate;
  const slideAnim = useRef(new Animated.Value(300)).current;

  async function handleSignIn() {
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      console.error(error);
      return;
    } else {
      console.log('autenticado')
      router.replace('/dashboard');
    }
  }

  useEffect(() => {
    if (open) {
      slideIn();
    } else {
      slideOut();
    }
  }, [open]);

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
      toValue: 600, 
      duration: 500,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start(() => {
      setModalVisible(false);
      onClose();
    });
  };

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
              <Text className='text-purple-700 text-center font-bold text-3xl mb-4'>Login</Text>
              
              <Image 
                source={require('../../assets/images/login.png')}
                style={{ width, height: height * 0.3, resizeMode: 'contain', marginVertical: 20 }}
              />

              <TextInput
                placeholder="E-mail"
                keyboardType="email-address"
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
                onChangeText={setEmail}
                className={`border-2 ${emailFocused ? 'border-purple-700': 'border-gray-300'} rounded-full p-4 mb-4 bg-gray-100`}
              />
              
              <TextInput
                placeholder="Senha"
                secureTextEntry
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
                onChangeText={setPassword}
                className={`border-2 ${passwordFocused ? 'border-purple-700': 'border-gray-300'} rounded-full p-4 mb-10 bg-gray-100`}
            
              />

              <TouchableOpacity onPress={() => {
                slideOut()
                handleSignIn()
              }} 
                className='bg-purple-700 p-4 rounded-full mb-20'>
                <Text className='text-white font-bold text-center text-lg'>Entrar</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </Modal>
      )}
    </View>
  );
};
export default LoginModal;
