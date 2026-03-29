import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { Alert, Button, FlatList, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';


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
        novaLista = produtos.map((p: Produto) => p.id === idEditando ? novoProduto : p);
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
            const novaLista = produtos.filter((p: Produto) => p.id !== id);
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
    setIdEditando(null);
    setNome('');
    setCategoria('');
    setPreco('');
    setQuantidade('');
    setDescricao('');
    setImagem('');
    setStatus('Ativo');
  };

  const renderItem = ({ item }: { item: Produto }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.imagem }} style={styles.imagemProduto} />
      <Text style={styles.tituloCard}>{item.nome}</Text>
      <Text>Categoria: {item.categoria}</Text>
      <Text>Preço: R$ {item.preco.toFixed(2)} | Qtd: {item.quantidade}</Text>
      <Text>Status: {item.status}</Text>
      
      <View style={styles.botoesCard}>
        <TouchableOpacity style={styles.btnEditar} onPress={() => prepararEdicao(item)}>
          <Text style={styles.textoBtn}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnExcluir} onPress={() => excluirProduto(item.id)}>
          <Text style={styles.textoBtn}>Excluir</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.tituloForm}>{idEditando ? 'Editar Produto' : 'Novo Produto'}</Text>
        
        <TextInput style={styles.input} placeholder="Nome do Produto *" value={nome} onChangeText={setNome} />
        <TextInput style={styles.input} placeholder="Categoria" value={categoria} onChangeText={setCategoria} />
        <TextInput style={styles.input} placeholder="Preço *" value={preco} onChangeText={setPreco} keyboardType="numeric" />
        <TextInput style={styles.input} placeholder="Quantidade *" value={quantidade} onChangeText={setQuantidade} keyboardType="numeric" />
        <TextInput style={styles.input} placeholder="Descrição" value={descricao} onChangeText={setDescricao} multiline numberOfLines={2} />
        <TextInput style={styles.input} placeholder="URL da Imagem *" value={imagem} onChangeText={setImagem} keyboardType="url" />
        
        <Button title={idEditando ? "Atualizar Produto" : "Adicionar Produto"} onPress={salvarProduto} />
        {idEditando && <View style={{marginTop: 5}}><Button title="Cancelar Edição" color="red" onPress={limparFormulario} /></View>}
      </View>

      <FlatList
        data={produtos}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', paddingTop: 40 },
  form: { padding: 20, backgroundColor: '#fff', elevation: 3, marginBottom: 10 },
  tituloForm: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 5, padding: 10, marginBottom: 10 },
  card: { backgroundColor: '#fff', margin: 10, padding: 15, borderRadius: 8, elevation: 2 },
  imagemProduto: { width: '100%', height: 150, borderRadius: 5, marginBottom: 10, resizeMode: 'cover' },
  tituloCard: { fontSize: 18, fontWeight: 'bold' },
  botoesCard: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  btnEditar: { backgroundColor: '#007bff', padding: 10, borderRadius: 5, flex: 1, marginRight: 5, alignItems: 'center' },
  btnExcluir: { backgroundColor: '#dc3545', padding: 10, borderRadius: 5, flex: 1, marginLeft: 5, alignItems: 'center' },
  textoBtn: { color: '#fff', fontWeight: 'bold' }
});