import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI, getAuthToken, User as APIUser } from '../services/apiService';

export interface User {
  id: number;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('forgeai_user');
    const token = getAuthToken();
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const register = async (name: string, email: string, password: string): Promise<void> => {
    const { user, token } = await authAPI.register({ email, password, name });
    localStorage.setItem('forgeai_user', JSON.stringify(user));
    setUser(user);
  };

  const login = async (email: string, password: string): Promise<void> => {
    const { user, token } = await authAPI.login({ email, password });
    localStorage.setItem('forgeai_user', JSON.stringify(user));
    setUser(user);
  };

  const logout = async () => {
    await authAPI.logout();
    localStorage.removeItem('forgeai_user');
    setUser(null);
  };

  const value = {
    user,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
