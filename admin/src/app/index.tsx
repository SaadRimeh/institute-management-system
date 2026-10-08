import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { LoginScreen } from '@/components/LoginScreen';
import { AdminHeader } from '@/components/AdminHeader';
import { AdminNavBar, AdminTab } from '@/components/AdminNavBar';
import { DashboardView } from '@/components/DashboardView';
import { StudentsView } from '@/components/StudentsView';
import { TeachersView } from '@/components/TeachersView';
import { CoursesView } from '@/components/CoursesView';
import { FinanceView } from '@/components/FinanceView';
import { DiagnosticsView } from '@/components/DiagnosticsView';

export default function AdminApp() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');

  // If not logged in, show Login Screen
  if (!user) {
    return <LoginScreen />;
  }

  return (
    <View style={styles.container}>
      {/* Top Navbar */}
      <AdminHeader />

      {/* Module Navigation Tabs */}
      <AdminNavBar activeTab={activeTab} onSelectTab={setActiveTab} />

      {/* Main View Area */}
      <View style={styles.mainContent}>
        {activeTab === 'dashboard' && (
          <DashboardView
            onNavigateTab={(tab) => setActiveTab(tab as AdminTab)}
            onOpenAddStudent={() => setActiveTab('students')}
            onOpenAddCourse={() => setActiveTab('courses')}
            onOpenAddPayment={() => setActiveTab('finance')}
            onOpenNotification={() => setActiveTab('diagnostics')}
          />
        )}
        {activeTab === 'students' && <StudentsView />}
        {activeTab === 'teachers' && <TeachersView />}
        {activeTab === 'courses' && <CoursesView />}
        {activeTab === 'finance' && <FinanceView />}
        {activeTab === 'diagnostics' && <DiagnosticsView />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090D16',
  },
  mainContent: {
    flex: 1,
  },
});
