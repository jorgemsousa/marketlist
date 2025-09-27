import React from 'react';
import { StyleSheet } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';

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
  return (
    <RNPickerSelect
      onValueChange={onChange}
      items={setores}
      placeholder={{ label: 'Selecione o setor...', value: '' }}
      style={pickerSelectStyles}
      value={value}
      useNativeAndroidPickerStyle={false}
    />
  );
}

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: '#7e22ce',
    borderRadius: 25,
    color: '#3f3e3eff',
    paddingRight: 30,
    backgroundColor: '#F3F4F6',
    marginBottom: 16,
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 2,
    borderColor: '#7e22ce',
    borderRadius: 25,
    color: '#3f3e3eff',
    paddingRight: 30,
    backgroundColor: '#F3F4F6',
    marginBottom: 16,
  },
});
