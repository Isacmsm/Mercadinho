import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import React, { useState } from 'react';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';
import { LoginScreen } from '@/components/login-screen';
import { RegistroScreen } from '@/components/registro-screen';
import { SplashScreen } from '@/components/splash-screen';

type Tela = 'splash' | 'login' | 'registro';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const [tela, setTela] = useState<Tela>('splash');
  const [logado, setLogado] = useState(false);

  function renderTela() {
    if (logado) {
      return (
        <>
          <AnimatedSplashOverlay />
          <AppTabs />
        </>
      );
    }

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
            onLogin={() => setLogado(true)}
            onIrParaRegistro={() => setTela('registro')}
          />
        );
    }
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      {renderTela()}
    </ThemeProvider>
  );
}
