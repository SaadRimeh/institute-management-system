import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: string;
  color: 'indigo' | 'emerald' | 'amber' | 'rose' | 'cyan' | 'purple';
}

const colorMap = {
  indigo: { bg: 'rgba(99, 102, 241, 0.12)', border: 'rgba(99, 102, 241, 0.3)', text: '#818CF8' },
  emerald: { bg: 'rgba(16, 185, 129, 0.12)', border: 'rgba(16, 185, 129, 0.3)', text: '#34D399' },
  amber: { bg: 'rgba(245, 158, 11, 0.12)', border: 'rgba(245, 158, 11, 0.3)', text: '#FBBF24' },
  rose: { bg: 'rgba(239, 68, 68, 0.12)', border: 'rgba(239, 68, 68, 0.3)', text: '#F87171' },
  cyan: { bg: 'rgba(6, 182, 212, 0.12)', border: 'rgba(6, 182, 212, 0.3)', text: '#38BDF8' },
  purple: { bg: 'rgba(168, 85, 247, 0.12)', border: 'rgba(168, 85, 247, 0.3)', text: '#C084FC' },
};

export const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, icon, color }) => {
  const current = colorMap[color] || colorMap.indigo;

  return (
    <View style={[styles.card, { borderColor: current.border }]}>
      <View style={styles.topRow}>
        <View style={[styles.iconContainer, { backgroundColor: current.bg }]}>
          <Text style={styles.iconText}>{icon}</Text>
        </View>
        <Text style={styles.titleText}>{title}</Text>
      </View>

      <Text style={[styles.valueText, { color: current.text }]}>{value}</Text>
      {subtitle ? <Text style={styles.subtitleText}>{subtitle}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 200,
    backgroundColor: '#1E293B',
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  topRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'right',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 18,
  },
  valueText: {
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'right',
    marginBottom: 4,
  },
  subtitleText: {
    color: '#64748B',
    fontSize: 11,
    textAlign: 'right',
  },
});
