import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useApi } from './ApiContext';
import { LoginPayload, User } from '../types';

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  login(payload: LoginPayload): Promise<void>;
  logout(): void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const LOCAL_KEY = 'anmac-auth-user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const api = useApi();
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem(LOCAL_KEY);
    return stored ? (JSON.parse(stored) as User) : null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem(LOCAL_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(LOCAL_KEY);
    }
  }, [user]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      async login(payload) {
        const logged = await api.login(payload);
        setUser(logged);
      },
      logout() {
        setUser(null);
        queryClient.clear();
      },
    }),
    [api, queryClient, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return ctx;
};
