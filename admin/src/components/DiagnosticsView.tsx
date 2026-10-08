import React, { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export const DiagnosticsView: React.FC = () => {
  const {
    user,
    token,
    serverUrl,
    updateServerUrl,
    connectionStatus,
    latencyMs,
    testConnection,
    isDemoMode,
  } = useAuth();

  const [inputUrl, setInputUrl] = useState(serverUrl);
  const [testing, setTesting] = useState(false);
  const [healthData, setHealthData] = useState<any>(null);

  // Notification state
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMessage, setNotifMessage] = useState('');
  const [notifTarget, setNotifTarget] = useState<'all' | 'student' | 'teacher'>('all');
  const [sendingNotif, setSendingNotif] = useState(false);
  const [notifStatus, setNotifStatus] = useState<string | null>(null);

  const handleTestPing = async () => {
    setTesting(true);
    setHealthData(null);
    try {
      const res = await api.checkHealth();
      setHealthData(res);
      await testConnection();
    } catch (e: any) {
      setHealthData({ ok: false, error: e.message });
    } finally {
      setTesting(false);
    }
  };

  const handleSaveUrl = () => {
    updateServerUrl(inputUrl);
    handleTestPing();
  };

  const handleSendNotification = async () => {
    if (!notifTitle.trim() || !notifMessage.trim()) {
      setNotifStatus('يرجى كتابة عنوان ونص الإشعار');
      return;
    }

    setSendingNotif(true);
    setNotifStatus(null);
    try {
      if (connectionStatus === 'connected' && !isDemoMode) {
        const res = await api.createNotification({
          title: notifTitle.trim(),
          message: notifMessage.trim(),
          targetType: notifTarget,
        });
        if (res.success) {
          setNotifStatus('✅ تم إرسال التعميم وتوزيعه بنجاح عبر الـ API!');
          setNotifTitle('');
          setNotifMessage('');
        } else {
          setNotifStatus(`⚠️ ${res.message || 'فشل إرسال الإشعار'}`);
        }
      } else {
        setNotifStatus('✅ تم إرسال التعميم التجريبي وحفظه بنجاح!');
        setNotifTitle('');
        setNotifMessage('');
      }
    } catch (e: any) {
      setNotifStatus(`⚠️ ${e.message}`);
    } finally {
      setSendingNotif(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.pageTitle}>⚙️ أدوات الربط، فحص الخادم، والتعاميم</Text>

      {/* Connection Diagnostic Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>📡 فحص الربط المباشر مع الخادم (Backend Diagnostic)</Text>
        <Text style={styles.cardDesc}>
          يمكنك تغيير عنوان الخادم وفحص استجابة الـ API وزمن التأخير (Latency) بالمللي ثانية.
        </Text>

        <Text style={styles.label}>رابط الخادم (Server API URL):</Text>
        <View style={styles.urlRow}>
          <TextInput
            style={styles.urlInput}
            value={inputUrl}
            onChangeText={setInputUrl}
            placeholder="http://localhost:5000"
            placeholderTextColor="#64748B"
            autoCapitalize="none"
          />
          <Pressable style={styles.saveBtn} onPress={handleSaveUrl}>
            <Text style={styles.saveBtnText}>حفظ وتطبيق</Text>
          </Pressable>
        </View>

        <View style={styles.statusBox}>
          <View style={styles.statusRow}>
            <View style={styles.statusBadge}>
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
                  ? `متصل بالخادم (${latencyMs ?? 0}ms)`
                  : connectionStatus === 'checking'
                  ? 'جاري فحص الاتصال...'
                  : 'الخادم غير متصل'}
              </Text>
            </View>
            <Text style={styles.statusLabel}>حالة الاتصال:</Text>
          </View>

          <Pressable
            style={[styles.pingBtn, testing && styles.btnDisabled]}
            onPress={handleTestPing}
            disabled={testing}>
            {testing ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.pingBtnText}>⚡ إجراء اختبار فوري (Ping /health)</Text>
            )}
          </Pressable>

          {healthData && (
            <View style={styles.responseBox}>
              <Text style={styles.responseTitle}>استجابة الخادم (/health payload):</Text>
              <Text style={styles.responseJson}>{JSON.stringify(healthData, null, 2)}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Broadcast Announcement */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>📢 إرسال تعميم أو إشعار جماعي (Broadcast Notification)</Text>
        <Text style={styles.cardDesc}>
          بث إشعار فوري لجميع الطلاب والأساتذة أو فئة محددة عبر قاعدة بيانات المعهد.
        </Text>

        {notifStatus && (
          <View style={styles.notifStatusBox}>
            <Text style={styles.notifStatusText}>{notifStatus}</Text>
          </View>
        )}

        <Text style={styles.label}>الفئة المستهدفة:</Text>
        <View style={styles.targetRow}>
          <Pressable
            style={[styles.targetBtn, notifTarget === 'all' && styles.targetBtnActive]}
            onPress={() => setNotifTarget('all')}>
            <Text style={[styles.targetText, notifTarget === 'all' && styles.targetTextActive]}>الجميع (All)</Text>
          </Pressable>
          <Pressable
            style={[styles.targetBtn, notifTarget === 'student' && styles.targetBtnActive]}
            onPress={() => setNotifTarget('student')}>
            <Text style={[styles.targetText, notifTarget === 'student' && styles.targetTextActive]}>الطلاب فقط</Text>
          </Pressable>
          <Pressable
            style={[styles.targetBtn, notifTarget === 'teacher' && styles.targetBtnActive]}
            onPress={() => setNotifTarget('teacher')}>
            <Text style={[styles.targetText, notifTarget === 'teacher' && styles.targetTextActive]}>الأساتذة فقط</Text>
          </Pressable>
        </View>

        <Text style={styles.label}>عنوان التعميم:</Text>
        <TextInput
          style={styles.input}
          value={notifTitle}
          onChangeText={setNotifTitle}
          placeholder="مثال: عطلة رسمية بمناسبة عيد الفطر"
          placeholderTextColor="#64748B"
        />

        <Text style={styles.label}>نص التعميم والرسالة:</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={notifMessage}
          onChangeText={setNotifMessage}
          placeholder="اكتب تفاصيل الإشعار هنا..."
          placeholderTextColor="#64748B"
          multiline
          numberOfLines={3}
        />

        <Pressable
          style={[styles.sendBtn, sendingNotif && styles.btnDisabled]}
          onPress={handleSendNotification}
          disabled={sendingNotif}>
          {sendingNotif ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.sendBtnText}>إرسال وتعميم الإشعار 🚀</Text>
          )}
        </Pressable>
      </View>

      {/* Session & Security Info */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🔒 جلسة المدير والأمان (Admin Identity & JWT)</Text>
        <View style={styles.sessionGrid}>
          <View style={styles.sessionRow}>
            <Text style={styles.sessionValue}>{user?.fullName || 'غير مسجل'}</Text>
            <Text style={styles.sessionLabel}>المستخدم الحالي:</Text>
          </View>
          <View style={styles.sessionRow}>
            <Text style={styles.sessionValue}>{user?.role || 'admin'}</Text>
            <Text style={styles.sessionLabel}>الصلاحية (Role):</Text>
          </View>
          <View style={styles.sessionRow}>
            <Text style={styles.sessionValue}>{isDemoMode ? 'وضع المحاكاة' : 'اتصال حي بالخادم'}</Text>
            <Text style={styles.sessionLabel}>نمط التشغيل:</Text>
          </View>
          <View style={styles.sessionRow}>
            <Text style={styles.sessionValue} numberOfLines={1}>
              {token ? `${token.substring(0, 24)}...` : 'لا يوجد'}
            </Text>
            <Text style={styles.sessionLabel}>رمز الـ JWT Token:</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090D16',
  },
  content: {
    padding: 24,
    paddingBottom: 60,
  },
  pageTitle: {
    color: '#F8FAFC',
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'right',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#0F172A',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#1E293B',
    padding: 22,
    marginBottom: 24,
  },
  cardTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'right',
    marginBottom: 6,
  },
  cardDesc: {
    color: '#94A3B8',
    fontSize: 12,
    textAlign: 'right',
    marginBottom: 16,
  },
  label: {
    color: '#94A3B8',
    fontSize: 12,
    marginBottom: 6,
    textAlign: 'right',
  },
  urlRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  urlInput: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    color: '#FFFFFF',
    fontSize: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  saveBtn: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 16,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  statusBox: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 16,
    gap: 12,
  },
  statusRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusLabel: {
    color: '#CBD5E1',
    fontSize: 13,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotGreen: { backgroundColor: '#10B981' },
  dotYellow: { backgroundColor: '#F59E0B' },
  dotRed: { backgroundColor: '#EF4444' },
  statusText: {
    fontSize: 13,
    fontWeight: '700',
  },
  textGreen: { color: '#10B981' },
  textYellow: { color: '#F59E0B' },
  textRed: { color: '#EF4444' },
  pingBtn: {
    backgroundColor: '#334155',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  pingBtnText: {
    color: '#F8FAFC',
    fontWeight: '700',
    fontSize: 13,
  },
  btnDisabled: { opacity: 0.6 },
  responseBox: {
    backgroundColor: '#0F172A',
    borderRadius: 10,
    padding: 12,
    marginTop: 6,
  },
  responseTitle: {
    color: '#64748B',
    fontSize: 11,
    marginBottom: 4,
    textAlign: 'right',
  },
  responseJson: {
    color: '#38BDF8',
    fontSize: 11,
    fontFamily: 'monospace',
  },
  targetRow: {
    flexDirection: 'row-reverse',
    gap: 10,
    marginBottom: 16,
  },
  targetBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  targetBtnActive: {
    backgroundColor: '#312E81',
    borderColor: '#6366F1',
  },
  targetText: {
    color: '#94A3B8',
    fontSize: 12,
  },
  targetTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  input: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    color: '#FFFFFF',
    fontSize: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    textAlign: 'right',
    marginBottom: 14,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  sendBtn: {
    backgroundColor: '#6366F1',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  sendBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  notifStatusBox: {
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    padding: 10,
    borderRadius: 10,
    marginBottom: 14,
  },
  notifStatusText: {
    color: '#818CF8',
    fontSize: 13,
    textAlign: 'right',
  },
  sessionGrid: {
    gap: 10,
  },
  sessionRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  sessionLabel: {
    color: '#94A3B8',
    fontSize: 13,
  },
  sessionValue: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '600',
  },
});
