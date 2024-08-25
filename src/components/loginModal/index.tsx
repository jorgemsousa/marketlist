import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Animated, Easing, Modal } from 'react-native';

type Props = {
  open: boolean;
  onClose: () => void;
};

const LoginModal = ({ open, onClose }: Props) => {
  const [modalVisible, setModalVisible] = useState(open);
  const slideAnim = useRef(new Animated.Value(300)).current;

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
      toValue: 300, 
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
              <Text className='text-center font-bold text-2xl mb-4'>Login</Text>
              
              <TextInput
                placeholder="E-mail"
                keyboardType="email-address"
                className='border border-gray-300 rounded-full p-4 mb-4 bg-gray-100'
              />
              <TextInput
                placeholder="Senha"
                secureTextEntry
                className='border border-zinc-300 rounded-full p-4 mb-6 bg-gray-100'
              />

              <TouchableOpacity onPress={slideOut} className='bg-purple-700 p-4 rounded-full'>
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
