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
import { mockCourses } from '../api/mockData';
import { Course } from '../api/types';
import { useAuth } from '../context/AuthContext';

export const CoursesView: React.FC = () => {
  const { connectionStatus, isDemoMode } = useAuth();
  const [courses, setCourses] = useState<Course[]>(mockCourses);
  const [loading, setLoading] = useState(false);

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [level, setLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [type, setType] = useState<'online' | 'offline'>('offline');
  const [price, setPrice] = useState('300');
  const [compensation, setCompensation] = useState('100');
  const [schedule, setSchedule] = useState('الأحد والثلاثاء 4:00 - 6:00 م');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const loadCourses = async () => {
    if (connectionStatus === 'connected' && !isDemoMode) {
      setLoading(true);
      try {
        const res = await api.getCourses();
        if (res.success && res.data) {
          setCourses(res.data);
        }
      } catch {
        // fallback
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadCourses();
  }, [connectionStatus, isDemoMode]);

  const handleCreateCourse = async () => {
    if (!name.trim() || !code.trim() || !price || !compensation) {
      setFormError('يرجى ملء كافة الحقول الأساسية للدورة');
      return;
    }

    setSubmitting(true);
    setFormError(null);

    const payload = {
      name: name.trim(),
      code: code.trim().toUpperCase(),
      level,
      type,
      price: Number(price),
      teacherCompensation: Number(compensation),
      schedule: schedule.trim(),
      durationWeeks: 12,
    };

    if (connectionStatus === 'connected' && !isDemoMode) {
      const res = await api.createCourse(payload);
      if (res.success && res.data) {
        setCourses([res.data, ...courses]);
        setModalVisible(false);
        resetForm();
      } else {
        setFormError(res.message || 'فشل إنشاء الدورة');
      }
    } else {
      const newCourse: Course = {
        id: `crs-${Date.now()}`,
        ...payload,
        isActive: true,
      };
      setCourses([newCourse, ...courses]);
      setModalVisible(false);
      resetForm();
    }
    setSubmitting(false);
  };

  const resetForm = () => {
    setName('');
    setCode('');
    setPrice('300');
    setCompensation('100');
    setFormError(null);
  };

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.topBar}>
        <Pressable style={styles.addBtn} onPress={() => setModalVisible(true)}>
          <Text style={styles.addBtnText}>➕ افتتاح دورة تدريبية جديدة</Text>
        </Pressable>
        <Text style={styles.headerTitle}>الدورات والمسارات الأكاديمية</Text>
      </View>

      <ScrollView contentContainerStyle={styles.listContainer}>
        {loading ? (
          <ActivityIndicator color="#A855F7" size="large" style={{ marginTop: 40 }} />
        ) : (
          <View style={styles.coursesGrid}>
            {courses.map((course) => (
              <View key={course.id || course._id} style={styles.courseCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.typeBadge}>
                    <Text style={styles.typeText}>
                      {course.type === 'online' ? '🌐 أونلاين' : '🏛️ حضوري'}
                    </Text>
                  </View>
                  <View style={styles.codeBadge}>
                    <Text style={styles.codeText}>{course.code}</Text>
                  </View>
                </View>

                <Text style={styles.courseName}>{course.name}</Text>
                {course.description ? (
                  <Text style={styles.courseDesc} numberOfLines={2}>
                    {course.description}
                  </Text>
                ) : null}

                <View style={styles.detailsBox}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailValue}>${course.price}</Text>
                    <Text style={styles.detailLabel}>رسوم الاشتراك:</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailValue}>${course.teacherCompensation}</Text>
                    <Text style={styles.detailLabel}>أجر المدرس:</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailValue}>
                      {course.level === 'beginner'
                        ? 'مبتدئ'
                        : course.level === 'intermediate'
                        ? 'متوسط'
                        : 'متقدم'}
                    </Text>
                    <Text style={styles.detailLabel}>المستوى:</Text>
                  </View>
                  {course.schedule ? (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailValue}>{course.schedule}</Text>
                      <Text style={styles.detailLabel}>الموعد:</Text>
                    </View>
                  ) : null}
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Add Course Modal */}
      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>📚 إضافة دورة جديدة</Text>
              <Pressable onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                <Text style={styles.closeBtnText}>✕</Text>
              </Pressable>
            </View>

            {formError && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>⚠️ {formError}</Text>
              </View>
            )}

            <Text style={styles.label}>عنوان الدورة:</Text>
            <TextInput
              style={styles.modalInput}
              value={name}
              onChangeText={setName}
              placeholder="مثال: تطوير تطبيقات الهواتف الذكية"
              placeholderTextColor="#64748B"
            />

            <View style={styles.inputRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>رمز الدورة (الكود):</Text>
                <TextInput
                  style={styles.modalInput}
                  value={code}
                  onChangeText={setCode}
                  placeholder="APP-101"
                  placeholderTextColor="#64748B"
                  autoCapitalize="characters"
                />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.label}>سعر الدورة ($):</Text>
                <TextInput
                  style={styles.modalInput}
                  value={price}
                  onChangeText={setPrice}
                  placeholder="300"
                  placeholderTextColor="#64748B"
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.inputRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>حصة / راتب المدرس ($):</Text>
                <TextInput
                  style={styles.modalInput}
                  value={compensation}
                  onChangeText={setCompensation}
                  placeholder="100"
                  placeholderTextColor="#64748B"
                  keyboardType="numeric"
                />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.label}>النمط:</Text>
                <View style={styles.toggleRow}>
                  <Pressable
                    style={[styles.toggleBtn, type === 'offline' && styles.toggleActive]}
                    onPress={() => setType('offline')}>
                    <Text style={[styles.toggleText, type === 'offline' && styles.toggleTextActive]}>حضوري</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.toggleBtn, type === 'online' && styles.toggleActive]}
                    onPress={() => setType('online')}>
                    <Text style={[styles.toggleText, type === 'online' && styles.toggleTextActive]}>أونلاين</Text>
                  </Pressable>
                </View>
              </View>
            </View>

            <Text style={styles.label}>المواعيد والجدول:</Text>
            <TextInput
              style={styles.modalInput}
              value={schedule}
              onChangeText={setSchedule}
              placeholder="مثال: الأحد والثلاثاء 4:00 - 6:00 م"
              placeholderTextColor="#64748B"
            />

            <View style={styles.modalActions}>
              <Pressable style={[styles.modalBtn, styles.cancelBtn]} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelBtnText}>إلغاء</Text>
              </Pressable>
              <Pressable
                style={[styles.modalBtn, styles.submitBtn]}
                onPress={handleCreateCourse}
                disabled={submitting}>
                {submitting ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.submitBtnText}>حفظ وافتتاح الدورة</Text>
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
    backgroundColor: '#9333EA',
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
    paddingBottom: 40,
  },
  coursesGrid: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: 16,
  },
  courseCard: {
    flex: 1,
    minWidth: 300,
    backgroundColor: '#0F172A',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#1E293B',
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  codeBadge: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  codeText: {
    color: '#C084FC',
    fontWeight: '700',
    fontSize: 12,
  },
  typeBadge: {
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  typeText: {
    color: '#38BDF8',
    fontWeight: '600',
    fontSize: 11,
  },
  courseName: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'right',
    marginBottom: 6,
  },
  courseDesc: {
    color: '#94A3B8',
    fontSize: 12,
    textAlign: 'right',
    marginBottom: 14,
  },
  detailsBox: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
  },
  detailLabel: {
    color: '#94A3B8',
    fontSize: 12,
  },
  detailValue: {
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxWidth: 500,
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
    fontSize: 12,
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
    marginBottom: 14,
  },
  inputRow: {
    flexDirection: 'row-reverse',
    gap: 12,
  },
  toggleRow: {
    flexDirection: 'row-reverse',
    gap: 6,
    marginBottom: 14,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#1E293B',
    alignItems: 'center',
  },
  toggleActive: {
    backgroundColor: '#9333EA',
  },
  toggleText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
  toggleTextActive: {
    color: '#FFFFFF',
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
  submitBtn: { backgroundColor: '#9333EA' },
  submitBtnText: { color: '#FFFFFF', fontWeight: '700' },
});
