import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/context/auth';
import { Colors, Spacing } from '@/constants/theme';

const VERDE = '#2E7D32';
const VERMELHO = '#C62828';

type Cartao = {
  numero: string;
  titular: string;
  validade: string;
};

type Endereco = {
  rua: string;
  numero: string;
  bairro: string;
  cidade: string;
  cep: string;
};

function cartaoKey(username: string) {
  return `@mercadinho:cartao:${username}`;
}

function enderecoKey(username: string) {
  return `@mercadinho:endereco:${username}`;
}

function formatarNumeroCartao(valor: string) {
  return valor
    .replace(/\D/g, '')
    .slice(0, 16)
    .replace(/(.{4})/g, '$1 ')
    .trim();
}

function formatarValidade(valor: string) {
  return valor
    .replace(/\D/g, '')
    .slice(0, 4)
    .replace(/^(\d{2})(\d)/, '$1/$2');
}

function formatarCep(valor: string) {
  return valor
    .replace(/\D/g, '')
    .slice(0, 8)
    .replace(/^(\d{5})(\d)/, '$1-$2');
}

export default function PerfilScreen() {
  const { usuario, logout } = useAuth();
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  const [cartao, setCartao] = useState<Cartao>({ numero: '', titular: '', validade: '' });
  const [endereco, setEndereco] = useState<Endereco>({ rua: '', numero: '', bairro: '', cidade: '', cep: '' });
  const [salvandoCartao, setSalvandoCartao] = useState(false);
  const [salvandoEndereco, setSalvandoEndereco] = useState(false);

  useEffect(() => {
    if (!usuario) return;
    AsyncStorage.getItem(cartaoKey(usuario)).then((val) => {
      if (val) setCartao(JSON.parse(val));
    });
    AsyncStorage.getItem(enderecoKey(usuario)).then((val) => {
      if (val) setEndereco(JSON.parse(val));
    });
  }, [usuario]);

  async function salvarCartao() {
    if (!usuario) return;
    setSalvandoCartao(true);
    try {
      await AsyncStorage.setItem(cartaoKey(usuario), JSON.stringify(cartao));
      Alert.alert('Salvo', 'Cartão atualizado com sucesso.');
    } finally {
      setSalvandoCartao(false);
    }
  }

  async function salvarEndereco() {
    if (!usuario) return;
    setSalvandoEndereco(true);
    try {
      await AsyncStorage.setItem(enderecoKey(usuario), JSON.stringify(endereco));
      Alert.alert('Salvo', 'Endereço atualizado com sucesso.');
    } finally {
      setSalvandoEndereco(false);
    }
  }

  function confirmarLogout() {
    if (Platform.OS === 'web') {
      if (window.confirm('Tem certeza que deseja sair da conta?')) logout();
      return;
    }
    Alert.alert('Sair', 'Tem certeza que deseja sair?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: () => logout() },
    ]);
  }

  const inputStyle = [
    styles.input,
    {
      backgroundColor: colors.backgroundElement,
      color: colors.text,
      borderColor: colors.backgroundSelected,
    },
  ];

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}>
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>

            {/* Avatar */}
            <View style={styles.avatarSection}>
              <View style={[styles.avatar, { backgroundColor: VERDE }]}>
                <ThemedText style={styles.avatarLetra}>
                  {usuario?.charAt(0).toUpperCase() ?? '?'}
                </ThemedText>
              </View>
              <ThemedText type="subtitle" style={styles.nome}>
                {usuario}
              </ThemedText>
            </View>

            {/* Cartão */}
            <View style={[styles.secao, { backgroundColor: colors.backgroundElement }]}>
              <ThemedText type="smallBold" style={styles.secaoTitulo}>
                Cartão de pagamento
              </ThemedText>

              <View style={styles.campos}>
                <View>
                  <ThemedText type="small" themeColor="textSecondary" style={styles.label}>
                    Número do cartão
                  </ThemedText>
                  <TextInput
                    style={inputStyle}
                    placeholder="0000 0000 0000 0000"
                    placeholderTextColor={colors.textSecondary}
                    value={cartao.numero}
                    onChangeText={(v) => setCartao({ ...cartao, numero: formatarNumeroCartao(v) })}
                    keyboardType="numeric"
                    maxLength={19}
                  />
                </View>

                <View>
                  <ThemedText type="small" themeColor="textSecondary" style={styles.label}>
                    Nome do titular
                  </ThemedText>
                  <TextInput
                    style={inputStyle}
                    placeholder="Como está no cartão"
                    placeholderTextColor={colors.textSecondary}
                    value={cartao.titular}
                    onChangeText={(v) => setCartao({ ...cartao, titular: v.toUpperCase() })}
                    autoCapitalize="characters"
                    autoCorrect={false}
                  />
                </View>

                <View style={styles.linhaMetade}>
                  <View style={styles.metade}>
                    <ThemedText type="small" themeColor="textSecondary" style={styles.label}>
                      Validade
                    </ThemedText>
                    <TextInput
                      style={inputStyle}
                      placeholder="MM/AA"
                      placeholderTextColor={colors.textSecondary}
                      value={cartao.validade}
                      onChangeText={(v) => setCartao({ ...cartao, validade: formatarValidade(v) })}
                      keyboardType="numeric"
                      maxLength={5}
                    />
                  </View>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.botao, { backgroundColor: VERDE }]}
                onPress={salvarCartao}
                disabled={salvandoCartao}
                activeOpacity={0.8}>
                <ThemedText type="smallBold" style={styles.botaoTexto}>
                  {salvandoCartao ? 'Salvando...' : 'Salvar cartão'}
                </ThemedText>
              </TouchableOpacity>
            </View>

            {/* Endereço */}
            <View style={[styles.secao, { backgroundColor: colors.backgroundElement }]}>
              <ThemedText type="smallBold" style={styles.secaoTitulo}>
                Endereço de entrega
              </ThemedText>

              <View style={styles.campos}>
                <View>
                  <ThemedText type="small" themeColor="textSecondary" style={styles.label}>
                    Rua / Avenida
                  </ThemedText>
                  <TextInput
                    style={inputStyle}
                    placeholder="Nome da rua"
                    placeholderTextColor={colors.textSecondary}
                    value={endereco.rua}
                    onChangeText={(v) => setEndereco({ ...endereco, rua: v })}
                  />
                </View>

                <View style={styles.linhaMetade}>
                  <View style={styles.metade}>
                    <ThemedText type="small" themeColor="textSecondary" style={styles.label}>
                      Número
                    </ThemedText>
                    <TextInput
                      style={inputStyle}
                      placeholder="Nº"
                      placeholderTextColor={colors.textSecondary}
                      value={endereco.numero}
                      onChangeText={(v) => setEndereco({ ...endereco, numero: v })}
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={styles.metade}>
                    <ThemedText type="small" themeColor="textSecondary" style={styles.label}>
                      CEP
                    </ThemedText>
                    <TextInput
                      style={inputStyle}
                      placeholder="00000-000"
                      placeholderTextColor={colors.textSecondary}
                      value={endereco.cep}
                      onChangeText={(v) => setEndereco({ ...endereco, cep: formatarCep(v) })}
                      keyboardType="numeric"
                      maxLength={9}
                    />
                  </View>
                </View>

                <View>
                  <ThemedText type="small" themeColor="textSecondary" style={styles.label}>
                    Bairro
                  </ThemedText>
                  <TextInput
                    style={inputStyle}
                    placeholder="Nome do bairro"
                    placeholderTextColor={colors.textSecondary}
                    value={endereco.bairro}
                    onChangeText={(v) => setEndereco({ ...endereco, bairro: v })}
                  />
                </View>

                <View>
                  <ThemedText type="small" themeColor="textSecondary" style={styles.label}>
                    Cidade
                  </ThemedText>
                  <TextInput
                    style={inputStyle}
                    placeholder="Cidade"
                    placeholderTextColor={colors.textSecondary}
                    value={endereco.cidade}
                    onChangeText={(v) => setEndereco({ ...endereco, cidade: v })}
                  />
                </View>
              </View>

              <TouchableOpacity
                style={[styles.botao, { backgroundColor: VERDE }]}
                onPress={salvarEndereco}
                disabled={salvandoEndereco}
                activeOpacity={0.8}>
                <ThemedText type="smallBold" style={styles.botaoTexto}>
                  {salvandoEndereco ? 'Salvando...' : 'Salvar endereço'}
                </ThemedText>
              </TouchableOpacity>
            </View>

            {/* Logout */}
            <TouchableOpacity
              style={[styles.botao, styles.botaoSair, { borderColor: VERMELHO }]}
              onPress={confirmarLogout}
              activeOpacity={0.8}>
              <ThemedText type="smallBold" style={[styles.botaoTexto, { color: VERMELHO }]}>
                Sair da conta
              </ThemedText>
            </TouchableOpacity>

          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  keyboardView: { flex: 1 },
  scroll: {
    padding: Spacing.four,
    gap: Spacing.four,
  },
  avatarSection: {
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.three,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarLetra: {
    fontSize: 36,
    fontWeight: '700',
    color: '#fff',
  },
  nome: {
    fontSize: 22,
  },
  secao: {
    borderRadius: Spacing.three,
    padding: Spacing.three,
    gap: Spacing.three,
  },
  secaoTitulo: {
    fontSize: 16,
    marginBottom: Spacing.one,
  },
  campos: {
    gap: Spacing.two,
  },
  label: {
    marginBottom: 4,
  },
  input: {
    height: 48,
    borderRadius: Spacing.two,
    borderWidth: 1,
    paddingHorizontal: Spacing.three,
    fontSize: 16,
  },
  linhaMetade: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  metade: {
    flex: 1,
  },
  botao: {
    height: 48,
    borderRadius: Spacing.two,
    justifyContent: 'center',
    alignItems: 'center',
  },
  botaoTexto: {
    color: '#fff',
    fontSize: 15,
  },
  botaoSair: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
  },
});
