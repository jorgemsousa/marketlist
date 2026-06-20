import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/src/database/firebaseConfig";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useTheme } from "@/src/contexts/ThemeContext";

type Props = {
  onClose: () => void;
};

const Register = ({ onClose }: Props) => {
  const { colors, isDark } = useTheme();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordRepeat, setPasswordRepeat] = useState("");
  const [image, setImage] = useState("");
  const [nameFocused, setNameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordRepeatFocused, setPasswordRepeatFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [imageFocused, setImageFocused] = useState(false);

  const handleCreateAccount = async () => {
    if (password !== passwordRepeat) {
      alert("As senhas não coincidem!");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        name: name,
        image: image,
        createdAt: new Date(),
      });

      Alert.alert("Sucesso", "Cadastro realizado!");
      onClose();
    } catch (error: any) {
      console.error("Erro ao criar usuário:", error.code, error.message);
      alert(error.message);
    }
  };

  const inputStyle = (focused: boolean) => ({
    borderWidth: 2,
    borderColor: focused ? colors.primary : colors.border,
    borderRadius: 999,
    padding: 16,
    marginBottom: 16,
    backgroundColor: colors.card,
    color: colors.text,
  });

  return (
    <View>
      <TextInput
        placeholder="Nome"
        placeholderTextColor={colors.textSecondary}
        onChangeText={setName}
        value={name}
        onFocus={() => setNameFocused(true)}
        onBlur={() => setNameFocused(false)}
        style={inputStyle(nameFocused)}
      />
      <TextInput
        placeholder="E-mail"
        placeholderTextColor={colors.textSecondary}
        keyboardType="email-address"
        onChangeText={setEmail}
        onFocus={() => setEmailFocused(true)}
        onBlur={() => setEmailFocused(false)}
        style={inputStyle(emailFocused)}
      />
      <TextInput
        placeholder="Senha"
        placeholderTextColor={colors.textSecondary}
        secureTextEntry
        onChangeText={setPassword}
        onFocus={() => setPasswordFocused(true)}
        onBlur={() => setPasswordFocused(false)}
        style={inputStyle(passwordFocused)}
      />
      <TextInput
        placeholder="Repita a Senha"
        placeholderTextColor={colors.textSecondary}
        secureTextEntry
        onChangeText={setPasswordRepeat}
        onFocus={() => setPasswordRepeatFocused(true)}
        onBlur={() => setPasswordRepeatFocused(false)}
        style={inputStyle(passwordRepeatFocused)}
      />
      <TextInput
        placeholder="URL da imagem"
        placeholderTextColor={colors.textSecondary}
        onChangeText={setImage}
        onFocus={() => setImageFocused(true)}
        onBlur={() => setImageFocused(false)}
        style={{ ...inputStyle(imageFocused), marginBottom: 40 }}
      />
      <TouchableOpacity
        onPress={handleCreateAccount}
        style={{
          backgroundColor: colors.primary,
          padding: 16,
          borderRadius: 999,
          marginBottom: 16,
        }}
      >
        <Text
          style={{
            color: "#fff",
            fontWeight: "bold",
            textAlign: "center",
            fontSize: 18,
          }}
        >
          Cadastrar
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => onClose()}
        style={{
          borderWidth: 1,
          borderColor: colors.primary,
          alignItems: "center",
          justifyContent: "center",
          paddingVertical: 16,
          borderRadius: 999,
        }}
      >
        <Text
          style={{
            color: colors.primary,
            fontWeight: "bold",
            textAlign: "center",
            fontSize: 18,
          }}
        >
          Cancelar
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default Register;
