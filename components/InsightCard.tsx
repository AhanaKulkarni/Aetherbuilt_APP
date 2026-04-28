import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { AlertTriangle, Info, Zap, ArrowRight } from 'lucide-react-native';
import { Layout, LightTheme, DarkTheme } from '../theme/tokens';
import { useTheme } from '../hooks/useTheme';
import { Insight } from '../lib/InsightEngine';
import Animated, { FadeInRight } from 'react-native-reanimated';

interface InsightCardProps {
  insight: Insight;
  onAction: (command: string) => void;
}

export default function InsightCard({ insight, onAction }: InsightCardProps) {
  const { theme, isDarkMode } = useTheme();

  const getColors = () => {
    if (isDarkMode) {
      switch (insight.type) {
        case 'CRITICAL': return { bg: '#450a0a', border: '#991b1b', icon: theme.accentRed, text: '#fecaca' };
        case 'WARNING': return { bg: '#451a03', border: '#92400e', icon: theme.accentAmber, text: '#fef3c7' };
        case 'OPPORTUNITY': return { bg: '#064e3b', border: '#065f46', icon: theme.accentGreen, text: '#d1fae5' };
        default: return { bg: '#1e293b', border: '#334155', icon: theme.textMuted, text: theme.textPrimary };
      }
    }
    switch (insight.type) {
      case 'CRITICAL': return { bg: '#FEF2F2', border: '#FCA5A5', icon: theme.accentRed, text: '#991B1B' };
      case 'WARNING': return { bg: '#FFFBEB', border: '#FCD34D', icon: theme.accentAmber, text: '#92400E' };
      case 'OPPORTUNITY': return { bg: '#F0FDF4', border: '#86EFAC', icon: theme.accentGreen, text: '#166534' };
      default: return { bg: '#F8FAFC', border: '#CBD5E1', icon: theme.textMuted, text: theme.textPrimary };
    }
  };

  const colors = getColors();

  return (
    <Animated.View entering={FadeInRight} style={[styles.container, { backgroundColor: colors.bg, borderColor: colors.border }]}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          {insight.type === 'CRITICAL' ? <AlertTriangle size={18} color={colors.icon} /> : 
           insight.type === 'WARNING' ? <Zap size={18} color={colors.icon} /> : 
           <Info size={18} color={colors.icon} />}
        </View>
        <View style={styles.content}>
          <Text style={[styles.title, { color: colors.text }]}>{insight.title}</Text>
          <Text style={[styles.description, { color: isDarkMode ? theme.textMuted : '#475569' }]}>{insight.description}</Text>
        </View>
      </View>
      
      {insight.actionLabel && (
        <Pressable 
          style={styles.actionButton} 
          onPress={() => onAction(insight.actionCommand || '')}
        >
          <Text style={[styles.actionLabel, { color: colors.text }]}>{insight.actionLabel}</Text>
          <ArrowRight size={14} color={colors.text} />
        </Pressable>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
  },
  iconContainer: {
    marginRight: 12,
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginRight: 4,
    letterSpacing: 0.5,
  },
});
