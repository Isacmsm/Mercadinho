import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, Image, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';


interface Produto {
  id: string;
  nome: string;
  categoria: string;
  preco: number;
  quantidade: number;
  descricao: string;
  imagem: string;
  status: 'Ativo' | 'Inativo';
}

export default function App() {
  
  const [produtos, setProdutos] = useState<Produto[]>([]);
  
  const [idEditando, setIdEditando] = useState<string | null>(null);
  const [nome, setNome] = useState<string>('');
  const [categoria, setCategoria] = useState<string>('');
  const [preco, setPreco] = useState<string>(''); // Mantemos como string no input para facilitar a digitação
  const [quantidade, setQuantidade] = useState<string>('');
  const [descricao, setDescricao] = useState<string>('');
  const [imagem, setImagem] = useState<string>('');
  const [status, setStatus] = useState<'Ativo' | 'Inativo'>('Ativo');

  useEffect(() => {
    carregarProdutos();
  }, []);

  const carregarProdutos = async () => {
    try {
      const dados = await AsyncStorage.getItem('@crud_produtos');
      if (dados) {
        setProdutos(JSON.parse(dados) as Produto[]);
      }
    } catch (e) {
      Alert.alert("Erro", "Não foi possível carregar os produtos.");
    }
  };
}