import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState } from 'react';
import {
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
import { Usuario } from '@/components/login-screen';
import { Colors, Spacing } from '@/constants/theme';

const VERDE = '#2E7D32';
const STORAGE_KEY = '@mercadinho:usuarios';

type Props = {
  onRegistrado: () => void;
  onVoltar: () => void;
};

type Erros = {
  nomeCompleto?: string;
  usuario?: string;
  senha?: string;
  confirmarSenha?: string;
  geral?: string;
};

export function RegistroScreen({ onRegistrado, onVoltar }: Props) {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  const [nomeCompleto, setNomeCompleto] = useState('');
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [erros, setErros] = useState<Erros>({});
  const [carregando, setCarregando] = useState(false);

  function validar(): boolean {
    const novosErros: Erros = {};

    if (!nomeCompleto.trim()) {
      novosErros.nomeCompleto = 'Nome completo é obrigatório.';
    }

    if (!usuario.trim()) {
      novosErros.usuario = 'Usuário é obrigatório.';
    } else if (usuario.trim().length < 3) {
      novosErros.usuario = 'Usuário deve ter ao menos 3 caracteres.';
    } else if (/\s/.test(usuario)) {
      novosErros.usuario = 'Usuário não pode ter espaços.';
    }

    if (!senha) {
      novosErros.senha = 'Senha é obrigatória.';
    } else if (senha.length < 4) {
      novosErros.senha = 'Senha deve ter ao menos 4 caracteres.';
    }

    if (!confirmarSenha) {
      novosErros.confirmarSenha = 'Confirme sua senha.';
    } else if (senha !== confirmarSenha) {
      novosErros.confirmarSenha = 'As senhas não coincidem.';
    }

    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  }

  async function handleRegistrar() {
    if (!validar()) return;

    setCarregando(true);

    try {
      const dados = await AsyncStorage.getItem(STORAGE_KEY);
      const usuarios: Usuario[] = dados ? JSON.parse(dados) : [];

      const jaExiste = usuarios.some(
        (u) => u.usuario === usuario.trim()
      );

      if (jaExiste) {
        setErros({ usuario: 'Este nome de usuário já está em uso.' });
        return;
      }

      const novoUsuario: Usuario = {
        nomeCompleto: nomeCompleto.trim(),
        usuario: usuario.trim(),
        senha,
      };

      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify([...usuarios, novoUsuario])
      );

      onRegistrado();
    } catch {
      setErros({ geral: 'Erro ao criar conta. Tente novamente.' });
    } finally {
      setCarregando(false);
    }
  }

  const inputStyle = (temErro: boolean) => [
    styles.input,
    {
      backgroundColor: colors.backgroundElement,
      color: colors.text,
      borderColor: temErro ? '#e53e3e' : colors.backgroundSelected,
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
            <View style={styles.card}>
              <View style={styles.cabecalho}>
                <TouchableOpacity onPress={onVoltar} style={styles.botaoVoltar}>
                  <ThemedText style={{ color: VERDE, fontSize: 16 }}>← Voltar</ThemedText>
                </TouchableOpacity>
                <ThemedText type="subtitle" style={styles.titulo}>
                  Criar conta
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  Preencha os dados para se cadastrar
                </ThemedText>
              </View>

              <View style={styles.campos}>
                <Campo
                  label="Nome completo"
                  placeholder="Seu nome completo"
                  value={nomeCompleto}
                  onChangeText={setNomeCompleto}
                  erro={erros.nomeCompleto}
                  inputStyle={inputStyle(!!erros.nomeCompleto)}
                  placeholderColor={colors.textSecondary}
                />

                <Campo
                  label="Usuário"
                  placeholder="Escolha um nome de usuário"
                  value={usuario}
                  onChangeText={setUsuario}
                  erro={erros.usuario}
                  inputStyle={inputStyle(!!erros.usuario)}
                  placeholderColor={colors.textSecondary}
                  autoCapitalize="none"
                />

                <Campo
                  label="Senha"
                  placeholder="Crie uma senha (mín. 4 caracteres)"
                  value={senha}
                  onChangeText={setSenha}
                  erro={erros.senha}
                  inputStyle={inputStyle(!!erros.senha)}
                  placeholderColor={colors.textSecondary}
                  secureTextEntry
                />

                <Campo
                  label="Confirmar senha"
                  placeholder="Repita sua senha"
                  value={confirmarSenha}
                  onChangeText={setConfirmarSenha}
                  erro={erros.confirmarSenha}
                  inputStyle={inputStyle(!!erros.confirmarSenha)}
                  placeholderColor={colors.textSecondary}
                  secureTextEntry
                />

                {erros.geral && (
                  <ThemedText type="small" style={styles.erroGeral}>
                    {erros.geral}
                  </ThemedText>
                )}
              </View>

              <TouchableOpacity
                style={[styles.botao, { backgroundColor: VERDE }]}
                onPress={handleRegistrar}
                disabled={carregando}
                activeOpacity={0.8}>
                <ThemedText type="smallBold" style={styles.botaoTexto}>
                  {carregando ? 'Criando conta...' : 'Criar conta'}
                </ThemedText>
              </TouchableOpacity>

              <View style={styles.rodape}>
                <ThemedText type="small" themeColor="textSecondary">
                  Já tem uma conta?{' '}
                </ThemedText>
                <TouchableOpacity onPress={onVoltar}>
                  <ThemedText type="small" style={{ color: VERDE, fontWeight: '700' }}>
                    Entrar
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedView>
  );
}

type CampoProps = {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (v: string) => void;
  erro?: string;
  inputStyle: object[];
  placeholderColor: string;
  secureTextEntry?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
};

function Campo({
  label,
  placeholder,
  value,
  onChangeText,
  erro,
  inputStyle,
  placeholderColor,
  secureTextEntry,
  autoCapitalize = 'words',
}: CampoProps) {
  return (
    <View>
      <ThemedText type="smallBold" style={styles.label}>
        {label}
      </ThemedText>
      <TextInput
        style={inputStyle}
        placeholder={placeholder}
        placeholderTextColor={placeholderColor}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        autoCapitalize={autoCapitalize}
        autoCorrect={false}
      />
      {erro && (
        <ThemedText type="small" style={styles.erroInline}>
          {erro}
        </ThemedText>
      )}
    </View>
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
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.four,
  },
  card: {
    gap: Spacing.four,
    maxWidth: 400,
    width: '100%',
    alignSelf: 'center',
  },
  cabecalho: {
    gap: Spacing.one,
  },
  botaoVoltar: {
    marginBottom: Spacing.two,
  },
  titulo: {
    fontSize: 28,
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
  erroInline: {
    color: '#e53e3e',
    marginTop: 4,
  },
  erroGeral: {
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
