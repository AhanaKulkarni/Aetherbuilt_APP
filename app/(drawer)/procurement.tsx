import React, { useState } from 'react';
import { View, Text, StyleSheet, SectionList, Pressable, RefreshControl } from 'react-native';
import { Colors } from '../../theme/tokens';
import { useFactory } from '../../hooks/useFactory';
import { FileText } from 'lucide-react-native';
import { useToast } from '../../hooks/useToast';
import * as Haptics from 'expo-haptics';

export default function ProcurementScreen() {
  const { pos, rfqs, updatePO, setPOs, setRFQs, loadData } = useFactory();
  const { showToast } = useToast();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleSelectRFQ = (rfqId: string, material: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Move RFQ to Closed
    const updatedRFQs = rfqs.map(r => r.id === rfqId ? { ...r, status: 'Closed' as const } : r);
    setRFQs(updatedRFQs);

    // Create a new PO
    const newPO = {
      id: `PO-${1000 + Math.floor(Math.random() * 900)}`,
      vendorName: 'Selected Vendor', // Simplified 
      material,
      qty: 1000,
      unitPrice: 50,
      status: 'Pending' as const,
      orderDate: new Date().toISOString().split('T')[0]
    };
    setPOs([newPO, ...pos]);
    showToast(`PO Created for ${material}`, 'success');
  };

  const sections: { title: string; data: any[]; type: string }[] = [
    { title: 'Open RFQs', data: rfqs.filter(r => r.status === 'Open'), type: 'rfq' },
    { title: 'Purchase Orders', data: pos, type: 'po' }
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Procurement</Text>
      </View>

      <SectionList
        sections={sections}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        stickySectionHeadersEnabled={true}
        renderSectionHeader={({ section: { title, data } }) => (
          data.length > 0 ? (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{title}</Text>
            </View>
          ) : null
        )}
        renderItem={({ item, section }) => {
          if (section.type === 'rfq') {
            const rfq = item as any;
            return (
              <View style={styles.card}>
                <View style={styles.cardRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>{rfq.id}</Text>
                    <Text style={styles.cardSubtitle}>{rfq.material} • Qty: {rfq.quantity}</Text>
                  </View>
                  <Pressable style={styles.selectBtn} onPress={() => handleSelectRFQ(rfq.id, rfq.material)}>
                    <Text style={styles.selectBtnText}>Select Vendor</Text>
                  </Pressable>
                </View>
                <Text style={styles.subText}>Due: {rfq.dueDate}</Text>
              </View>
            );
          }

          const po = item as any;
          const total = po.qty * po.unitPrice;
          return (
            <View style={[styles.card, po.status === 'Delivered' && { opacity: 0.7 }]}>
              <View style={styles.cardRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>{po.id} - {po.vendorName}</Text>
                  <Text style={styles.cardSubtitle}>{po.material} ({po.qty} units @ ₹{po.unitPrice})</Text>
                </View>
                <View style={styles.badgeContainer}>
                  <View style={[styles.badge, po.status === 'Delivered' ? { backgroundColor: Colors.accentGreen } : { backgroundColor: Colors.accentAmber }]}>
                    <Text style={styles.badgeText}>{po.status}</Text>
                  </View>
                </View>
              </View>
              <View style={[styles.cardRow, { marginTop: 16 }]}>
                <Text style={styles.subText}>Date: {po.orderDate}</Text>
                <Text style={styles.totalText}>Total: ₹{total.toLocaleString()}</Text>
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
  sectionHeader: { backgroundColor: Colors.background, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.border, marginBottom: 16 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 1 },
  card: { backgroundColor: '#fff', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, marginBottom: 16 },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  cardSubtitle: { fontSize: 14, color: Colors.textMuted, marginTop: 4 },
  subText: { fontSize: 13, color: Colors.textHint, marginTop: 8 },
  totalText: { fontSize: 16, fontWeight: '800', color: Colors.textPrimary },
  selectBtn: { backgroundColor: Colors.accentBlue, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  selectBtnText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  badgeContainer: { alignItems: 'flex-end' },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
});
