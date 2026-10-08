import React, { useState } from 'react';
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
import { mockCourses, mockStudents, mockTeachers } from '../api/mockData';
import { useAuth } from '../context/AuthContext';
import { StatCard } from './StatCard';

interface PaymentLedgerItem {
  id: string;
  studentName?: string;
  teacherName?: string;
  courseName: string;
  amount: number;
  kind: 'student_payment' | 'teacher_salary';
  date: string;
  note: string;
}

export const FinanceView: React.FC = () => {
  const { connectionStatus, isDemoMode } = useAuth();

  // Mock transaction ledger
  const [payments, setPayments] = useState<PaymentLedgerItem[]>([
    {
      id: 'pay-1',
      studentName: 'أحمد محمود العلي',
      courseName: 'برمجة الويب المتكاملة',
      amount: 150,
      kind: 'student_payment',
      date: '2026-10-08',
      note: 'الدفعة الأولى',
    },
    {
      id: 'pay-2',
      teacherName: 'د. سامر الحلبي',
      courseName: 'برمجة الويب المتكاملة',
      amount: 120,
      kind: 'teacher_salary',
      date: '2026-10-07',
      note: 'راتب شهر سبتمبر',
    },
    {
      id: 'pay-3',
      studentName: 'سارة خالد النجار',
      courseName: 'تصميم واجهات وتجربة المستخدم',
      amount: 280,
      kind: 'student_payment',
      date: '2026-10-06',
      note: 'سداد كامل المبلغ',
    },
  ]);

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [paymentType, setPaymentType] = useState<'student_payment' | 'teacher_salary'>('student_payment');
  const [selectedStudent, setSelectedStudent] = useState(mockStudents[0].id);
  const [selectedTeacher, setSelectedTeacher] = useState(mockTeachers[0].id);
  const [selectedCourse, setSelectedCourse] = useState(mockCourses[0].id);
  const [amount, setAmount] = useState('100');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreatePayment = async () => {
    if (!amount || Number(amount) <= 0) {
      setError('يرجى إدخال مبلغ صحيح');
      return;
    }

    setSubmitting(true);
    setError(null);

    if (connectionStatus === 'connected' && !isDemoMode) {
      if (paymentType === 'student_payment') {
        const res = await api.createStudentPayment({
          studentId: selectedStudent,
          courseId: selectedCourse,
          amount: Number(amount),
          note: note.trim(),
        });
        if (!res.success) {
          setError(res.message || 'فشل تسجيل الدفعة');
          setSubmitting(false);
          return;
        }
      } else {
        const res = await api.createTeacherPayment({
          teacherId: selectedTeacher,
          courseId: selectedCourse,
          amount: Number(amount),
          note: note.trim(),
        });
        if (!res.success) {
          setError(res.message || 'فشل صرف الراتب');
          setSubmitting(false);
          return;
        }
      }
    }

    // Add to ledger
    const st = mockStudents.find((s) => s.id === selectedStudent);
    const tc = mockTeachers.find((t) => t.id === selectedTeacher);
    const cr = mockCourses.find((c) => c.id === selectedCourse);

    setPayments([
      {
        id: `pay-${Date.now()}`,
        studentName: st?.fullName,
        teacherName: tc?.fullName,
        courseName: cr?.name || 'دورة',
        amount: Number(amount),
        kind: paymentType,
        date: new Date().toISOString().split('T')[0],
        note: note.trim(),
      },
      ...payments,
    ]);

    setModalVisible(false);
    setSubmitting(false);
    setAmount('100');
    setNote('');
  };

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.topBar}>
        <Pressable style={styles.addBtn} onPress={() => setModalVisible(true)}>
          <Text style={styles.addBtnText}>💵 تسجيل حركة مالية جديدة</Text>
        </Pressable>
        <Text style={styles.headerTitle}>المالية والحسابات والرواتب</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Metric Cards */}
        <View style={styles.kpiRow}>
          <StatCard
            title="إجمالي المقبوضات"
            value="$48,250"
            subtitle="مدفوعات الطلاب المسجلة"
            icon="📥"
            color="emerald"
          />
          <StatCard
            title="الرواتب المصروفة"
            value="$16,800"
            subtitle="مستحقات الكادر التدريسي"
            icon="📤"
            color="amber"
          />
          <StatCard
            title="الرصيد الصافي"
            value="$31,450"
            subtitle="صافي الأرباح المحققة"
            icon="💎"
            color="indigo"
          />
        </View>

        {/* Transactions Ledger */}
        <Text style={styles.sectionTitle}>سجل القيود والحركات المالية الأخيرة</Text>
        <View style={styles.ledgerTable}>
          {payments.map((p) => (
            <View key={p.id} style={styles.ledgerRow}>
              <View style={styles.amountCol}>
                <Text
                  style={[
                    styles.amountText,
                    p.kind === 'student_payment' ? styles.textGreen : styles.textAmber,
                  ]}>
                  {p.kind === 'student_payment' ? `+$${p.amount}` : `-$${p.amount}`}
                </Text>
                <Text style={styles.dateText}>{p.date}</Text>
              </View>

              <View style={styles.descCol}>
                <View style={styles.titleRow}>
                  <View
                    style={[
                      styles.kindBadge,
                      p.kind === 'student_payment' ? styles.kindBadgeGreen : styles.kindBadgeAmber,
                    ]}>
                    <Text
                      style={[
                        styles.kindText,
                        p.kind === 'student_payment' ? styles.textGreen : styles.textAmber,
                      ]}>
                      {p.kind === 'student_payment' ? 'سند قبض طالب' : 'صرف راتب أستاذ'}
                    </Text>
                  </View>
                  <Text style={styles.partyName}>
                    {p.kind === 'student_payment' ? p.studentName : p.teacherName}
                  </Text>
                </View>

                <Text style={styles.courseSubtitle}>
                  {p.courseName} {p.note ? `• ${p.note}` : ''}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Record Payment Modal */}
      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>💵 تسجيل حركة مالية</Text>
              <Pressable onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                <Text style={styles.closeBtnText}>✕</Text>
              </Pressable>
            </View>

            {error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>⚠️ {error}</Text>
              </View>
            )}

            <Text style={styles.label}>نوع الحركة المالية:</Text>
            <View style={styles.typeSelector}>
              <Pressable
                style={[styles.typeBtn, paymentType === 'student_payment' && styles.typeBtnActive]}
                onPress={() => setPaymentType('student_payment')}>
                <Text style={[styles.typeBtnText, paymentType === 'student_payment' && styles.typeBtnTextActive]}>
                  📥 قبض دفعة طالب
                </Text>
              </Pressable>
              <Pressable
                style={[styles.typeBtn, paymentType === 'teacher_salary' && styles.typeBtnActiveAmber]}
                onPress={() => setPaymentType('teacher_salary')}>
                <Text style={[styles.typeBtnText, paymentType === 'teacher_salary' && styles.typeBtnTextActive]}>
                  📤 صرف راتب مدرس
                </Text>
              </Pressable>
            </View>

            {paymentType === 'student_payment' ? (
              <>
                <Text style={styles.label}>الطالب المستهدف:</Text>
                <View style={styles.pickerBox}>
                  {mockStudents.map((st) => (
                    <Pressable
                      key={st.id}
                      style={[styles.pickerItem, selectedStudent === st.id && styles.pickerItemActive]}
                      onPress={() => setSelectedStudent(st.id)}>
                      <Text style={[styles.pickerItemText, selectedStudent === st.id && styles.pickerItemTextActive]}>
                        {st.fullName}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </>
            ) : (
              <>
                <Text style={styles.label}>المدرس المستحق:</Text>
                <View style={styles.pickerBox}>
                  {mockTeachers.map((tc) => (
                    <Pressable
                      key={tc.id}
                      style={[styles.pickerItem, selectedTeacher === tc.id && styles.pickerItemActive]}
                      onPress={() => setSelectedTeacher(tc.id)}>
                      <Text style={[styles.pickerItemText, selectedTeacher === tc.id && styles.pickerItemTextActive]}>
                        {tc.fullName}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </>
            )}

            <Text style={styles.label}>المبلغ ($):</Text>
            <TextInput
              style={styles.modalInput}
              value={amount}
              onChangeText={setAmount}
              placeholder="100"
              placeholderTextColor="#64748B"
              keyboardType="numeric"
            />

            <Text style={styles.label}>ملاحظات أو رقم الإيصال:</Text>
            <TextInput
              style={styles.modalInput}
              value={note}
              onChangeText={setNote}
              placeholder="دفعة كاش / حوالة بنكية"
              placeholderTextColor="#64748B"
            />

            <View style={styles.modalActions}>
              <Pressable style={[styles.modalBtn, styles.cancelBtn]} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelBtnText}>إلغاء</Text>
              </Pressable>
              <Pressable
                style={[styles.modalBtn, paymentType === 'student_payment' ? styles.submitBtnGreen : styles.submitBtnAmber]}
                onPress={handleCreatePayment}
                disabled={submitting}>
                {submitting ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.submitBtnText}>تأكيد وتثبيت الحركة</Text>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'right',
  },
  addBtn: {
    backgroundColor: '#10B981',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 14,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  content: {
    paddingBottom: 40,
  },
  kpiRow: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 28,
  },
  sectionTitle: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 14,
    textAlign: 'right',
  },
  ledgerTable: {
    backgroundColor: '#0F172A',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#1E293B',
    padding: 16,
    gap: 12,
  },
  ledgerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  descCol: {
    alignItems: 'flex-end',
    flex: 1,
    marginLeft: 16,
  },
  titleRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 10,
    marginBottom: 4,
  },
  partyName: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '700',
  },
  kindBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  kindBadgeGreen: { backgroundColor: 'rgba(16, 185, 129, 0.15)' },
  kindBadgeAmber: { backgroundColor: 'rgba(245, 158, 11, 0.15)' },
  kindText: { fontSize: 11, fontWeight: '700' },
  courseSubtitle: {
    color: '#64748B',
    fontSize: 12,
    textAlign: 'right',
  },
  amountCol: {
    alignItems: 'flex-start',
  },
  amountText: {
    fontSize: 16,
    fontWeight: '800',
  },
  dateText: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 2,
  },
  textGreen: { color: '#10B981' },
  textAmber: { color: '#F59E0B' },
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
    marginBottom: 16,
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
    fontSize: 12,
    marginBottom: 6,
    textAlign: 'right',
  },
  typeSelector: {
    flexDirection: 'row-reverse',
    gap: 10,
    marginBottom: 16,
  },
  typeBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  typeBtnActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderColor: '#10B981',
  },
  typeBtnActiveAmber: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    borderColor: '#F59E0B',
  },
  typeBtnText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
  },
  typeBtnTextActive: {
    color: '#F8FAFC',
  },
  pickerBox: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  pickerItem: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
  },
  pickerItemActive: {
    backgroundColor: '#312E81',
    borderColor: '#6366F1',
  },
  pickerItemText: {
    color: '#94A3B8',
    fontSize: 12,
  },
  pickerItemTextActive: {
    color: '#F8FAFC',
    fontWeight: '700',
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
    marginBottom: 14,
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
  submitBtnGreen: { backgroundColor: '#10B981' },
  submitBtnAmber: { backgroundColor: '#F59E0B' },
  submitBtnText: { color: '#FFFFFF', fontWeight: '700' },
});
