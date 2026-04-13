import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Colors } from '../../theme/tokens';
import { useFactory } from '../../hooks/useFactory';
import { TrendingUp, Minus, Users } from 'lucide-react-native';

export default function VendorsScreen() {
  const { vendors, pos, loadData } = useFactory();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const getProgressColor = (score: number) => {
    if (score >= 90) return Colors.accentGreen;
    if (score >= 70) return Colors.accentAmber;
    return Colors.accentRed;
  };

  const getOnTimeRate = (vendorName: string, baselineReliability: number) => {
    const vendorPOs = pos.filter(p => p.vendorName === vendorName);
    if (vendorPOs.length === 0) return baselineReliability; // fallback
    const delivered = vendorPOs.filter(p => p.status === 'Delivered').length;
    return Math.round((delivered / vendorPOs.length) * 100);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Vendors</Text>
      </View>

      <FlatList
        data={vendors}
        keyExtractor={i => i.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Users size={48} color={Colors.textHint} />
            <Text style={styles.emptyTitle}>No vendors yet</Text>
            <Text style={styles.emptySubtitle}>Add your first vendor.</Text>
          </View>
        )}
        renderItem={({ item }) => {
          const onTimeRate = getOnTimeRate(item.name, item.reliability);
          
          return (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.cardTitle}>{item.name}</Text>
                  <Text style={styles.cardSubtitle}>{item.material} • {item.city}</Text>
                </View>
                <View style={[styles.trendBadge, item.priceTrend === 'rising' ? styles.trendRising : styles.trendStable]}>
                  {item.priceTrend === 'rising' ? (
                    <TrendingUp size={12} color={Colors.accentRed} style={{ marginRight: 4 }} />
                  ) : (
                    <Minus size={12} color={Colors.accentGreen} style={{ marginRight: 4 }} />
                  )}
                  <Text style={[styles.trendText, item.priceTrend === 'rising' ? { color: Colors.accentRed } : { color: Colors.accentGreen }]}>
                    {item.priceTrend === 'rising' ? 'Rising' : 'Stable'}
                  </Text>
                </View>
              </View>

              <View style={styles.scoreSection}>
                <View style={styles.scoreRow}>
                  <Text style={styles.scoreLabel}>Reliability Score</Text>
                  <Text style={[styles.scoreValue, { color: getProgressColor(item.reliability) }]}>{item.reliability}%</Text>
                </View>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${item.reliability}%`, backgroundColor: getProgressColor(item.reliability) }]} />
                </View>
              </View>

              <View style={styles.cardFooter}>
                <Text style={styles.footerText}>Avg Delivery: {item.avgDeliveryDays} days</Text>
                <Text style={styles.footerText}>On-Time: {onTimeRate}%</Text>
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { padding: 24, paddingBottom: 16 },
  title: { fontSize: 28, fontWeight: '700', color: Colors.textPrimary },
  listContent: { paddingHorizontal: 24, paddingBottom: 60 },
  card: { backgroundColor: '#fff', padding: 20, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, marginBottom: 16 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  cardTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  cardSubtitle: { fontSize: 14, color: Colors.textMuted, marginTop: 4 },
  trendBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1 },
  trendRising: { backgroundColor: '#fef2f2', borderColor: '#fecaca' },
  trendStable: { backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' },
  trendText: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },
  scoreSection: { marginBottom: 16 },
  scoreRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  scoreLabel: { fontSize: 13, fontWeight: '600', color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  scoreValue: { fontSize: 14, fontWeight: '700' },
  progressBar: { height: 8, backgroundColor: '#f3f4f6', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 16, borderTopWidth: 1, borderTopColor: Colors.border },
  footerText: { fontSize: 13, color: Colors.textMuted, fontWeight: '500' },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: Colors.textPrimary, marginTop: 16 },
  emptySubtitle: { fontSize: 14, color: Colors.textMuted, marginTop: 8 },
});
