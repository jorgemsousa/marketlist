import React from "react";
import {
  View,
  Image,
  Text,
  useWindowDimensions,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import Container from "../components/container";
import LoginModal from "@/src/components/loginModal";
import RegisterModal from "@/src/components/registerModal";
import { useAutoLogin } from "@/src/components/auth";
import { useTheme } from "@/src/contexts/ThemeContext";

const Login = () => {
  const { width, height } = useWindowDimensions();
  const { colors, isDark } = useTheme();
  const [open, setOpen] = React.useState(false);
  const [openReg, setOpenReg] = React.useState(false);
  const { isChecking } = useAutoLogin();

  if (isChecking) {
    return (
      <Container>
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={colors.primary} />
          <Text
            style={{
              marginTop: 16,
              color: colors.primary,
              fontWeight: "600",
            }}
          >
            Verificando login...
          </Text>
        </View>
      </Container>
    );
  }

  return (
    <Container>
      <View className="flex-2 justify-center items-center mt-20">
        <Text
          style={{
            textAlign: "center",
            fontWeight: "bold",
            fontSize: 36,
            color: colors.primary,
            marginTop: 32,
          }}
        >
          Bem-vindo de volta!
        </Text>
        <Text
          style={{
            textAlign: "center",
            fontWeight: "600",
            fontSize: 16,
            color: isDark ? colors.textSecondary : "#9ca3af",
            paddingHorizontal: 32,
            marginTop: 16,
          }}
        >
          Estamos felizes em ter você conosco! Organize suas compras de maneira
          rápida e prática. Com o nosso app, você pode criar listas
          personalizadas, adicionar produtos com facilidade, e nunca mais
          esquecer de comprar aquele item importante. Pronto para tornar suas
          compras mais eficientes e sem estresse? Vamos começar!
        </Text>
        <Image
          source={require("../assets/images/decision.png")}
          style={{
            width,
            height: height * 0.4,
            resizeMode: "contain",
            marginVertical: 20,
          }}
        />
        <View className="w-full px-5">
          <TouchableOpacity
            onPress={() => setOpen(true)}
            style={{
              backgroundColor: colors.primary,
              alignItems: "center",
              justifyContent: "center",
              paddingVertical: 16,
              borderRadius: 999,
              marginVertical: 8,
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 18 }}>
              Login
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setOpenReg(true)}
            style={{
              borderWidth: 1,
              borderColor: colors.primary,
              alignItems: "center",
              justifyContent: "center",
              paddingVertical: 16,
              borderRadius: 999,
              marginVertical: 8,
            }}
          >
            <Text
              style={{
                color: colors.primary,
                fontWeight: "600",
                fontSize: 18,
              }}
            >
              Cadastrar
            </Text>
          </TouchableOpacity>
        </View>
        <LoginModal open={open} onClose={() => setOpen(false)} />
        <RegisterModal open={openReg} onClose={() => setOpenReg(false)} />
      </View>
    </Container>
  );
};

export default Login;
