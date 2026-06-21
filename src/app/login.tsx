import React from "react";
import {
  View,
  Image,
  Text,
  useWindowDimensions,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import Container from "../components/container";
import LoginModal from "@/src/components/loginModal";
import RegisterModal from "@/src/components/registerModal";
import { useAutoLogin } from "@/src/components/auth";
import { useTheme } from "@/src/contexts/ThemeContext";
import { router } from "expo-router";

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
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
        showsVerticalScrollIndicator={false}
      >
        <View className="items-center px-5">
          <Text
            style={{
              textAlign: "center",
              fontWeight: "bold",
              fontSize: 32,
              color: colors.primary,
              marginTop: 16,
            }}
          >
            Bem-vindo de volta!
          </Text>
          <Text
            style={{
              textAlign: "center",
              fontWeight: "600",
              fontSize: 15,
              color: isDark ? colors.textSecondary : "#9ca3af",
              paddingHorizontal: 16,
              marginTop: 12,
            }}
          >
            Estamos felizes em ter você conosco! Organize suas compras de maneira
            rápida e prática.
          </Text>
          <Image
            source={require("../assets/images/decision.png")}
            style={{
              width: width * 0.8,
              height: height * 0.3,
              resizeMode: "contain",
              marginVertical: 12,
            }}
          />
          <View className="w-full">
            <TouchableOpacity
              onPress={() => setOpen(true)}
              style={{
                backgroundColor: colors.primary,
                alignItems: "center",
                justifyContent: "center",
                paddingVertical: 14,
                borderRadius: 999,
                marginVertical: 6,
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
                paddingVertical: 14,
                borderRadius: 999,
                marginVertical: 6,
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
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              paddingVertical: 12,
              marginTop: 8,
              marginBottom: 24,
            }}
          >
            <Text
              style={{
                color: colors.textSecondary,
                fontWeight: "500",
                fontSize: 14,
                textAlign: "center",
              }}
            >
              Voltar ao início
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <LoginModal open={open} onClose={() => setOpen(false)} />
      <RegisterModal open={openReg} onClose={() => setOpenReg(false)} />
    </Container>
  );
};

export default Login;
