import React, { useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  FlatList,
} from 'react-native';

const setores = [
  { label: 'Açougue', value: 'Açougue' },
  { label: 'Frios e Laticínios', value: 'Frios e Laticínios' },
  { label: 'Hortifrúti', value: 'Hortifrúti' },
  { label: 'Padaria', value: 'Padaria' },
  { label: 'Mercearia', value: 'Mercearia' },
  { label: 'Adega e Bebidas', value: 'Adega e Bebidas' },
  { label: 'Higiene Pessoal e Beleza', value: 'Higiene Pessoal e Beleza' },
  { label: 'Limpeza Doméstica', value: 'Limpeza Doméstica' },
  { label: 'Rotisseria', value: 'Rotisseria' },
  { label: 'Pescados/Peixaria', value: 'Pescados/Peixaria' },
  { label: 'Bazar', value: 'Bazar' },
];

type SelectSetorProps = {
  value: string;
  onChange: (value: string) => void;
};

export default function SelectSetor({ value, onChange }: SelectSetorProps) {
  const [modalVisible, setModalVisible] = useState(false);

  const handleSelect = (selectedValue: string) => {
    onChange(selectedValue);
    setModalVisible(false);
  };

  return (
    <View>
      <TouchableOpacity
        style={styles.input}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.inputText}>
          {value || 'Selecione o setor...'}
        </Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <FlatList
              data={setores}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.option}
                  onPress={() => handleSelect(item.value)}
                >
                  <Text style={styles.optionText}>{item.label}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: '#7e22ce',
    borderRadius: 25,
    backgroundColor: '#F3F4F6',
    marginBottom: 16,
  },
  inputText: {
    color: '#3f3e3eff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
  },
  option: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  optionText: {
    fontSize: 16,
    color: '#3f3e3eff',
  },
  closeButton: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#7e22ce',
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});