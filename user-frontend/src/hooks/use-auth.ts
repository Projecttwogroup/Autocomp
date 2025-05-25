import { useState, useEffect, useCallback } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>(() => ({
    isAuthenticated: localStorage.getItem('autocomp-auth') === 'true',
    user: JSON.parse(localStorage.getItem('autocomp-user') || 'null'),
    loading: true
  }));

  // Handle auth state changes from other tabs/windows
  useEffect(() => {
    const handleStorageChange = () => {
      setAuthState({
        isAuthenticated: localStorage.getItem('autocomp-auth') === 'true',
        user: JSON.parse(localStorage.getItem('autocomp-user') || 'null'),
        loading: false
      });
    };

    window.addEventListener('storage', handleStorageChange);
    setAuthState(prev => ({ ...prev, loading: false }));

    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      
      localStorage.setItem('autocomp-auth', 'true');
      localStorage.setItem('autocomp-user', JSON.stringify(data.user));
      localStorage.setItem('autocomp-user-id', data.user.id);

      setAuthState({
        isAuthenticated: true,
        user: data.user,
        loading: false
      });

      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('autocomp-auth');
    localStorage.removeItem('autocomp-user');
    localStorage.removeItem('autocomp-user-id');

    setAuthState({
      isAuthenticated: false,
      user: null,
      loading: false
    });

    // Force other tabs/windows to update
    window.dispatchEvent(new Event('storage'));
  }, []);

  return {
    ...authState,
    login,
    logout
  };
}