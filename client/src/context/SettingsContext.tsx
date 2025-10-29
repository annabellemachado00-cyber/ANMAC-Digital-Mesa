import React, { createContext, useContext, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useApi } from './ApiContext';
import { Settings } from '../types';

interface SettingsContextValue {
  settings: Settings | undefined;
  isLoading: boolean;
  update(settings: Partial<Settings>): Promise<void>;
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const api = useApi();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: api.getSettings,
  });

  const value = useMemo<SettingsContextValue>(
    () => ({
      settings: data,
      isLoading,
      async update(payload) {
        const updated = await api.updateSettings(payload);
        queryClient.setQueryData(['settings'], updated);
      },
    }),
    [api, data, isLoading, queryClient]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

export const useSettings = (): SettingsContextValue => {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error('useSettings debe usarse dentro de SettingsProvider');
  }
  return ctx;
};
