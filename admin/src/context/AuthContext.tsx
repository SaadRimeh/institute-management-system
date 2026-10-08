import React, { createContext, useContext, useEffect, useState } from 'react';
import { api, getServerUrl, getToken, setServerUrl as saveServerUrl, setToken } from '../api/client';
import { mockDashboardData, mockStudents, mockTeachers, mockCourses } from '../api/mockData';
import { User } from '../api/types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  serverUrl: string;
  connectionStatus: 'connected' | 'disconnected' | 'checking';
  latencyMs: number | null;
  isLoading: boolean;
  isDemoMode: boolean;
  setDemoMode: (val: boolean) => void;
  login: (code: string, identifier?: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  updateServerUrl: (url: string) => void;
  testConnection: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(getToken());
  const [serverUrl, setServerUrlState] = useState<string>(getServerUrl());
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);

  const testConnection = async (): Promise<boolean> => {
    setConnectionStatus('checking');
    try {
      const res = await api.checkHealth();
      if (res.ok) {
        setConnectionStatus('connected');
        setLatencyMs(res.latency);
        return true;
      } else {
        setConnectionStatus('disconnected');
        setLatencyMs(null);
        return false;
      }
    } catch {
      setConnectionStatus('disconnected');
      setLatencyMs(null);
      return false;
    }
  };

  const updateServerUrl = (url: string) => {
    saveServerUrl(url);
    setServerUrlState(url);
    testConnection();
  };

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      const isConnected = await testConnection();

      const existingToken = getToken();
      if (existingToken && isConnected) {
        const meRes = await api.getMe();
        if (meRes.success && meRes.data) {
          setUser(meRes.data);
          setTokenState(existingToken);
        } else {
          // Invalidate
          setToken(null);
          setTokenState(null);
        }
      }
      setIsLoading(false);
    };

    init();
    const interval = setInterval(testConnection, 20000);
    return () => clearInterval(interval);
  }, []);

  const login = async (code: string, identifier?: string) => {
    // If backend is connected, use real API
    if (connectionStatus === 'connected') {
      const res = await api.login(code, identifier);
      if (res.success && res.data) {
        setUser(res.data.user);
        setTokenState(res.data.token);
        setIsDemoMode(false);
        return { success: true };
      }
      return { success: false, message: res.message || 'فشل تسجيل الدخول' };
    }

    // If backend is offline, support Demo Admin mode
    if (code === '123456') {
      const demoAdmin: User = {
        id: 'demo-admin-1',
        fullName: 'المدير العام (تجريبي)',
        role: 'admin',
        primaryContact: '0912345678',
        phones: [{ number: '0912345678', label: 'رئيسي' }],
        isActive: true,
      };
      setUser(demoAdmin);
      setTokenState('demo-token-123456');
      setIsDemoMode(true);
      return { success: true };
    }

    return {
      success: false,
      message: 'تعذر الاتصال بالخادم. يمكنك استخدام كود الدخول التجريبي 123456 للمعاينة.',
    };
  };

  const logout = () => {
    api.logout();
    setUser(null);
    setTokenState(null);
    setIsDemoMode(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        serverUrl,
        connectionStatus,
        latencyMs,
        isLoading,
        isDemoMode,
        setDemoMode: setIsDemoMode,
        login,
        logout,
        updateServerUrl,
        testConnection,
      }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
