import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useCallback, useState } from 'react';
import {
  Alert,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Spacing } from '@/constants/theme';

const VERDE = '#2E7D32';

// Chave compartilhada com a tela de produtos (index.tsx)
export const CARRINHO_KEY = '@mercadinho:carrinho';

export type ItemCarrinho = {
  id: string;
  nome: string;
  preco: number;
  quantidade: number;
};

function formatarPreco(valor: number) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function CarrinhoScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const [itens, setItens] = useState<ItemCarrinho[]>([]);
  const [finalizando, setFinalizando] = useState(false);

  useFocusEffect(
    useCallback(() => {
      AsyncStorage.getItem(CARRINHO_KEY).then((val) => {
        setItens(val ? JSON.parse(val) : []);
      });
    }, [])
  );

  async function atualizarQuantidade(id: string, delta: number) {
    const novos = itens
      .map((item) =>
        item.id === id ? { ...item, quantidade: item.quantidade + delta } : item
      )
      .filter((item) => item.quantidade > 0);
    setItens(novos);
    await AsyncStorage.setItem(CARRINHO_KEY, JSON.stringify(novos));
  }

  async function removerItem(id: string) {
    const novos = itens.filter((item) => item.id !== id);
    setItens(novos);
    await AsyncStorage.setItem(CARRINHO_KEY, JSON.stringify(novos));
  }

  async function finalizarPedido() {
    setFinalizando(true);
    try {
      await AsyncStorage.removeItem(CARRINHO_KEY);
      setItens([]);
      Alert.alert(
        'Pedido realizado!',
        'Seu pedido foi recebido e está sendo preparado.',
        [{ text: 'OK' }]
      );
    } finally {
      setFinalizando(false);
    }
  }

  function confirmarFinalizacao() {
    Alert.alert('Finalizar pedido', `Total: ${formatarPreco(total)}\n\nConfirmar?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Confirmar', onPress: finalizarPedido },
    ]);
  }

  const total = itens.reduce((soma, item) => soma + item.preco * item.quantidade, 0);
  const totalItens = itens.reduce((soma, item) => soma + item.quantidade, 0);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>

        <View style={styles.cabecalho}>
          <ThemedText type="subtitle" style={styles.titulo}>
            Carrinho
          </ThemedText>
          {totalItens > 0 && (
            <ThemedText type="small" themeColor="textSecondary">
              {totalItens} {totalItens === 1 ? 'item' : 'itens'}
            </ThemedText>
          )}
        </View>

        {itens.length === 0 ? (
          <View style={styles.vazio}>
            <ThemedText style={styles.vazioBigEmoji}>🛒</ThemedText>
            <ThemedText type="subtitle" style={styles.vazioTitulo}>
              Carrinho vazio
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary" style={styles.vazioSub}>
              Adicione produtos para continuar
            </ThemedText>
          </View>
        ) : (
          <>
            <FlatList
              data={itens}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.lista}
              ItemSeparatorComponent={() => (
                <View style={[styles.separador, { backgroundColor: colors.backgroundSelected }]} />
              )}
              renderItem={({ item }) => (
                <View style={[styles.itemCard, { backgroundColor: colors.backgroundElement }]}>
                  <View style={styles.itemInfo}>
                    <ThemedText type="smallBold" style={styles.itemNome} numberOfLines={2}>
                      {item.nome}
                    </ThemedText>
                    <ThemedText type="small" style={{ color: VERDE }}>
                      {formatarPreco(item.preco)}
                    </ThemedText>
                  </View>

                  <View style={styles.itemControles}>
                    <TouchableOpacity
                      style={[styles.btnQtd, { backgroundColor: colors.backgroundSelected }]}
                      onPress={() => atualizarQuantidade(item.id, -1)}
                      activeOpacity={0.7}>
                      <ThemedText style={styles.btnQtdTexto}>−</ThemedText>
                    </TouchableOpacity>

                    <ThemedText type="smallBold" style={styles.quantidade}>
                      {item.quantidade}
                    </ThemedText>

                    <TouchableOpacity
                      style={[styles.btnQtd, { backgroundColor: colors.backgroundSelected }]}
                      onPress={() => atualizarQuantidade(item.id, 1)}
                      activeOpacity={0.7}>
                      <ThemedText style={styles.btnQtdTexto}>+</ThemedText>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.itemSubtotal}>
                    <ThemedText type="smallBold">
                      {formatarPreco(item.preco * item.quantidade)}
                    </ThemedText>
                    <TouchableOpacity onPress={() => removerItem(item.id)} activeOpacity={0.7}>
                      <ThemedText type="small" style={styles.remover}>
                        Remover
                      </ThemedText>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            />

            <View style={[styles.rodape, { backgroundColor: colors.backgroundElement, borderTopColor: colors.backgroundSelected }]}>
              <View style={styles.totalLinha}>
                <ThemedText type="small" themeColor="textSecondary">
                  Total
                </ThemedText>
                <ThemedText type="subtitle" style={styles.totalValor}>
                  {formatarPreco(total)}
                </ThemedText>
              </View>

              <TouchableOpacity
                style={[styles.botaoFinalizar, { backgroundColor: VERDE }]}
                onPress={confirmarFinalizacao}
                disabled={finalizando}
                activeOpacity={0.8}>
                <ThemedText type="smallBold" style={styles.botaoTexto}>
                  {finalizando ? 'Processando...' : 'Finalizar pedido'}
                </ThemedText>
              </TouchableOpacity>
            </View>
          </>
        )}

      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  cabecalho: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.two,
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.two,
  },
  titulo: {
    fontSize: 28,
  },
  vazio: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.two,
  },
  vazioBigEmoji: {
    fontSize: 64,
  },
  vazioTitulo: {
    fontSize: 22,
  },
  vazioSub: {
    textAlign: 'center',
  },
  lista: {
    padding: Spacing.three,
    gap: Spacing.two,
  },
  separador: {
    height: 1,
    marginVertical: Spacing.one,
  },
  itemCard: {
    borderRadius: Spacing.two,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  itemInfo: {
    gap: 4,
  },
  itemNome: {
    fontSize: 15,
  },
  itemControles: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  btnQtd: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnQtdTexto: {
    fontSize: 20,
    lineHeight: 22,
  },
  quantidade: {
    minWidth: 24,
    textAlign: 'center',
    fontSize: 16,
  },
  itemSubtotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  remover: {
    color: '#e53e3e',
  },
  rodape: {
    padding: Spacing.four,
    gap: Spacing.three,
    borderTopWidth: 1,
  },
  totalLinha: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalValor: {
    fontSize: 24,
    color: VERDE,
  },
  botaoFinalizar: {
    height: 52,
    borderRadius: Spacing.two,
    justifyContent: 'center',
    alignItems: 'center',
  },
  botaoTexto: {
    color: '#fff',
    fontSize: 16,
  },
});
