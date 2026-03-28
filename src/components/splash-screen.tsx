import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, useColorScheme, View } from 'react-native';

import { Colors, Spacing } from '@/constants/theme';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';

const VERDE = '#2E7D32';
const VERDE_CLARO = '#4CAF50';

type Props = {
  onConcluido: () => void;
};

export function SplashScreen({ onConcluido }: Props) {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  const opacidade = useRef(new Animated.Value(0)).current;
  const escala = useRef(new Animated.Value(0.85)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacidade, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.spring(escala, {
        toValue: 1,
        friction: 6,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      Animated.timing(opacidade, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start(() => onConcluido());
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <ThemedView style={styles.container}>
      <Animated.View style={[styles.conteudo, { opacity: opacidade, transform: [{ scale: escala }] }]}>
        <View style={[styles.icone, { backgroundColor: VERDE }]}>
          <ThemedText style={styles.iconeTexto}>🛒</ThemedText>
        </View>

        <ThemedText type="subtitle" style={styles.nome}>
          Mercadinho
        </ThemedText>
        <ThemedText style={[styles.esquina, { color: VERDE_CLARO }]}>
          Esquina
        </ThemedText>

        <View style={[styles.divisor, { backgroundColor: colors.backgroundElement }]} />

        <ThemedText type="small" themeColor="textSecondary" style={styles.slogan}>
          Seu mercado de confiança
        </ThemedText>
      </Animated.View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  conteudo: {
    alignItems: 'center',
    gap: Spacing.two,
  },
  icone: {
    width: 96,
    height: 96,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.three,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  iconeTexto: {
    fontSize: 48,
  },
  nome: {
    letterSpacing: 0.5,
  },
  esquina: {
    fontSize: 22,
    fontWeight: '600',
    letterSpacing: 4,
    textTransform: 'uppercase',
    marginTop: -Spacing.two,
  },
  divisor: {
    width: 40,
    height: 2,
    borderRadius: 1,
    marginVertical: Spacing.two,
  },
  slogan: {
    letterSpacing: 0.3,
  },
});
