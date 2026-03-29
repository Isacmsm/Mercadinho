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
  // 2. ESTADOS TIPADOS
  const [produtos, setProdutos] = useState<Produto[]>([]);
  
  // Estados do Formulário
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
  }
};

const salvarProduto = async () => {
    if (!nome || !preco || !quantidade || !imagem) {
      Alert.alert("Atenção", "Preencha os campos obrigatórios e adicione uma URL de imagem.");
      return;
    }

    const novoProduto: Produto = {
      id: idEditando ? idEditando : Date.now().toString(),
      nome,
      categoria,
      preco: parseFloat(preco), 
      quantidade: parseInt(quantidade, 10),
      descricao,
      imagem,
      status
    };

    try {
      let novaLista: Produto[] = [];
      if (idEditando) {
        novaLista = produtos.map(p => p.id === idEditando ? novoProduto : p);
      } else {
        novaLista = [...produtos, novoProduto];
      }

      await AsyncStorage.setItem('@crud_produtos', JSON.stringify(novaLista));
      setProdutos(novaLista);
      limparFormulario();
    } catch (e) {
      Alert.alert("Erro", "Falha ao salvar o produto.");
    }
  };

const excluirProduto = (id: string) => {
    Alert.alert(
      "Excluir",
      "Tem certeza que deseja excluir este produto?",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Excluir", style: "destructive",
          onPress: async () => {
            const novaLista = produtos.filter(p => p.id !== id);
            await AsyncStorage.setItem('@crud_produtos', JSON.stringify(novaLista));
            setProdutos(novaLista);
          }
        }
      ]
    );
  };

  const prepararEdicao = (produto: Produto) => {
    setIdEditando(produto.id);
    setNome(produto.nome);
    setCategoria(produto.categoria);
    setPreco(produto.preco.toString());
    setQuantidade(produto.quantidade.toString());
    setDescricao(produto.descricao);
    setImagem(produto.imagem);
    setStatus(produto.status);
  };

  const limparFormulario = () => {
    setIdEditando(null); setNome(''); setCategoria('');
    setPreco(''); setQuantidade(''); setDescricao('');
    setImagem(''); setStatus('Ativo');
  };