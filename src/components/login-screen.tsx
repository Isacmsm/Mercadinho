import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Spacing } from '@/constants/theme';

const VERDE = '#2E7D32';
const STORAGE_KEY = '@mercadinho:usuarios';

export type Usuario = {
  nomeCompleto: string;
  usuario: string;
  senha: string;
};

type Props = {
  onLogin: () => void;
  onIrParaRegistro: () => void;
};

export function LoginScreen({ onLogin, onIrParaRegistro }: Props) {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function handleLogin() {
    if (!usuario.trim() || !senha.trim()) {
      setErro('Preencha usuário e senha.');
      return;
    }

    setCarregando(true);
    setErro('');

    try {
      const dados = await AsyncStorage.getItem(STORAGE_KEY);
      const usuarios: Usuario[] = dados ? JSON.parse(dados) : [];

      const encontrado = usuarios.find(
        (u) => u.usuario === usuario.trim() && u.senha === senha
      );

      if (!encontrado) {
        setErro('Usuário ou senha incorretos.');
        return;
      }

      onLogin();
    } catch {
      setErro('Erro ao realizar login. Tente novamente.');
    } finally {
      setCarregando(false);
    }
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
          <View style={styles.card}>
            <View style={styles.cabecalho}>
              <View style={[styles.icone, { backgroundColor: VERDE }]}>
                <ThemedText style={styles.iconeTexto}>🛒</ThemedText>
              </View>
              <ThemedText type="subtitle" style={styles.titulo}>
                Mercadinho Esquina
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                Faça login para continuar
              </ThemedText>
            </View>

            <View style={styles.campos}>
              <View>
                <ThemedText type="smallBold" style={styles.label}>
                  Usuário
                </ThemedText>
                <TextInput
                  style={inputStyle}
                  placeholder="Digite seu usuário"
                  placeholderTextColor={colors.textSecondary}
                  value={usuario}
                  onChangeText={setUsuario}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <View>
                <ThemedText type="smallBold" style={styles.label}>
                  Senha
                </ThemedText>
                <TextInput
                  style={inputStyle}
                  placeholder="Digite sua senha"
                  placeholderTextColor={colors.textSecondary}
                  value={senha}
                  onChangeText={setSenha}
                  secureTextEntry
                />
              </View>

              {erro !== '' && (
                <ThemedText type="small" style={styles.erro}>
                  {erro}
                </ThemedText>
              )}
            </View>

            <TouchableOpacity
              style={[styles.botao, { backgroundColor: VERDE }]}
              onPress={handleLogin}
              disabled={carregando}
              activeOpacity={0.8}>
              <ThemedText type="smallBold" style={styles.botaoTexto}>
                {carregando ? 'Entrando...' : 'Entrar'}
              </ThemedText>
            </TouchableOpacity>

            <View style={styles.rodape}>
              <ThemedText type="small" themeColor="textSecondary">
                Não tem uma conta?{' '}
              </ThemedText>
              <TouchableOpacity onPress={onIrParaRegistro}>
                <ThemedText type="small" style={{ color: VERDE, fontWeight: '700' }}>
                  Criar conta
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
  },
  card: {
    gap: Spacing.four,
    maxWidth: 400,
    width: '100%',
    alignSelf: 'center',
  },
  cabecalho: {
    alignItems: 'center',
    gap: Spacing.two,
  },
  icone: {
    width: 64,
    height: 64,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.one,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  iconeTexto: {
    fontSize: 32,
  },
  titulo: {
    textAlign: 'center',
    fontSize: 24,
  },
  campos: {
    gap: Spacing.three,
  },
  label: {
    marginBottom: Spacing.one,
  },
  input: {
    height: 48,
    borderRadius: Spacing.two,
    borderWidth: 1,
    paddingHorizontal: Spacing.three,
    fontSize: 16,
  },
  erro: {
    color: '#e53e3e',
    textAlign: 'center',
  },
  botao: {
    height: 48,
    borderRadius: Spacing.two,
    justifyContent: 'center',
    alignItems: 'center',
  },
  botaoTexto: {
    color: '#ffffff',
    fontSize: 16,
  },
  rodape: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -Spacing.two,
  },
});
