import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Pressable } from 'react-native';
import { Package, CheckCircle, AlertTriangle, Settings, FileText, Truck, ArrowRight, Zap, Play, Moon, Sun } from 'lucide-react-native';
import { Typography, Layout, LightTheme, DarkTheme } from '../../theme/tokens';
import CommandBar from '../../components/CommandBar';
import StatCard from '../../components/StatCard';
import InsightCard from '../../components/InsightCard';
import ActionCard from '../../components/ActionCard';
import { useFactory } from '../../hooks/useFactory';
import { useCommand } from '../../hooks/useCommand';
import { useTheme } from '../../hooks/useTheme';
import Animated, { FadeInDown, FadeIn, LinearTransition } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

export default function DashboardScreen() {
  const { 
    orders, machines, insights, loadData, toggleDarkMode, isDarkMode
  } = useFactory();
  const { executeCommand } = useCommand();
  const { theme } = useTheme();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const activeOrdersCount = orders.filter(o => o.status !== 'COMPLETED').length;
  const criticalInsights = insights.filter(i => i.type === 'CRITICAL');
  const otherInsights = insights.filter(i => i.type !== 'CRITICAL');

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.background }]} 
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Animated.View layout={LinearTransition}>
        <View style={styles.header}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <Text style={[styles.title, { color: theme.textPrimary }]}>Control Room</Text>
              <Text style={[styles.subtitle, { color: theme.textMuted }]}>AetherBuilt OS • Factory Live</Text>
            </View>
            <Pressable onPress={toggleDarkMode}>
              {isDarkMode ? <Sun size={20} color={theme.accentAmber} /> : <Moon size={20} color={theme.textMuted} />}
            </Pressable>
          </View>
        </View>

        {/* 1. URGENT: CRITICAL INSIGHTS */}
        {criticalInsights.map(insight => (
          <InsightCard 
            key={insight.id} 
            insight={insight} 
            onAction={executeCommand} 
          />
        ))}

        <CommandBar />

        {/* 2. IMPORTANT: ACTION CARDS */}
        <Text style={[styles.sectionTitle, { color: theme.textHint }]}>PRIORITY ACTIONS</Text>
        <ActionCard 
          title="Dispatch ORD-772" 
          subtitle="Tata Motors • 500 units ready"
          icon={<Truck size={18} color={theme.accentBlue} />}
          onPress={() => executeCommand("mark ord-772 completed")}
        />
        <ActionCard 
          title="Resume M-02" 
          subtitle="Machine repair completed?"
          icon={<Play size={18} color={theme.accentGreen} />}
          color={theme.accentGreen}
          onPress={() => executeCommand("mark machine m-02 running")}
        />

        {/* 3. EVERYTHING ELSE: COMPACT STATS */}
        <Text style={[styles.sectionTitle, { color: theme.textHint }]}>OPERATIONAL HEALTH</Text>
        <View style={styles.gridRow}>
          <View style={{ flex: 1, paddingRight: 6 }}>
            <StatCard 
              title="ACTIVE ORDERS" 
              value={activeOrdersCount.toString()} 
              subtitle="Total load" 
              color={theme.accentBlue} 
              icon={<Package size={14} color={theme.accentBlue} />} 
            />
          </View>
          <View style={{ flex: 1, paddingLeft: 6 }}>
            <StatCard 
              title="DOWNTIME" 
              value={machines.filter(m => m.status === 'Down').length.toString()} 
              subtitle="Machines" 
              color={theme.accentRed} 
              icon={<Settings size={14} color={theme.accentRed} />} 
            />
          </View>
        </View>

        {/* 4. OTHER INSIGHTS (Scrollable or list) */}
        {otherInsights.map(insight => (
          <InsightCard 
            key={insight.id} 
            insight={insight} 
            onAction={executeCommand} 
          />
        ))}

      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 100, maxWidth: 600, alignSelf: 'center', width: '100%' },
  header: { marginBottom: 20 },
  title: { fontSize: 28, fontWeight: '900', letterSpacing: -0.5 },
  subtitle: { fontSize: 13, fontWeight: '600', marginTop: 2 },
  sectionTitle: { 
    fontSize: 11, 
    fontWeight: '900', 
    letterSpacing: 1.5, 
    marginTop: 24, 
    marginBottom: 12 
  },
  gridRow: { flexDirection: 'row', marginBottom: 12 },
});
