import React, { useState, useEffect } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { api } from '../api/client';
import { mockDashboardData } from '../api/mockData';
import { DashboardData } from '../api/types';
import { useAuth } from '../context/AuthContext';
import { StatCard } from './StatCard';

interface DashboardViewProps {
  onNavigateTab: (tab: string) => void;
  onOpenAddStudent: () => void;
  onOpenAddCourse: () => void;
  onOpenAddPayment: () => void;
  onOpenNotification: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigateTab,
  onOpenAddStudent,
  onOpenAddCourse,
  onOpenAddPayment,
  onOpenNotification,
}) => {
  const { connectionStatus, isDemoMode } = useAuth();
  const [data, setData] = useState<DashboardData>(mockDashboardData);
  const [loading, setLoading] = useState(false);

  const fetchDashboard = async () => {
    if (connectionStatus === 'connected' && !isDemoMode) {
      setLoading(true);
      try {
        const res = await api.getDashboard();
        if (res.success && res.data) {
          setData(res.data);
        }
      } catch {
        // Fallback to mock on error
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [connectionStatus, isDemoMode]);

  const stats = data.stats;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Banner */}
      <View style={styles.welcomeBanner}>
        <View style={styles.welcomeTextGroup}>
          <Text style={styles.welcomeTitle}>مرحباً بك في لوحة القيادة الذكية 👋</Text>
          <Text style={styles.welcomeSubtitle}>
            إحصائيات فورية وإدارة متكاملة لشؤون الطلاب، المدرسين، والحسابات المالية
          </Text>
        </View>
        <Pressable style={styles.refreshBtn} onPress={fetchDashboard}>
          {loading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.refreshBtnText}>🔄 تحديث البيانات</Text>
          )}
        </Pressable>
      </View>

      {/* KPI Cards Grid */}
      <Text style={styles.sectionTitle}>المؤشرات الأكاديمية والمالية الرئيسية</Text>
      <View style={styles.kpiGrid}>
        <StatCard
          title="إجمالي الطلاب"
          value={stats.totalStudents || 0}
          subtitle="طالب مسجل ونشط"
          icon="🎓"
          color="indigo"
        />
        <StatCard
          title="الكادر التدريسي"
          value={stats.totalTeachers || 0}
          subtitle="مدرس معتمد"
          icon="👨‍🏫"
          color="cyan"
        />
        <StatCard
          title="الدورات المفتوحة"
          value={stats.totalCourses || 0}
          subtitle="مساق تدريبي متاح"
          icon="📚"
          color="purple"
        />
        <StatCard
          title="إجمالي التحصيلات"
          value={`$${(stats.studentPayments || 0).toLocaleString()}`}
          subtitle="إيرادات مدفوعات الطلاب"
          icon="💵"
          color="emerald"
        />
        <StatCard
          title="الرواتب المصروفة"
          value={`$${(stats.teacherPayments || 0).toLocaleString()}`}
          subtitle="مستحقات الأساتذة المسددة"
          icon="📤"
          color="amber"
        />
        <StatCard
          title="الذمم المتبقية"
          value={`$${(stats.remainingBalance || 0).toLocaleString()}`}
          subtitle="مستحقات قيد التحصيل"
          icon="⏳"
          color="rose"
        />
      </View>

      {/* Quick Actions Row */}
      <Text style={styles.sectionTitle}>الإجراءات السريعة</Text>
      <View style={styles.quickActionsRow}>
        <Pressable style={[styles.actionCard, styles.actionCardIndigo]} onPress={onOpenAddStudent}>
          <Text style={styles.actionIcon}>➕</Text>
          <Text style={styles.actionTitle}>تسجيل طالب جديد</Text>
          <Text style={styles.actionDesc}>إضافة ملف طالب وتوليد كود الدخول</Text>
        </Pressable>

        <Pressable style={[styles.actionCard, styles.actionCardCyan]} onPress={onOpenAddCourse}>
          <Text style={styles.actionIcon}>📖</Text>
          <Text style={styles.actionTitle}>افتتاح دورة تدريبية</Text>
          <Text style={styles.actionDesc}>تحديد الأسعار والجدول والأستاذ</Text>
        </Pressable>

        <Pressable style={[styles.actionCard, styles.actionCardEmerald]} onPress={onOpenAddPayment}>
          <Text style={styles.actionIcon}>💳</Text>
          <Text style={styles.actionTitle}>تسجيل سند قبض</Text>
          <Text style={styles.actionDesc}>تسجيل دفعة طالب في دورة</Text>
        </Pressable>

        <Pressable style={[styles.actionCard, styles.actionCardAmber]} onPress={onOpenNotification}>
          <Text style={styles.actionIcon}>📢</Text>
          <Text style={styles.actionTitle}>إرسال تعميم / إشعار</Text>
          <Text style={styles.actionDesc}>إرسال تنبيه جماعي للطلاب أو الأساتذة</Text>
        </Pressable>
      </View>

      {/* Split Section: Recent Activity & Recent Grades */}
      <View style={styles.tablesRow}>
        {/* Attendance Activity */}
        <View style={styles.tableCard}>
          <View style={styles.tableHeader}>
            <Pressable onPress={() => onNavigateTab('students')}>
              <Text style={styles.viewAllText}>عرض الكل ←</Text>
            </Pressable>
            <Text style={styles.tableTitle}>📋 أحدث تسجيلات الحضور والغياب</Text>
          </View>

          {data.recentAttendances?.length > 0 ? (
            data.recentAttendances.map((item, idx) => (
              <View key={item.id || idx} style={styles.rowItem}>
                <View style={[styles.statusBadge, item.status === 'present' ? styles.badgeGreen : styles.badgeYellow]}>
                  <Text style={[styles.statusBadgeText, item.status === 'present' ? styles.textGreen : styles.textYellow]}>
                    {item.status === 'present' ? 'حاضر' : item.status === 'absent' ? 'غائب' : 'متأخر'}
                  </Text>
                </View>

                <View style={styles.rowDetails}>
                  <Text style={styles.rowMainText}>
                    {typeof item.student === 'object' ? item.student?.fullName : 'طالب'}
                  </Text>
                  <Text style={styles.rowSubText}>
                    {typeof item.course === 'object' ? item.course?.name : 'الدورة'} • الأستاذ:{' '}
                    {typeof item.teacher === 'object' ? item.teacher?.fullName : 'مدرس'}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>لا توجد تسجيلات حضور حديثة</Text>
          )}
        </View>

        {/* Recent Grades */}
        <View style={styles.tableCard}>
          <View style={styles.tableHeader}>
            <Pressable onPress={() => onNavigateTab('courses')}>
              <Text style={styles.viewAllText}>عرض الكل ←</Text>
            </Pressable>
            <Text style={styles.tableTitle}>⭐ أحدث نتائج الامتحانات والتقييمات</Text>
          </View>

          {data.recentGrades?.length > 0 ? (
            data.recentGrades.map((grade, idx) => (
              <View key={grade.id || idx} style={styles.rowItem}>
                <View style={styles.scoreBadge}>
                  <Text style={styles.scoreText}>
                    {grade.score} / {grade.maxScore}
                  </Text>
                </View>

                <View style={styles.rowDetails}>
                  <Text style={styles.rowMainText}>
                    {typeof grade.student === 'object' ? grade.student?.fullName : 'طالب'}
                  </Text>
                  <Text style={styles.rowSubText}>
                    {grade.title} • {typeof grade.course === 'object' ? grade.course?.name : 'دورة'}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>لا توجد علامات مسجلة حديثاً</Text>
          )}
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
  welcomeBanner: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#334155',
    padding: 24,
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 28,
  },
  welcomeTextGroup: {
    flex: 1,
    alignItems: 'flex-end',
  },
  welcomeTitle: {
    color: '#F8FAFC',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 6,
    textAlign: 'right',
  },
  welcomeSubtitle: {
    color: '#94A3B8',
    fontSize: 13,
    textAlign: 'right',
  },
  refreshBtn: {
    backgroundColor: '#334155',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#475569',
  },
  refreshBtnText: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '600',
  },
  sectionTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'right',
  },
  kpiGrid: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 28,
  },
  quickActionsRow: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 28,
  },
  actionCard: {
    flex: 1,
    minWidth: 220,
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    alignItems: 'flex-end',
  },
  actionCardIndigo: { borderColor: 'rgba(99, 102, 241, 0.4)' },
  actionCardCyan: { borderColor: 'rgba(6, 182, 212, 0.4)' },
  actionCardEmerald: { borderColor: 'rgba(16, 185, 129, 0.4)' },
  actionCardAmber: { borderColor: 'rgba(245, 158, 11, 0.4)' },
  actionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  actionTitle: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
    textAlign: 'right',
  },
  actionDesc: {
    color: '#94A3B8',
    fontSize: 11,
    textAlign: 'right',
  },
  tablesRow: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: 20,
  },
  tableCard: {
    flex: 1,
    minWidth: 320,
    backgroundColor: '#0F172A',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#1E293B',
    padding: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  tableTitle: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'right',
  },
  viewAllText: {
    color: '#818CF8',
    fontSize: 12,
    fontWeight: '600',
  },
  rowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  rowDetails: {
    alignItems: 'flex-end',
    flex: 1,
    marginLeft: 12,
  },
  rowMainText: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'right',
  },
  rowSubText: {
    color: '#64748B',
    fontSize: 11,
    textAlign: 'right',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeGreen: { backgroundColor: 'rgba(16, 185, 129, 0.15)' },
  badgeYellow: { backgroundColor: 'rgba(245, 158, 11, 0.15)' },
  statusBadgeText: { fontSize: 11, fontWeight: '700' },
  textGreen: { color: '#10B981' },
  textYellow: { color: '#F59E0B' },
  scoreBadge: {
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  scoreText: {
    color: '#818CF8',
    fontWeight: '800',
    fontSize: 12,
  },
  emptyText: {
    color: '#64748B',
    fontSize: 12,
    textAlign: 'center',
    paddingVertical: 20,
  },
});
