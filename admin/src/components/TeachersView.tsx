import React, { useState, useEffect } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { api } from '../api/client';
import { mockTeachers } from '../api/mockData';
import { User } from '../api/types';
import { useAuth } from '../context/AuthContext';

export const TeachersView: React.FC = () => {
  const { connectionStatus, isDemoMode } = useAuth();
  const [teachers, setTeachers] = useState<User[]>(mockTeachers);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [fullName, setFullName] = useState('');
  const [primaryContact, setPrimaryContact] = useState('');
  const [loginCode, setLoginCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const loadTeachers = async () => {
    if (connectionStatus === 'connected' && !isDemoMode) {
      setLoading(true);
      try {
        const res = await api.getTeachers(search);
        if (res.success && res.data) {
          setTeachers(res.data);
        }
      } catch {
        // fallback
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadTeachers();
  }, [connectionStatus, isDemoMode]);

  const filteredTeachers = teachers.filter(
    (t) =>
      t.fullName.toLowerCase().includes(search.toLowerCase()) ||
      t.primaryContact.includes(search)
  );

  const handleCreateTeacher = async () => {
    if (!fullName.trim() || !primaryContact.trim()) {
      setFormError('يرجى ملء الاسم ورقم الهاتف الأساسي');
      return;
    }

    setSubmitting(true);
    setFormError(null);

    const generatedCode =
      loginCode.trim().length === 6
        ? loginCode.trim()
        : Math.floor(100000 + Math.random() * 900000).toString();

    if (connectionStatus === 'connected' && !isDemoMode) {
      const res = await api.createTeacher({
        fullName: fullName.trim(),
        primaryContact: primaryContact.trim(),
        phones: [{ number: primaryContact.trim(), label: 'رئيسي' }],
        loginCode: generatedCode,
      });

      if (res.success && res.data) {
        setTeachers([res.data, ...teachers]);
        setModalVisible(false);
        resetForm();
      } else {
        setFormError(res.message || 'فشل إضافة الأستاذ');
      }
    } else {
      const newTeacher: User = {
        id: `tch-${Date.now()}`,
        fullName: fullName.trim(),
        role: 'teacher',
        primaryContact: primaryContact.trim(),
        phones: [{ number: primaryContact.trim(), label: 'رئيسي' }],
        isActive: true,
      };
      setTeachers([newTeacher, ...teachers]);
      setModalVisible(false);
      resetForm();
    }
    setSubmitting(false);
  };

  const resetForm = () => {
    setFullName('');
    setPrimaryContact('');
    setLoginCode('');
    setFormError(null);
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Pressable
          style={styles.addBtn}
          onPress={() => setModalVisible(true)}>
          <Text style={styles.addBtnText}>➕ تعيين أستاذ جديد</Text>
        </Pressable>

        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="🔍 ابحث في كادر المدرسين..."
          placeholderTextColor="#64748B"
        />
      </View>

      <ScrollView contentContainerStyle={styles.listContainer}>
        {loading ? (
          <ActivityIndicator color="#06B6D4" size="large" style={{ marginTop: 40 }} />
        ) : filteredTeachers.length > 0 ? (
          filteredTeachers.map((teacher) => (
            <View key={teacher.id || teacher._id} style={styles.teacherCard}>
              <View style={styles.teacherInfo}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{teacher.fullName[0]}</Text>
                </View>
                <View style={styles.textGroup}>
                  <Text style={styles.teacherName}>{teacher.fullName}</Text>
                  <Text style={styles.teacherContact}>📞 {teacher.primaryContact}</Text>
                </View>
              </View>

              <View style={styles.actionsGroup}>
                <View style={styles.roleBadge}>
                  <Text style={styles.roleBadgeText}>مدرس معتمد</Text>
                </View>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>👨‍🏫</Text>
            <Text style={styles.emptyText}>لم يتم العثور على أي أساتذة مطابقين</Text>
          </View>
        )}
      </ScrollView>

      {/* Add Teacher Modal */}
      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>👨‍🏫 تعيين أستاذ جديد</Text>
              <Pressable onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                <Text style={styles.closeBtnText}>✕</Text>
              </Pressable>
            </View>

            {formError && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>⚠️ {formError}</Text>
              </View>
            )}

            <Text style={styles.label}>الاسم واللقب الأكاديمي:</Text>
            <TextInput
              style={styles.modalInput}
              value={fullName}
              onChangeText={setFullName}
              placeholder="مثال: د. سامر الحلبي"
              placeholderTextColor="#64748B"
            />

            <Text style={styles.label}>رقم هاتف الأستاذ:</Text>
            <TextInput
              style={styles.modalInput}
              value={primaryContact}
              onChangeText={setPrimaryContact}
              placeholder="0911223344"
              placeholderTextColor="#64748B"
              keyboardType="phone-pad"
            />

            <Text style={styles.label}>رمز الدخول (6 أرقام - اتركه فارغاً لتوليد كود تلقائي):</Text>
            <TextInput
              style={styles.modalInput}
              value={loginCode}
              onChangeText={(t) => setLoginCode(t.replace(/[^0-9]/g, '').slice(0, 6))}
              placeholder="مثال: 112233"
              placeholderTextColor="#64748B"
              keyboardType="numeric"
              maxLength={6}
            />

            <View style={styles.modalActions}>
              <Pressable
                style={[styles.modalBtn, styles.cancelBtn]}
                onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelBtnText}>إلغاء</Text>
              </Pressable>
              <Pressable
                style={[styles.modalBtn, styles.submitBtn]}
                onPress={handleCreateTeacher}
                disabled={submitting}>
                {submitting ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.submitBtnText}>حفظ وتثبيت الأستاذ</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090D16',
    padding: 24,
  },
  topBar: {
    flexDirection: 'row-reverse',
    gap: 16,
    marginBottom: 20,
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 14,
    color: '#FFFFFF',
    fontSize: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    textAlign: 'right',
  },
  addBtn: {
    backgroundColor: '#0EA5E9',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 14,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  listContainer: {
    gap: 12,
    paddingBottom: 40,
  },
  teacherCard: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1E293B',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  teacherInfo: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 14,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#0C4A6E',
    borderWidth: 1,
    borderColor: '#0284C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#38BDF8',
    fontSize: 18,
    fontWeight: 'bold',
  },
  textGroup: {
    alignItems: 'flex-end',
  },
  teacherName: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'right',
  },
  teacherContact: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 2,
    textAlign: 'right',
  },
  actionsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  roleBadge: {
    backgroundColor: 'rgba(14, 165, 233, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  roleBadgeText: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  emptyText: { color: '#64748B', fontSize: 14 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: '#0F172A',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#334155',
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
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
  closeBtnText: { color: '#94A3B8', fontWeight: 'bold' },
  label: {
    color: '#94A3B8',
    fontSize: 13,
    marginBottom: 6,
    textAlign: 'right',
  },
  modalInput: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    color: '#FFFFFF',
    fontSize: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    textAlign: 'right',
    marginBottom: 16,
  },
  errorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: '#EF4444',
    borderRadius: 10,
    padding: 10,
    marginBottom: 14,
  },
  errorText: { color: '#FCA5A5', fontSize: 12, textAlign: 'right' },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtn: { backgroundColor: '#334155' },
  cancelBtnText: { color: '#CBD5E1', fontWeight: '600' },
  submitBtn: { backgroundColor: '#0EA5E9' },
  submitBtnText: { color: '#FFFFFF', fontWeight: '700' },
});
