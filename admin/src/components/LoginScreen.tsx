import React, { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { ServerConfigModal } from './ServerConfigModal';

export const LoginScreen: React.FC = () => {
  const { login, connectionStatus, latencyMs, serverUrl, testConnection } = useAuth();
  const [code, setCode] = useState('123456');
  const [identifier, setIdentifier] = useState('0912345678');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfig, setShowConfig] = useState(false);

  const handleLogin = async () => {
    if (!code || code.length !== 6) {
      setError('يرجى إدخال كود وصول صحيح مكوّن من 6 أرقام');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await login(code, identifier);
      if (!res.success) {
        setError(res.message || 'فشل تسجيل الدخول');
      }
    } catch (e: any) {
      setError(e.message || 'حدث خطأ غير متوقع');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* Top Logo */}
        <View style={styles.logoBadge}>
          <Text style={styles.logoIcon}>🎓</Text>
        </View>

        <Text style={styles.title}>بوابة إدارة المعهد</Text>
        <Text style={styles.subtitle}>Institute Management System (IMS)</Text>

        {/* Server status pill */}
        <Pressable
          style={[
            styles.connPill,
            connectionStatus === 'connected'
              ? styles.connPillGreen
              : connectionStatus === 'checking'
              ? styles.connPillYellow
              : styles.connPillRed,
          ]}
          onPress={() => setShowConfig(true)}>
          <View
            style={[
              styles.dot,
              connectionStatus === 'connected'
                ? styles.dotGreen
                : connectionStatus === 'checking'
                ? styles.dotYellow
                : styles.dotRed,
            ]}
          />
          <Text style={styles.connPillText}>
            {connectionStatus === 'connected'
              ? `الخادم متصل: ${serverUrl} (${latencyMs ?? 0}ms)`
              : connectionStatus === 'checking'
              ? 'جاري فحص الاتصال بالخادم...'
              : `الخادم غير متصل: ${serverUrl} (انقر للتعديل)`}
          </Text>
        </Pressable>

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>⚠️ {error}</Text>
          </View>
        )}

        <View style={styles.formGroup}>
          <Text style={styles.label}>رمز الدخول (6 أرقام):</Text>
          <TextInput
            style={styles.input}
            value={code}
            onChangeText={(t) => setCode(t.replace(/[^0-9]/g, '').slice(0, 6))}
            placeholder="مثال: 123456"
            placeholderTextColor="#64748B"
            keyboardType="numeric"
            maxLength={6}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>رقم الهاتف أو المعرف (اختياري للمسؤول):</Text>
          <TextInput
            style={styles.input}
            value={identifier}
            onChangeText={setIdentifier}
            placeholder="0912345678"
            placeholderTextColor="#64748B"
            autoCapitalize="none"
          />
        </View>

        <Pressable
          style={[styles.loginBtn, loading && styles.btnDisabled]}
          onPress={handleLogin}
          disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.loginBtnText}>دخول لوحة الإدارة 🚀</Text>
          )}
        </Pressable>

        <View style={styles.divider}>
          <View style={styles.line} />
          <Text style={styles.dividerText}>معلومات الوصول الافتراضية</Text>
          <View style={styles.line} />
        </View>

        <View style={styles.hintsBox}>
          <Text style={styles.hintText}>• كود المسؤول الافتراضي: 123456</Text>
          <Text style={styles.hintText}>• المعرف: 0912345678 أو admin-contact</Text>
          <Text style={styles.hintText}>• منفذ الخادم الافتراضي: 5000 (Express API)</Text>
        </View>
      </View>

      <ServerConfigModal visible={showConfig} onClose={() => setShowConfig(false)} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090D16',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: '#0F172A',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#334155',
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 8,
  },
  logoBadge: {
    width: 68,
    height: 68,
    borderRadius: 20,
    backgroundColor: 'rgba(79, 70, 229, 0.2)',
    borderWidth: 1,
    borderColor: '#4F46E5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  logoIcon: {
    fontSize: 34,
  },
  title: {
    color: '#F8FAFC',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitle: {
    color: '#64748B',
    fontSize: 13,
    marginBottom: 20,
    textAlign: 'center',
  },
  connPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 20,
    maxWidth: '100%',
  },
  connPillGreen: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  connPillYellow: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  connPillRed: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotGreen: { backgroundColor: '#10B981' },
  dotYellow: { backgroundColor: '#F59E0B' },
  dotRed: { backgroundColor: '#EF4444' },
  connPillText: {
    color: '#CBD5E1',
    fontSize: 12,
    fontWeight: '500',
  },
  errorBox: {
    width: '100%',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#FCA5A5',
    fontSize: 13,
    textAlign: 'right',
  },
  formGroup: {
    width: '100%',
    marginBottom: 16,
  },
  label: {
    color: '#94A3B8',
    fontSize: 13,
    marginBottom: 8,
    textAlign: 'right',
    fontWeight: '600',
  },
  input: {
    width: '100%',
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#475569',
    borderRadius: 12,
    color: '#FFFFFF',
    fontSize: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    textAlign: 'right',
  },
  loginBtn: {
    width: '100%',
    backgroundColor: '#4F46E5',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: '#4F46E5',
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 4,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  loginBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    width: '100%',
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#334155',
  },
  dividerText: {
    color: '#64748B',
    fontSize: 11,
    paddingHorizontal: 10,
  },
  hintsBox: {
    width: '100%',
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
    borderRadius: 12,
    padding: 12,
    gap: 4,
  },
  hintText: {
    color: '#94A3B8',
    fontSize: 12,
    textAlign: 'right',
  },
});
