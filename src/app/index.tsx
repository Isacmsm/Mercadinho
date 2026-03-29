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
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors, Spacing } from "@/constants/theme";

const VERDE = "#2E7D32";
const PRODUTOS_KEY = "@crud_produtos";
const CARRINHO_KEY = "@mercadinho:carrinho";

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

interface ItemCarrinho {
  id: string;
  nome: string;
  preco: number;
  quantidade: number;
}

type Ordenacao = "nome_az" | "preco_asc" | "preco_desc";

const OPCOES_ORDEM: { key: Ordenacao; label: string }[] = [
  { key: "nome_az", label: "Nome A-Z" },
  { key: "preco_asc", label: "Preço ↑" },
  { key: "preco_desc", label: "Preço ↓" },
];

export default function LojaScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === "dark" ? "dark" : "light"];
  const insets = useSafeAreaInsets();

  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [categoriaFiltro, setCategoriaFiltro] = useState("Todos");
  const [ordenacao, setOrdenacao] = useState<Ordenacao>("nome_az");

  useFocusEffect(
    useCallback(() => {
      AsyncStorage.getItem(PRODUTOS_KEY).then((val) => {
        setProdutos(val ? (JSON.parse(val) as Produto[]) : []);
      });
    }, [])
  );

  const categorias = useMemo(() => {
    const cats = produtos
      .filter((p) => p.status === "Ativo")
      .map((p) => p.categoria)
      .filter(Boolean)
      .filter((v, i, a) => a.indexOf(v) === i);
    return ["Todos", ...cats];
  }, [produtos]);

  const produtosExibidos = useMemo(() => {
    let lista = produtos.filter((p) => p.status === "Ativo");
    if (categoriaFiltro !== "Todos") {
      lista = lista.filter((p) => p.categoria === categoriaFiltro);
    }
    return [...lista].sort((a, b) => {
      if (ordenacao === "nome_az") return a.nome.localeCompare(b.nome);
      if (ordenacao === "preco_asc") return a.preco - b.preco;
      return b.preco - a.preco;
    });
  }, [produtos, categoriaFiltro, ordenacao]);

  const adicionarAoCarrinho = async (produto: Produto) => {
    try {
      const dados = await AsyncStorage.getItem(CARRINHO_KEY);
      const itens: ItemCarrinho[] = dados ? JSON.parse(dados) : [];
      const existente = itens.find((i) => i.id === produto.id);

      const novosItens: ItemCarrinho[] = existente
        ? itens.map((i) =>
            i.id === produto.id ? { ...i, quantidade: i.quantidade + 1 } : i
          )
        : [
            ...itens,
            { id: produto.id, nome: produto.nome, preco: produto.preco, quantidade: 1 },
          ];

      await AsyncStorage.setItem(CARRINHO_KEY, JSON.stringify(novosItens));
      Alert.alert("Carrinho", `"${produto.nome}" adicionado ao carrinho.`);
    } catch {
      Alert.alert("Erro", "Não foi possível adicionar ao carrinho.");
    }
  };

  const contentPadding = Platform.select({
    web: { paddingTop: Spacing.six },
    default: { paddingTop: insets.top },
  });

  const renderItem = ({ item }: { item: Produto }) => (
    <View style={[styles.card, { backgroundColor: colors.backgroundElement }]}>
      <Image source={{ uri: item.imagem }} style={styles.imagemProduto} />
      <View style={styles.cardCorpo}>
        <ThemedText type="smallBold" style={styles.tituloCard} numberOfLines={1}>
          {item.nome}
        </ThemedText>

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

        <TouchableOpacity
          style={[styles.btnCarrinho, { backgroundColor: VERDE }]}
          onPress={() => adicionarAoCarrinho(item)}
          activeOpacity={0.8}
        >
          <ThemedText type="smallBold" style={styles.btnCarrinhoTexto}>
            Adicionar ao Carrinho
          </ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ThemedView style={[styles.container, contentPadding]}>
      {/* Cabeçalho */}
      <View style={styles.cabecalho}>
        <ThemedText type="subtitle" style={styles.titulo}>
          Loja
        </ThemedText>
      </View>

      {/* Filtros e Ordenação */}
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
                    categoriaFiltro === cat ? VERDE : colors.backgroundSelected,
                },
              ]}
              onPress={() => setCategoriaFiltro(cat)}
              activeOpacity={0.8}
            >
              <ThemedText
                type="small"
                style={{
                  color: categoriaFiltro === cat ? "#fff" : colors.textSecondary,
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
                  color: ordenacao === op.key ? "#fff" : colors.textSecondary,
                  fontSize: 12,
                }}
              >
                {op.label}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Lista */}
      {produtosExibidos.length === 0 ? (
        <View style={styles.vazio}>
          <ThemedText style={styles.vazioEmoji}>🛍️</ThemedText>
          <ThemedText type="subtitle" style={styles.vazioTitulo}>
            Nenhum produto
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {categoriaFiltro !== "Todos"
              ? "Nenhum produto nesta categoria"
              : "A loja está vazia no momento"}
          </ThemedText>
        </View>
      ) : (
        <FlatList
          data={produtosExibidos}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.lista}
          showsVerticalScrollIndicator={false}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  cabecalho: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.two,
  },
  titulo: { fontSize: 28 },
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
  tituloCard: { fontSize: 16 },
  cardPrecoLinha: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: Spacing.one,
  },
  btnCarrinho: {
    marginTop: Spacing.two,
    height: 40,
    borderRadius: Spacing.two,
    justifyContent: "center",
    alignItems: "center",
  },
  btnCarrinhoTexto: { color: "#fff", fontSize: 14 },
  vazio: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing.two,
  },
  vazioEmoji: { fontSize: 64 },
  vazioTitulo: { fontSize: 22 },
});
