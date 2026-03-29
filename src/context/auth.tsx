import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

const SESSAO_KEY = '@mercadinho:sessao';

type AuthContextType = {
  usuario: string | null;
  login: (username: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  usuario: null,
  login: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<string | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(SESSAO_KEY).then((val) => {
      if (val) setUsuario(val);
    });
  }, []);

  async function login(username: string) {
    await AsyncStorage.setItem(SESSAO_KEY, username);
    setUsuario(username);
  }

  async function logout() {
    await AsyncStorage.removeItem(SESSAO_KEY);
    setUsuario(null);
  }

  return (
    <AuthContext.Provider value={{ usuario, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
