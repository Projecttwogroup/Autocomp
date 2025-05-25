import { useState, useEffect, useCallback } from 'react';

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  fontSize: 'small' | 'medium' | 'large';
  notifications: boolean;
  language: string;
  timezone: string;
  sidebarCollapsed: boolean;
  chatNotifications: boolean;
}

const defaultPreferences: UserPreferences = {
  theme: 'system',
  fontSize: 'medium',
  notifications: true,
  language: 'en',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  sidebarCollapsed: false,
  chatNotifications: true,
};

export function usePreferences() {
  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    const stored = localStorage.getItem('user-preferences');
    if (stored) {
      try {
        return { ...defaultPreferences, ...JSON.parse(stored) };
      } catch {
        return defaultPreferences;
      }
    }
    return defaultPreferences;
  });

  useEffect(() => {
    localStorage.setItem('user-preferences', JSON.stringify(preferences));
  }, [preferences]);

  const updatePreference = useCallback(<K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  }, []);

  const resetPreferences = useCallback(() => {
    setPreferences(defaultPreferences);
  }, []);

  return {
    preferences,
    updatePreference,
    resetPreferences,
  };
}