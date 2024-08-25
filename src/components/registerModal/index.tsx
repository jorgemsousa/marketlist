import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Animated, Easing, Modal, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

type Props = {
  open: boolean;
  onClose: () => void;
};

const RegisterModal = ({ open, onClose }: Props) => {
  const [modalVisible, setModalVisible] = useState(open);
  const [nameFocused, setNameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [image, setImage] = useState<string | null>(null);
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

  return (
    <View className='flex-1 justify-center items-center'>
      {modalVisible && (
        <Modal transparent={true} visible={modalVisible} animationType="none">
          <View className='flex-1 justify-end'>
            <Animated.View
              style={{
                transform: [{ translateY: slideAnim }],
              }}
              className='bg-white p-6 rounded-t-xl'
            >
              <Text className='text-center font-bold text-2xl mb-4'>Cadastro</Text>

              {/* Avatar */}
              <TouchableOpacity onPress={pickImage} className='items-center mb-6'>
                {image ? (
                  <Image source={{ uri: image }} className='w-24 h-24 rounded-full' />
                ) : (
                  <View className='w-24 h-24 rounded-full bg-gray-200 items-center justify-center'>
                    <Text className='text-gray-500 font-semibold text-lg'>Foto</Text>
                  </View>
                )}
              </TouchableOpacity>

              {/* Nome */}
              <TextInput
                placeholder="Nome"
                onFocus={() => setNameFocused(true)}
                onBlur={() => setNameFocused(false)}
                style={{
                  borderColor: nameFocused ? '#6200EE' : '#ccc',
                  borderWidth: 2,
                  borderRadius: 8,
                  padding: 16,
                  marginBottom: 16,
                }}
              />

              {/* E-mail */}
              <TextInput
                placeholder="E-mail"
                keyboardType="email-address"
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
                style={{
                  borderColor: emailFocused ? '#6200EE' : '#ccc',
                  borderWidth: 2,
                  borderRadius: 8,
                  padding: 16,
                  marginBottom: 16,
                }}
              />

              {/* Senha */}
              <TextInput
                placeholder="Senha"
                secureTextEntry
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
                style={{
                  borderColor: passwordFocused ? '#6200EE' : '#ccc',
                  borderWidth: 2,
                  borderRadius: 8,
                  padding: 16,
                  marginBottom: 24,
                }}
              />

              <TouchableOpacity onPress={slideOut} className='bg-blue-500 p-4 rounded-lg'>
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
