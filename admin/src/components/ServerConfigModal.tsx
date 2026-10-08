import React, { useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';

interface ServerConfigModalProps {
  visible: boolean;
  onClose: () => void;
}

export const ServerConfigModal: React.FC<ServerConfigModalProps> = ({ visible, onClose }) => {
  const { serverUrl, updateServerUrl, connectionStatus, latencyMs, testConnection } = useAuth();
  const [inputUrl, setInputUrl] = useState(serverUrl);
  const [testing, setTesting] = useState(false);
  const [healthResult, setHealthResult] = useState<any>(null);

  const handlePing = async () => {
    setTesting(true);
    setHealthResult(null);
    try {
      const res = await api.checkHealth();
      setHealthResult(res);
      await testConnection();
    } catch (e: any) {
      setHealthResult({ ok: false, error: e.message });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = () => {
    updateServerUrl(inputUrl);
    handlePing();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>⚙️ إعدادات وخادم الـ API</Text>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeText}>✕</Text>
            </Pressable>
          </View>

          <Text style={styles.label}>رابط خادم الواجهة الخلفية (Backend URL):</Text>
          <TextInput
            style={styles.input}
            value={inputUrl}
            onChangeText={setInputUrl}
            placeholder="http://localhost:5000"
            placeholderTextColor="#64748B"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <View style={styles.statusBox}>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>حالة الاتصال الحالية:</Text>
              <View style={styles.badgeWrapper}>
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
                <Text
                  style={[
                    styles.statusText,
                    connectionStatus === 'connected'
                      ? styles.textGreen
                      : connectionStatus === 'checking'
                      ? styles.textYellow
                      : styles.textRed,
                  ]}>
                  {connectionStatus === 'connected'
                    ? `متصل بنجاح (${latencyMs ?? 0}ms)`
                    : connectionStatus === 'checking'
                    ? 'جاري التحقق...'
                    : 'غير متصل بالخادم'}
                </Text>
              </View>
            </View>

            {healthResult && (
              <View style={styles.diagnosticLog}>
                <Text style={styles.logTitle}>نتائج فحص /health:</Text>
                <Text style={styles.logContent}>
                  {JSON.stringify(healthResult, null, 2)}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.actions}>
            <Pressable
              style={[styles.btn, styles.btnPing]}
              onPress={handlePing}
              disabled={testing}>
              {testing ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.btnPingText}>⚡ اختبار الاتصال (Ping)</Text>
              )}
            </Pressable>

            <Pressable
              style={[styles.btn, styles.btnSave]}
              onPress={handleSave}>
              <Text style={styles.btnSaveText}>حفظ وتطبيق</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  card: {
    width: '100%',
    maxWidth: 520,
    backgroundColor: '#0F172A',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#334155',
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'right',
  },
  closeBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#1E293B',
  },
  closeText: {
    color: '#94A3B8',
    fontSize: 16,
    fontWeight: 'bold',
  },
  label: {
    color: '#94A3B8',
    fontSize: 13,
    marginBottom: 8,
    textAlign: 'right',
  },
  input: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#475569',
    borderRadius: 12,
    color: '#FFFFFF',
    fontSize: 15,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
  },
  statusBox: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
  },
  statusRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusLabel: {
    color: '#CBD5E1',
    fontSize: 14,
  },
  badgeWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  dotGreen: { backgroundColor: '#10B981' },
  dotYellow: { backgroundColor: '#F59E0B' },
  dotRed: { backgroundColor: '#EF4444' },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  textGreen: { color: '#10B981' },
  textYellow: { color: '#F59E0B' },
  textRed: { color: '#EF4444' },
  diagnosticLog: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  logTitle: {
    color: '#64748B',
    fontSize: 11,
    marginBottom: 4,
    textAlign: 'right',
  },
  logContent: {
    color: '#38BDF8',
    fontFamily: 'monospace',
    fontSize: 11,
    backgroundColor: '#0F172A',
    padding: 8,
    borderRadius: 8,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  btn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPing: {
    backgroundColor: '#334155',
  },
  btnPingText: {
    color: '#F8FAFC',
    fontWeight: '600',
    fontSize: 14,
  },
  btnSave: {
    backgroundColor: '#4F46E5',
  },
  btnSaveText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});
