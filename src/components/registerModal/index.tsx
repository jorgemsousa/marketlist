import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  Animated,
  Easing,
  Modal,
  Image,
  useWindowDimensions,
} from "react-native";
import Register from "../register";
import { useTheme } from "@/src/contexts/ThemeContext";

type Props = {
  open: boolean;
  onClose: () => void;
};

const RegisterModal = ({ open, onClose }: Props) => {
  const { colors, isDark } = useTheme();
  const [modalVisible, setModalVisible] = useState(open);
  const { width, height } = useWindowDimensions();
  const slideAnim = useRef(new Animated.Value(300)).current;

  const slideIn = React.useCallback(() => {
    setModalVisible(true);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 500,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [slideAnim]);

  const slideOut = React.useCallback(() => {
    Animated.timing(slideAnim, {
      toValue: 700,
      duration: 500,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start(() => {
      setModalVisible(false);
      onClose();
    });
  }, [slideAnim, onClose]);

  useEffect(() => {
    if (open) {
      slideIn();
    } else {
      slideOut();
    }
  }, [open, slideIn, slideOut]);

  return (
    <View className="flex-4 justify-center items-center">
      {modalVisible && (
        <Modal transparent={true} visible={modalVisible} animationType="none">
          <View className="flex-1 justify-end">
            <Animated.View
              style={{
                transform: [{ translateY: slideAnim }],
                backgroundColor: colors.white,
                borderWidth: 1,
                borderColor: colors.border,
                padding: 24,
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
              }}
            >
              <Text
                style={{
                  color: colors.primary,
                  textAlign: "center",
                  fontWeight: "bold",
                  fontSize: 30,
                  marginBottom: 16,
                }}
              >
                Cadastro
              </Text>
              <Image
                source={require("../../assets/images/register.png")}
                style={{
                  width,
                  height: height * 0.2,
                  resizeMode: "contain",
                  marginVertical: 20,
                }}
              />
              <Register onClose={onClose} />
            </Animated.View>
          </View>
        </Modal>
      )}
    </View>
  );
};
export default RegisterModal;
