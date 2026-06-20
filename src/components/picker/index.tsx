import React, { useState } from "react";
import {
  Modal,
  Text,
  TouchableOpacity,
  View,
  FlatList,
} from "react-native";
import { useTheme } from "@/src/contexts/ThemeContext";

const setores = [
  { label: "Açougue", value: "Açougue" },
  { label: "Frios e Laticínios", value: "Frios e Laticínios" },
  { label: "Hortifrúti", value: "Hortifrúti" },
  { label: "Padaria", value: "Padaria" },
  { label: "Mercearia", value: "Mercearia" },
  { label: "Adega e Bebidas", value: "Adega e Bebidas" },
  { label: "Higiene Pessoal e Beleza", value: "Higiene Pessoal e Beleza" },
  { label: "Limpeza Doméstica", value: "Limpeza Doméstica" },
  { label: "Rotisseria", value: "Rotisseria" },
  { label: "Pescados/Peixaria", value: "Pescados/Peixaria" },
  { label: "Bazar", value: "Bazar" },
];

type SelectSetorProps = {
  value: string;
  onChange: (value: string) => void;
};

export default function SelectSetor({ value, onChange }: SelectSetorProps) {
  const { colors } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);

  const handleSelect = (selectedValue: string) => {
    onChange(selectedValue);
    setModalVisible(false);
  };

  return (
    <View>
      <TouchableOpacity
        style={{
          paddingVertical: 12,
          paddingHorizontal: 16,
          borderWidth: 2,
          borderColor: colors.primary,
          borderRadius: 25,
          backgroundColor: colors.card,
          marginBottom: 16,
        }}
        onPress={() => setModalVisible(true)}
      >
        <Text style={{ color: value ? colors.text : colors.textSecondary, fontSize: 16 }}>
          {value || "Selecione o setor..."}
        </Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: colors.overlay,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View
            style={{
              width: "80%",
              backgroundColor: colors.white,
              borderRadius: 10,
              padding: 16,
            }}
          >
            <FlatList
              data={setores}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={{
                    paddingVertical: 12,
                    borderBottomWidth: 1,
                    borderBottomColor: colors.border,
                  }}
                  onPress={() => handleSelect(item.value)}
                >
                  <Text style={{ fontSize: 16, color: colors.text }}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              style={{
                marginTop: 16,
                padding: 12,
                backgroundColor: colors.primary,
                borderRadius: 8,
                alignItems: "center",
              }}
              onPress={() => setModalVisible(false)}
            >
              <Text style={{ color: "#fff", fontSize: 16 }}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
