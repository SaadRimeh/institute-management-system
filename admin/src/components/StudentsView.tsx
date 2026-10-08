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
import { mockStudents } from '../api/mockData';
import { User } from '../api/types';
import { useAuth } from '../context/AuthContext';

interface StudentsViewProps {
  onOpenEnrollmentModal?: (student: User) => void;
}

export const StudentsView: React.FC<StudentsViewProps> = () => {
  const { connectionStatus, isDemoMode } = useAuth();
  const [students, setStudents] = useState<User[]>(mockStudents);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  // Add Student Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [fullName, setFullName] = useState('');
  const [primaryContact, setPrimaryContact] = useState('');
  const [loginCode, setLoginCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const loadStudents = async () => {
    if (connectionStatus === 'connected' && !isDemoMode) {
      setLoading(true);
      try {
        const res = await api.getStudents(search);
        if (res.success && res.data) {
          setStudents(res.data);
        }
      } catch {
        // fallback
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadStudents();
  }, [connectionStatus, isDemoMode]);

  const filteredStudents = students.filter(
    (s) =>
      s.fullName.toLowerCase().includes(search.toLowerCase()) ||
      s.primaryContact.includes(search)
  );

  const handleCreateStudent = async () => {
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
      const res = await api.createStudent({
        fullName: fullName.trim(),
        primaryContact: primaryContact.trim(),
        phones: [{ number: primaryContact.trim(), label: 'شخصي' }],
        loginCode: generatedCode,
      });

      if (res.success && res.data) {
        setStudents([res.data, ...students]);
        setModalVisible(false);
        resetForm();
      } else {
        setFormError(res.message || 'فشل إضافة الطالب');
      }
    } else {
      // Local/Demo Mode update
      const newStudent: User = {
        id: `std-${Date.now()}`,
        fullName: fullName.trim(),
        role: 'student',
        primaryContact: primaryContact.trim(),
        phones: [{ number: primaryContact.trim(), label: 'شخصي' }],
        isActive: true,
      };
      setStudents([newStudent, ...students]);
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
      {/* Top Bar: Search & Add button */}
      <View style={styles.topBar}>
        <Pressable
          style={styles.addBtn}
          onPress={() => setModalVisible(true)}>
          <Text style={styles.addBtnText}>➕ إضافة طالب جديد</Text>
        </Pressable>

        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="🔍 ابحث بالاسم أو برقم الهاتف..."
          placeholderTextColor="#64748B"
        />
      </View>

      {/* List */}
      <ScrollView contentContainerStyle={styles.listContainer}>
        {loading ? (
          <ActivityIndicator color="#6366F1" size="large" style={{ marginTop: 40 }} />
        ) : filteredStudents.length > 0 ? (
          filteredStudents.map((student) => (
            <View key={student.id || student._id} style={styles.studentCard}>
              <View style={styles.studentInfo}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{student.fullName[0]}</Text>
                </View>
                <View style={styles.textGroup}>
                  <Text style={styles.studentName}>{student.fullName}</Text>
                  <Text style={styles.studentPhone}>📞 {student.primaryContact}</Text>
                </View>
              </View>

              <View style={styles.studentActions}>
                <View style={[styles.badge, student.isActive ? styles.badgeActive : styles.badgeInactive]}>
                  <Text style={[styles.badgeText, student.isActive ? styles.textGreen : styles.textRed]}>
                    {student.isActive ? 'نشط ومسجل' : 'غير نشط'}
                  </Text>
                </View>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🎓</Text>
            <Text style={styles.emptyText}>لم يتم العثور على أي طلاب مطابقين</Text>
          </View>
        )}
      </ScrollView>

      {/* Add Student Modal */}
      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>➕ تسجيل طالب جديد</Text>
              <Pressable onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                <Text style={styles.closeBtnText}>✕</Text>
              </Pressable>
            </View>

            {formError && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>⚠️ {formError}</Text>
              </View>
            )}

            <Text style={styles.label}>الاسم الثلاثي للطالب:</Text>
            <TextInput
              style={styles.modalInput}
              value={fullName}
              onChangeText={setFullName}
              placeholder="مثال: محمد سعيد الأحمد"
              placeholderTextColor="#64748B"
            />

            <Text style={styles.label}>رقم الهاتف أو المعرّف الأساسي:</Text>
            <TextInput
              style={styles.modalInput}
              value={primaryContact}
              onChangeText={setPrimaryContact}
              placeholder="0911223344"
              placeholderTextColor="#64748B"
              keyboardType="phone-pad"
            />

            <Text style={styles.label}>رمز الدخول (6 أرقام - اتركه فارغاً للتوليد التلقائي):</Text>
            <TextInput
              style={styles.modalInput}
              value={loginCode}
              onChangeText={(t) => setLoginCode(t.replace(/[^0-9]/g, '').slice(0, 6))}
              placeholder="مثال: 654321"
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
                onPress={handleCreateStudent}
                disabled={submitting}>
                {submitting ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.submitBtnText}>حفظ وتسجيل الطالب</Text>
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
    backgroundColor: '#4F46E5',
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
  studentCard: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1E293B',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  studentInfo: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 14,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#312E81',
    borderWidth: 1,
    borderColor: '#6366F1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#818CF8',
    fontSize: 18,
    fontWeight: 'bold',
  },
  textGroup: {
    alignItems: 'flex-end',
  },
  studentName: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'right',
  },
  studentPhone: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 2,
    textAlign: 'right',
  },
  studentActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  badgeActive: { backgroundColor: 'rgba(16, 185, 129, 0.15)' },
  badgeInactive: { backgroundColor: 'rgba(239, 68, 68, 0.15)' },
  badgeText: { fontSize: 11, fontWeight: '700' },
  textGreen: { color: '#10B981' },
  textRed: { color: '#EF4444' },
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
  submitBtn: { backgroundColor: '#4F46E5' },
  submitBtnText: { color: '#FFFFFF', fontWeight: '700' },
});
