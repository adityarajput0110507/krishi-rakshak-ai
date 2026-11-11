import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

export type UserRole = 'farmer' | 'expert' | 'admin';

interface User {
  id: number;
  name: string;
  phone: string;
  email?: string;
  role: UserRole;
  farmer_profile?: any;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  role: UserRole | null;
  loading: boolean;
  login: (phone: string, pass: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('cropguard_token'));
  const [role, setRole] = useState<UserRole | null>(() => (localStorage.getItem('cropguard_role') as UserRole) || null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchUser = async () => {
    if (!token) {
      setUser(null);
      setRole(null);
      setLoading(false);
      return;
    }
    try {
      const u = await api.getMe();
      setUser(u);
      setRole(u.role);
      localStorage.setItem('cropguard_role', u.role);
    } catch (err) {
      console.warn('Failed to fetch user, logging out');
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [token]);

  const login = async (phone: string, pass: string) => {
    const res = await api.login(phone, pass);
    localStorage.setItem('cropguard_token', res.access_token);
    localStorage.setItem('cropguard_role', res.role);
    setToken(res.access_token);
    setRole(res.role as UserRole);
    setUser({
      id: res.user_id,
      name: res.name,
      phone: phone,
      role: res.role as UserRole,
    });
  };

  const register = async (data: any) => {
    const res = await api.register(data);
    localStorage.setItem('cropguard_token', res.access_token);
    localStorage.setItem('cropguard_role', res.role);
    setToken(res.access_token);
    setRole(res.role as UserRole);
    setUser({
      id: res.user_id,
      name: res.name,
      phone: data.phone,
      role: res.role as UserRole,
    });
  };

  const logout = () => {
    localStorage.removeItem('cropguard_token');
    localStorage.removeItem('cropguard_role');
    setToken(null);
    setUser(null);
    setRole(null);
  };

  const refreshUser = async () => {
    await fetchUser();
  };

  return (
    <AuthContext.Provider value={{ user, token, role, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

