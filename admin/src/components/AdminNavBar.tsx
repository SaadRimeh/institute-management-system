import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export type AdminTab = 'dashboard' | 'students' | 'teachers' | 'courses' | 'finance' | 'diagnostics';

interface AdminNavBarProps {
  activeTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
}

const tabs: { key: AdminTab; label: string; icon: string }[] = [
  { key: 'dashboard', label: 'لوحة التحكم', icon: '📊' },
  { key: 'students', label: 'الطلاب', icon: '🎓' },
  { key: 'teachers', label: 'الأساتذة', icon: '👨‍🏫' },
  { key: 'courses', label: 'الدورات', icon: '📚' },
  { key: 'finance', label: 'المالية', icon: '💳' },
  { key: 'diagnostics', label: 'فحص الاتصال', icon: '⚙️' },
];

export const AdminNavBar: React.FC<AdminNavBarProps> = ({ activeTab, onSelectTab }) => {
  return (
    <View style={styles.container}>
      <View style={styles.tabList}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <Pressable
              key={tab.key}
              style={[styles.tabButton, isActive && styles.tabButtonActive]}
              onPress={() => onSelectTab(tab.key)}>
              <Text style={styles.tabIcon}>{tab.icon}</Text>
              <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                {tab.label}
              </Text>
              {isActive && <View style={styles.activeIndicator} />}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0F172A',
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    paddingHorizontal: 16,
  },
  tabList: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
    overflow: 'hidden',
  },
  tabButton: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    position: 'relative',
  },
  tabButtonActive: {},
  tabIcon: {
    fontSize: 16,
  },
  tabLabel: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '600',
  },
  tabLabelActive: {
    color: '#818CF8',
    fontWeight: '700',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 8,
    right: 8,
    height: 3,
    backgroundColor: '#6366F1',
    borderRadius: 2,
  },
});
