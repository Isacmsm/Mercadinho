import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import React, { useState } from 'react';
import { StyleSheet, useColorScheme, View } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';
import { LoginScreen } from '@/components/login-screen';
import { RegistroScreen } from '@/components/registro-screen';
import { SplashScreen } from '@/components/splash-screen';
import { AuthProvider, useAuth } from '@/context/auth';

type Tela = 'splash' | 'login' | 'registro';

export default function RootLayout() {
  return (
    <AuthProvider>
      <InnerLayout />
    </AuthProvider>
  );
}

function InnerLayout() {
  const colorScheme = useColorScheme();
  const { usuario, login } = useAuth();
  const [tela, setTela] = useState<Tela>('splash');

  function renderOverlay() {
    if (usuario) return null;

    switch (tela) {
      case 'splash':
        return <SplashScreen onConcluido={() => setTela('login')} />;
      case 'registro':
        return (
          <RegistroScreen
            onRegistrado={() => setTela('login')}
            onVoltar={() => setTela('login')}
          />
        );
      case 'login':
      default:
        return (
          <LoginScreen
            onLogin={(username: string) => { login(username); }}
            onIrParaRegistro={() => setTela('registro')}
          />
        );
    }
  }

  const overlay = renderOverlay();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      <AppTabs />
      {overlay && (
        <View style={StyleSheet.absoluteFill}>
          {overlay}
        </View>
      )}
    </ThemeProvider>
  );
}
