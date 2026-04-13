import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, useWindowDimensions, RefreshControl, Pressable } from 'react-native';
import { Package, CheckCircle, AlertTriangle, Settings, WifiOff, FileText, Truck, Users, User, Share } from 'lucide-react-native';
import { Colors, Typography, Layout } from '../../theme/tokens';
import CommandBar from '../../components/CommandBar';
import StatCard from '../../components/StatCard';
import ProductionLoadCard from '../../components/ProductionLoadCard';
import ProcessHaltedCard from '../../components/ProcessHaltedCard';
import { useFactory } from '../../hooks/useFactory';
import Animated, { FadeInDown, FadeIn, Layout as ReanimatedLayout } from 'react-native-reanimated';
import { useI18n } from '../../lib/i18n';
import * as Haptics from 'expo-haptics';

export default function DashboardScreen() {
  const { orders, machines, vendors, shipments, pos, rfqs, loadData } = useFactory();
  const { width } = useWindowDimensions();
  const { t } = useI18n();
  const isLarge = width >= 1024;
  const isTablet = width >= 768 && width < 1024;

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const activeOrdersCount = orders.filter(o => o.status === 'IN PROGRESS' || o.status === 'NOT STARTED').length;
  const completedOrdersCount = orders.filter(o => o.status === 'COMPLETED').length;
  const delayedShipmentsCount = shipments.filter(s => s.status === 'Delayed').length;
  const machinesDownCount = machines.filter(m => m.status === 'Down').length;
  
  const today = new Date();
  const machineAlertsCount = machines.filter(m => {
    const nextSvc = new Date(m.nextService);
    const diffDays = (nextSvc.getTime() - today.getTime()) / (1000 * 3600 * 24);
    return diffDays >= 0 && diffDays <= 14;
  }).length;

  const getProgressColor = (progress: number) => {
    if (progress > 70) return Colors.accentGreen;
    if (progress >= 40) return Colors.accentAmber;
    return Colors.accentRed;
  };

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Animated.View entering={FadeInDown.duration(400)}>
        <View style={styles.topProfileRow}>
          <View style={styles.architectBadge}>
            <Text style={styles.architectIcon}>A</Text>
            <Text style={styles.architectText}>{t('architect')}</Text>
          </View>
          <View style={styles.userAvatar}>
            <User size={20} color="#fff" />
          </View>
        </View>

        <View style={styles.header}>
          <Text style={styles.systemLiveText}>{t('systemLive')}</Text>
          <Text style={styles.title}>{t('controlRoom')}</Text>
          <Text style={styles.subtitle}>
            Precision monitoring of global industrial operations. Real-time telemetry and order fulfillment tracking across all regional sectors.
          </Text>
        </View>

        <View style={styles.actionsRow}>
          <Pressable style={styles.secondaryBtn} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}>
            <Text style={styles.secondaryBtnText}>{t('exportLogs')}</Text>
          </Pressable>
          <Pressable style={styles.primaryBtn} onPress={onRefresh}>
            <Text style={styles.primaryBtnText}>{t('systemRefresh')}</Text>
          </Pressable>
        </View>

        <CommandBar />

        {delayedShipmentsCount > 0 && (
          <Animated.View entering={FadeIn.delay(300)}>
             <ProcessHaltedCard haltPercent={45} />
          </Animated.View>
        )}
        
        <View style={[styles.gridRow, (isLarge || isTablet) ? { flexDirection: 'row' } : { flexDirection: 'column' }]}>
          <View style={[(isLarge || isTablet) && { flex: 1, paddingRight: 8 }]}>
            <StatCard 
              title={t('activeOrders')} 
              value={activeOrdersCount.toLocaleString()} 
              subtitle="REAL-TIME" 
              color={Colors.accentTeal} 
              icon={<Settings size={22} color={Colors.accentTeal} />} 
            />
          </View>
          <View style={[(isLarge || isTablet) && { flex: 1, paddingHorizontal: 8 }]}>
            <StatCard 
              title={t('completedToday')} 
              value={completedOrdersCount.toLocaleString()} 
              subtitle="TODAY" 
              color={Colors.accentGreen} 
              icon={<CheckCircle size={22} color={Colors.accentGreen} />} 
            />
          </View>
        </View>

        <ProductionLoadCard loadPercent={94.2} />

      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Layout.spacing.xxl, paddingBottom: 80, maxWidth: 1200, alignSelf: 'center', width: '100%' },
  topProfileRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
  },
  architectBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  architectIcon: { fontSize: 18, fontWeight: '400', fontFamily: 'monospace' },
  architectText: { fontSize: 15, fontWeight: '800', letterSpacing: 0.5 },
  userAvatar: {
    width: 36, height: 36,
    borderRadius: 18,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: { marginBottom: 32 },
  systemLiveText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.accentTeal,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  title: { ...Typography.heading, marginBottom: 16 },
  subtitle: { ...Typography.body, color: Colors.textMuted, lineHeight: 24, maxWidth: '90%' },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 32,
  },
  primaryBtn: {
    backgroundColor: Colors.accentGreen,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: Layout.radius.s,
    ...Layout.shadow,
    shadowColor: Colors.accentGreen,
    shadowOpacity: 0.2,
  },
  primaryBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  secondaryBtn: {
    backgroundColor: '#e2e8f0',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: Layout.radius.s,
  },
  secondaryBtnText: { color: Colors.textPrimary, fontWeight: '700', fontSize: 14 },
  gridRow: { marginBottom: 8, gap: 16 },
});
