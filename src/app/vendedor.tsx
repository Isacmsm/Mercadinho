import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors, Spacing } from "@/constants/theme";

const VERDE = "#2E7D32";
const VERMELHO = "#C62828";
const PRODUTOS_KEY = "@crud_produtos";
const URL_IMG_REGEX = /^https?:\/\/.+/i;

interface Produto {
  id: string;
  nome: string;
  categoria: string;
  preco: number;
  quantidade: number;
  descricao: string;
  imagem: string;
  status: "Ativo" | "Inativo";
}

type Ordenacao = "nome_az" | "preco_asc" | "preco_desc";

const OPCOES_ORDEM: { key: Ordenacao; label: string }[] = [
  { key: "nome_az", label: "Nome A-Z" },
  { key: "preco_asc", label: "Preço ↑" },
  { key: "preco_desc", label: "Preço ↓" },
];

export default function VendedorScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === "dark" ? "dark" : "light"];

  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [idEditando, setIdEditando] = useState<string | null>(null);
  const [nome, setNome] = useState("");
  const [categoria, setCategoria] = useState("");
  const [preco, setPreco] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [descricao, setDescricao] = useState("");
  const [imagem, setImagem] = useState("");
  const [status, setStatus] = useState<"Ativo" | "Inativo">("Ativo");
  const [formAberto, setFormAberto] = useState(false);
  const [erroImagem, setErroImagem] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState("Todos");
  const [ordenacao, setOrdenacao] = useState<Ordenacao>("nome_az");

  useFocusEffect(
    useCallback(() => {
      carregarProdutos();
    }, [])
  );

  const carregarProdutos = async () => {
    try {
      const dados = await AsyncStorage.getItem(PRODUTOS_KEY);
      if (dados) setProdutos(JSON.parse(dados) as Produto[]);
    } catch {
      Alert.alert("Erro", "Não foi possível carregar os produtos.");
    }
  };

  const categorias = useMemo(() => {
    const cats = produtos
      .map((p) => p.categoria)
      .filter(Boolean)
      .filter((v, i, a) => a.indexOf(v) === i);
    return ["Todos", ...cats];
  }, [produtos]);

  const produtosExibidos = useMemo(() => {
    let lista = [...produtos];
    if (categoriaFiltro !== "Todos") {
      lista = lista.filter((p) => p.categoria === categoriaFiltro);
    }
    return lista.sort((a, b) => {
      if (ordenacao === "nome_az") return a.nome.localeCompare(b.nome);
      if (ordenacao === "preco_asc") return a.preco - b.preco;
      return b.preco - a.preco;
    });
  }, [produtos, categoriaFiltro, ordenacao]);

  const salvarProduto = async () => {
    if (!nome || !preco || !quantidade || !imagem) {
      Alert.alert(
        "Atenção",
        "Preencha os campos obrigatórios e adicione uma URL de imagem."
      );
      return;
    }

    if (!URL_IMG_REGEX.test(imagem.trim())) {
      setErroImagem("URL inválida. Use http:// ou https://");
      return;
    }
    setErroImagem("");

    const novoProduto: Produto = {
      id: idEditando ?? Date.now().toString(),
      nome,
      categoria,
      preco: parseFloat(preco),
      quantidade: parseInt(quantidade, 10),
      descricao,
      imagem: imagem.trim(),
      status,
    };

    try {
      const novaLista = idEditando
        ? produtos.map((p) => (p.id === idEditando ? novoProduto : p))
        : [...produtos, novoProduto];

      await AsyncStorage.setItem(PRODUTOS_KEY, JSON.stringify(novaLista));
      setProdutos(novaLista);
      limparFormulario();
    } catch {
      Alert.alert("Erro", "Falha ao salvar o produto.");
    }
  };

  const executarExclusao = async (id: string) => {
    try {
      const novaLista = produtos.filter((p) => p.id !== id);
      await AsyncStorage.setItem(PRODUTOS_KEY, JSON.stringify(novaLista));
      setProdutos(novaLista);
    } catch {
      Alert.alert("Erro", "Não foi possível excluir o produto.");
    }
  };

  const excluirProduto = (id: string) => {
    if (Platform.OS === "web") {
      const confirmado = window.confirm(
        "Tem certeza que deseja excluir este produto?"
      );
      if (confirmado) executarExclusao(id);
    } else {
      Alert.alert("Excluir", "Tem certeza que deseja excluir este produto?", [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: () => executarExclusao(id),
        },
      ]);
    }
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
    setErroImagem("");
    setFormAberto(true);
  };

  const limparFormulario = () => {
    setIdEditando(null);
    setNome("");
    setCategoria("");
    setPreco("");
    setQuantidade("");
    setDescricao("");
    setImagem("");
    setStatus("Ativo");
    setErroImagem("");
    setFormAberto(false);
  };

  const inputStyle = [
    styles.input,
    {
      backgroundColor: colors.backgroundElement,
      color: colors.text,
      borderColor: colors.backgroundSelected,
    },
  ];

  const renderItem = ({ item }: { item: Produto }) => (
    <View style={[styles.card, { backgroundColor: colors.backgroundElement }]}>
      <Image source={{ uri: item.imagem }} style={styles.imagemProduto} />

      <View style={styles.cardCorpo}>
        <View style={styles.cardTopo}>
          <ThemedText
            type="smallBold"
            style={styles.tituloCard}
            numberOfLines={1}
          >
            {item.nome}
          </ThemedText>
          <View
            style={[
              styles.badge,
              {
                backgroundColor:
                  item.status === "Ativo" ? VERDE : colors.backgroundSelected,
              },
            ]}
          >
            <ThemedText
              type="small"
              style={[
                styles.badgeTexto,
                {
                  color:
                    item.status === "Ativo" ? "#fff" : colors.textSecondary,
                },
              ]}
            >
              {item.status}
            </ThemedText>
          </View>
        </View>

        {item.categoria !== "" && (
          <ThemedText type="small" themeColor="textSecondary">
            {item.categoria}
          </ThemedText>
        )}

        <View style={styles.cardPrecoLinha}>
          <ThemedText type="smallBold" style={{ color: VERDE, fontSize: 16 }}>
            R$ {item.preco.toFixed(2)}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Qtd: {item.quantidade}
          </ThemedText>
        </View>

        {item.descricao !== "" && (
          <ThemedText type="small" themeColor="textSecondary" numberOfLines={2}>
            {item.descricao}
          </ThemedText>
        )}

        <View style={styles.botoesCard}>
          <TouchableOpacity
            style={[styles.btnCard, { backgroundColor: VERDE }]}
            onPress={() => prepararEdicao(item)}
            activeOpacity={0.8}
          >
            <ThemedText type="smallBold" style={styles.btnCardTexto}>
              Editar
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.btnCard, styles.btnExcluir]}
            onPress={() => excluirProduto(item.id)}
            activeOpacity={0.8}
          >
            <ThemedText
              type="smallBold"
              style={[styles.btnCardTexto, { color: VERMELHO }]}
            >
              Excluir
            </ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const insets = useSafeAreaInsets();
  const contentPadding = Platform.select({
    web: { paddingTop: Spacing.six },
    default: { paddingTop: insets.top },
  });

  return (
    <ThemedView style={[styles.container, contentPadding]}>
      {/* Cabeçalho */}
      <View style={styles.cabecalho}>
        <ThemedText type="subtitle" style={styles.titulo}>
          Gerenciar
        </ThemedText>
        <TouchableOpacity
          style={[styles.btnNovo, { backgroundColor: VERDE }]}
          onPress={() => {
            if (formAberto) limparFormulario();
            else setFormAberto(true);
          }}
          activeOpacity={0.8}
        >
          <ThemedText type="smallBold" style={styles.btnNovoTexto}>
            {formAberto ? "Fechar" : "+ Novo"}
          </ThemedText>
        </TouchableOpacity>
      </View>

      {/* Formulário */}
      {formAberto && (
        <View>
          <ScrollView
            style={[
              styles.form,
              { backgroundColor: colors.backgroundElement },
            ]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <ThemedText type="smallBold" style={styles.tituloForm}>
              {idEditando ? "Editar Produto" : "Novo Produto"}
            </ThemedText>

            <ThemedText
              type="small"
              themeColor="textSecondary"
              style={styles.label}
            >
              Nome *
            </ThemedText>
            <TextInput
              style={inputStyle}
              placeholder="Nome do produto"
              placeholderTextColor={colors.textSecondary}
              value={nome}
              onChangeText={setNome}
            />

            <ThemedText
              type="small"
              themeColor="textSecondary"
              style={styles.label}
            >
              Categoria
            </ThemedText>
            <TextInput
              style={inputStyle}
              placeholder="Ex: Laticínios, Bebidas..."
              placeholderTextColor={colors.textSecondary}
              value={categoria}
              onChangeText={setCategoria}
            />

            <View style={styles.linhaMetade}>
              <View style={styles.metade}>
                <ThemedText
                  type="small"
                  themeColor="textSecondary"
                  style={styles.label}
                >
                  Preço *
                </ThemedText>
                <TextInput
                  style={inputStyle}
                  placeholder="0,00"
                  placeholderTextColor={colors.textSecondary}
                  value={preco}
                  onChangeText={setPreco}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.metade}>
                <ThemedText
                  type="small"
                  themeColor="textSecondary"
                  style={styles.label}
                >
                  Quantidade *
                </ThemedText>
                <TextInput
                  style={inputStyle}
                  placeholder="0"
                  placeholderTextColor={colors.textSecondary}
                  value={quantidade}
                  onChangeText={setQuantidade}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <ThemedText
              type="small"
              themeColor="textSecondary"
              style={styles.label}
            >
              Descrição
            </ThemedText>
            <TextInput
              style={[inputStyle, styles.inputMultiline]}
              placeholder="Descrição opcional"
              placeholderTextColor={colors.textSecondary}
              value={descricao}
              onChangeText={setDescricao}
              multiline
              numberOfLines={2}
            />

            <ThemedText
              type="small"
              themeColor="textSecondary"
              style={styles.label}
            >
              URL da Imagem *
            </ThemedText>
            <TextInput
              style={[
                inputStyle,
                erroImagem !== "" && { borderColor: VERMELHO },
              ]}
              placeholder="https://..."
              placeholderTextColor={colors.textSecondary}
              value={imagem}
              onChangeText={(v) => {
                setImagem(v);
                if (erroImagem) setErroImagem("");
              }}
              keyboardType="url"
              autoCapitalize="none"
            />
            {erroImagem !== "" && (
              <ThemedText type="small" style={styles.erroTexto}>
                {erroImagem}
              </ThemedText>
            )}

            <ThemedText
              type="small"
              themeColor="textSecondary"
              style={styles.label}
            >
              Status
            </ThemedText>
            <View style={styles.statusToggle}>
              {(["Ativo", "Inativo"] as const).map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[
                    styles.statusOpcao,
                    {
                      backgroundColor:
                        status === s ? VERDE : colors.backgroundSelected,
                    },
                  ]}
                  onPress={() => setStatus(s)}
                  activeOpacity={0.8}
                >
                  <ThemedText
                    type="smallBold"
                    style={{
                      color: status === s ? "#fff" : colors.textSecondary,
                    }}
                  >
                    {s}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.botoesForm}>
              <TouchableOpacity
                style={[styles.botaoForm, { backgroundColor: VERDE }]}
                onPress={salvarProduto}
                activeOpacity={0.8}
              >
                <ThemedText type="smallBold" style={styles.botaoFormTexto}>
                  {idEditando ? "Atualizar" : "Adicionar"}
                </ThemedText>
              </TouchableOpacity>
              {idEditando && (
                <TouchableOpacity
                  style={[
                    styles.botaoForm,
                    styles.botaoCancelar,
                    { borderColor: VERMELHO },
                  ]}
                  onPress={limparFormulario}
                  activeOpacity={0.8}
                >
                  <ThemedText type="smallBold" style={{ color: VERMELHO }}>
                    Cancelar
                  </ThemedText>
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>
        </View>
      )}

      {/* Filtros e Ordenação */}
      {!formAberto && (
        <View
          style={[
            styles.controlesContainer,
            { backgroundColor: colors.backgroundElement },
          ]}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriasLista}
          >
            {categorias.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoriaBtn,
                  {
                    backgroundColor:
                      categoriaFiltro === cat
                        ? VERDE
                        : colors.backgroundSelected,
                  },
                ]}
                onPress={() => setCategoriaFiltro(cat)}
                activeOpacity={0.8}
              >
                <ThemedText
                  type="small"
                  style={{
                    color:
                      categoriaFiltro === cat ? "#fff" : colors.textSecondary,
                  }}
                >
                  {cat}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.ordemLinha}>
            {OPCOES_ORDEM.map((op) => (
              <TouchableOpacity
                key={op.key}
                style={[
                  styles.ordemBtn,
                  {
                    backgroundColor:
                      ordenacao === op.key ? VERDE : colors.backgroundSelected,
                  },
                ]}
                onPress={() => setOrdenacao(op.key)}
                activeOpacity={0.8}
              >
                <ThemedText
                  type="small"
                  style={{
                    color:
                      ordenacao === op.key ? "#fff" : colors.textSecondary,
                    fontSize: 12,
                  }}
                >
                  {op.label}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Lista */}
      {produtosExibidos.length === 0 && !formAberto ? (
        <View style={styles.vazio}>
          <ThemedText style={styles.vazioEmoji}>📦</ThemedText>
          <ThemedText type="subtitle" style={styles.vazioTitulo}>
            Nenhum produto
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {categoriaFiltro !== "Todos"
              ? "Nenhum produto nesta categoria"
              : 'Toque em "+ Novo" para cadastrar'}
          </ThemedText>
        </View>
      ) : (
        !formAberto && (
          <FlatList
            data={produtosExibidos}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.lista}
            showsVerticalScrollIndicator={false}
          />
        )
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  cabecalho: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.two,
  },
  titulo: { fontSize: 28 },
  btnNovo: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: Spacing.two,
  },
  btnNovoTexto: { color: "#fff" },
  form: {
    marginHorizontal: Spacing.three,
    marginBottom: Spacing.two,
    borderRadius: Spacing.three,
    padding: Spacing.three,
    maxHeight: 480,
  },
  tituloForm: {
    fontSize: 16,
    marginBottom: Spacing.three,
    textAlign: "center",
  },
  label: { marginBottom: 4 },
  input: {
    height: 48,
    borderRadius: Spacing.two,
    borderWidth: 1,
    paddingHorizontal: Spacing.three,
    fontSize: 15,
    marginBottom: Spacing.two,
  },
  inputMultiline: {
    height: 72,
    paddingTop: Spacing.two,
    textAlignVertical: "top",
  },
  linhaMetade: {
    flexDirection: "row",
    gap: Spacing.two,
  },
  metade: { flex: 1 },
  statusToggle: {
    flexDirection: "row",
    gap: Spacing.two,
    marginBottom: Spacing.three,
  },
  statusOpcao: {
    flex: 1,
    height: 40,
    borderRadius: Spacing.two,
    justifyContent: "center",
    alignItems: "center",
  },
  botoesForm: {
    gap: Spacing.two,
    marginTop: Spacing.one,
  },
  botaoForm: {
    height: 48,
    borderRadius: Spacing.two,
    justifyContent: "center",
    alignItems: "center",
  },
  botaoFormTexto: { color: "#fff", fontSize: 15 },
  botaoCancelar: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
  },
  erroTexto: {
    color: VERMELHO,
    marginTop: -Spacing.one,
    marginBottom: Spacing.two,
  },
  controlesContainer: {
    marginHorizontal: Spacing.three,
    marginBottom: Spacing.two,
    borderRadius: Spacing.three,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  categoriasLista: {
    gap: Spacing.two,
    paddingRight: Spacing.two,
  },
  categoriaBtn: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: Spacing.three,
  },
  ordemLinha: {
    flexDirection: "row",
    gap: Spacing.two,
  },
  ordemBtn: {
    flex: 1,
    paddingVertical: Spacing.one,
    borderRadius: Spacing.two,
    alignItems: "center",
    justifyContent: "center",
  },
  lista: {
    padding: Spacing.three,
    gap: Spacing.three,
    paddingBottom: Spacing.six,
  },
  card: {
    borderRadius: Spacing.three,
    overflow: "hidden",
  },
  imagemProduto: {
    width: "100%",
    height: 140,
    resizeMode: "cover",
  },
  cardCorpo: {
    padding: Spacing.three,
    gap: Spacing.one,
  },
  cardTopo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  tituloCard: { fontSize: 16, flex: 1, marginRight: Spacing.two },
  badge: {
    paddingHorizontal: Spacing.two,
    paddingVertical: 2,
    borderRadius: Spacing.one,
  },
  badgeTexto: { fontSize: 12 },
  cardPrecoLinha: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: Spacing.one,
  },
  botoesCard: {
    flexDirection: "row",
    gap: Spacing.two,
    marginTop: Spacing.two,
  },
  btnCard: {
    flex: 1,
    height: 40,
    borderRadius: Spacing.two,
    justifyContent: "center",
    alignItems: "center",
  },
  btnExcluir: {
    backgroundColor: "rgba(198, 40, 40, 0.08)",
    borderWidth: 1.5,
    borderColor: VERMELHO,
  },
  btnCardTexto: { color: "#fff", fontSize: 14 },
  vazio: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing.two,
  },
  vazioEmoji: { fontSize: 64 },
  vazioTitulo: { fontSize: 22 },
});
