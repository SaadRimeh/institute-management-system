import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { ServerConfigModal } from './ServerConfigModal';

interface AdminHeaderProps {
  onOpenNotifications?: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ onOpenNotifications }) => {
  const { user, logout, connectionStatus, latencyMs, isDemoMode } = useAuth();
  const [showConfig, setShowConfig] = useState(false);

  return (
    <>
      <View style={styles.header}>
        {/* Left: User badge & Logout */}
        <View style={styles.leftSection}>
          <Pressable onPress={logout} style={styles.logoutBtn}>
            <Text style={styles.logoutText}>خروج</Text>
          </Pressable>

          <View style={styles.profileBadge}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.fullName ? user.fullName[0].toUpperCase() : 'A'}
              </Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user?.fullName || 'المدير العام'}</Text>
              <Text style={styles.userRole}>
                {isDemoMode ? 'وضع المعاينة التجريبي' : 'مسؤول النظام الرئيسي'}
              </Text>
            </View>
          </View>
        </View>

        {/* Center: Live Connection Badge */}
        <Pressable
          style={[
            styles.connBadge,
            connectionStatus === 'connected'
              ? styles.connBadgeGreen
              : connectionStatus === 'checking'
              ? styles.connBadgeYellow
              : styles.connBadgeRed,
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
          <Text
            style={[
              styles.connText,
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
              : 'الخادم غير متصل ⚙️'}
          </Text>
        </Pressable>

        {/* Right: Brand Title */}
        <View style={styles.brandContainer}>
          <View style={styles.brandIcon}>
            <Text style={styles.brandIconText}>🎓</Text>
          </View>
          <View>
            <Text style={styles.brandTitle}>نظام إدارة المعهد</Text>
            <Text style={styles.brandSubtitle}>لوحة تحكم الإدارة الأكاديمية</Text>
          </View>
        </View>
      </View>

      <ServerConfigModal visible={showConfig} onClose={() => setShowConfig(false)} />
    </>
  );
};

const styles = StyleSheet.create({
  header: {
    height: 70,
    backgroundColor: '#0F172A',
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    zIndex: 50,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  brandIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  brandIconText: {
    fontSize: 20,
  },
  brandTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'right',
  },
  brandSubtitle: {
    color: '#64748B',
    fontSize: 11,
    textAlign: 'right',
  },
  connBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  connBadgeGreen: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  connBadgeYellow: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  connBadgeRed: {
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
  connText: {
    fontSize: 12,
    fontWeight: '600',
  },
  textGreen: { color: '#10B981' },
  textYellow: { color: '#F59E0B' },
  textRed: { color: '#EF4444' },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  profileBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#1E293B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#334155',
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 12,
  },
  userInfo: {
    alignItems: 'flex-start',
  },
  userName: {
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: '700',
  },
  userRole: {
    color: '#94A3B8',
    fontSize: 10,
  },
  logoutBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  logoutText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '600',
  },
});
