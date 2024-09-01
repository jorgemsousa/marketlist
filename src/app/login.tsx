import React from 'react';
import { View, Image, Text, useWindowDimensions, TouchableOpacity } from 'react-native';
import Container from '../components/container';

import LoginModal from '@/src/components/loginModal';
import RegisterModal from '../components/registerModal';

const Login = () => {
  const { width, height } = useWindowDimensions(); 
  const [open, setOpen] = React.useState(false);
  const [openReg, setOpenReg] = React.useState(false);

  return (
    <Container>
      <View className='flex-1 items-center justify-center'>
        <Text className='text-center font-bold text-4xl text-purple-700 mt-8'>
          Bem-vindo de volta!
        </Text>
        <Text className='text-center font-semibold text-md text-zinc-400 px-8 mt-4'>
          Estamos felizes em ter você conosco! Organize suas compras de maneira rápida e prática. 
          Com o nosso app, você pode criar listas personalizadas, adicionar produtos com facilidade, 
          e nunca mais esquecer de comprar aquele item importante. Pronto para tornar suas compras 
          mais eficientes e sem estresse? Vamos começar!
        </Text>
        <Image 
          source={require('../assets/images/decision.png')} 
          style={{ width, height: height * 0.4, resizeMode: 'contain', marginVertical: 20 }}   
          className="flex-2"
        />
        <View className='w-full px-5'>
          <TouchableOpacity 
            onPress={() => setOpen(true)} 
            className='bg-purple-700 items-center justify-center px-full py-4 rounded-full min-w-full my-2'
          >
            <Text className='text-white font-bold text-lg'>
              Login
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => setOpenReg(true)} 
            className='border border-purple-700 items-center justify-center px-full py-4 rounded-full min-w-full my-2'
          >
            <Text className='text-purple-700 font-semibold text-lg'>
              Cadastrar
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <LoginModal open={open} onClose={() => setOpen(false)} /> 
      <RegisterModal open={openReg} onClose={() => setOpenReg(false)} /> 
    </Container>
  );
};

export default Login;