import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Animated, Easing, Modal, Image, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import Auth from '../auth';

type Props = {
  open: boolean;
  onClose: () => void;
};

const LoginModal = ({ open, onClose }: Props) => {
  const [modalVisible, setModalVisible] = useState(open);  
  const { width, height} = useWindowDimensions()
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
    <View className='flex-2 justify-center items-center'>
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

              <Auth onClose={onClose} />
            </Animated.View>
          </View>
        </Modal>
      )}
    </View>
  );
};
export default LoginModal;
