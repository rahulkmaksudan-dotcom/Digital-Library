import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthResponse, UserRole } from '../types';
import { authService } from '../api';
import { useToast } from './ToastContext';

interface AuthContextType {
  user: AuthResponse | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLibrarian: boolean;
  isStaff: boolean;
  isStudent: boolean;
  login: (identifier: string, pass: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  updateUserSession: (updatedData: Partial<AuthResponse>) => void;
  updateUser: (updatedData: Partial<AuthResponse>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthResponse | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { success, error } = useToast();

  useEffect(() => {
    try {
      const savedToken = localStorage.getItem('dlms_token');
      const savedUser = localStorage.getItem('dlms_user');

      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      }
    } catch (e) {
      localStorage.removeItem('dlms_token');
      localStorage.removeItem('dlms_user');
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (identifier: string, pass: string) => {
    try {
      const response = await authService.login(identifier, pass);
      setToken(response.token);
      setUser(response);
      localStorage.setItem('dlms_token', response.token);
      localStorage.setItem('dlms_user', JSON.stringify(response));
      success(`Welcome back, ${response.fullName}!`);
    } catch (err: any) {
      error(err.message || 'Login failed. Please check your credentials.');
      throw err;
    }
  };

  const register = async (data: any) => {
    try {
      const response = await authService.register(data);
      setToken(response.token);
      setUser(response);
      localStorage.setItem('dlms_token', response.token);
      localStorage.setItem('dlms_user', JSON.stringify(response));
      success('Account registered successfully! Welcome to the library.');
    } catch (err: any) {
      error(err.message || 'Registration failed.');
      throw err;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('dlms_token');
    localStorage.removeItem('dlms_user');
    success('Logged out successfully');
  };

  const updateUserSession = (updatedData: Partial<AuthResponse>) => {
    if (user) {
      const updated = { ...user, ...updatedData };
      setUser(updated);
      localStorage.setItem('dlms_user', JSON.stringify(updated));
    }
  };

  const role = user?.role;
  const isAuthenticated = !!token && !!user;
  const isAdmin = role === 'ADMIN';
  const isLibrarian = role === 'LIBRARIAN';
  const isStaff = isAdmin || isLibrarian;
  const isStudent = role === 'STUDENT';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated,
        isAdmin,
        isLibrarian,
        isStaff,
        isStudent,
        login,
        register,
        logout,
        updateUserSession,
        updateUser: updateUserSession,
      }}
    >
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

