import React, { useState, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, RefreshControl, KeyboardAvoidingView, Platform, TextInput } from 'react-native';
import { Colors } from '../../theme/tokens';
import { useFactory } from '../../hooks/useFactory';
import { Shipment } from '../../lib/db';
import * as Haptics from 'expo-haptics';
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetView, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { Truck } from 'lucide-react-native';
import { useToast } from '../../hooks/useToast';

const TABS = ['ALL', 'PENDING', 'DISPATCHED', 'DELIVERED', 'DELAYED'];

export default function ShipmentsScreen() {
  const { shipments, updateShipment, loadData } = useFactory();
  const { showToast } = useToast();
  const [filter, setFilter] = useState('ALL');
  const [refreshing, setRefreshing] = useState(false);
  const [selected, setSelected] = useState<Shipment | null>(null);

  const bottomSheetRef = useRef<BottomSheetModal>(null);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const filteredData = useMemo(() => {
    if (filter === 'ALL') return shipments;
    return shipments.filter(s => s.status.toUpperCase() === filter);
  }, [shipments, filter]);

  const openDetails = (s: Shipment) => {
    setSelected(s);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    bottomSheetRef.current?.present();
  };

  const getStatusColor = (status: string) => {
    if (status === 'Delivered') return Colors.accentGreen;
    if (status === 'Delayed') return Colors.accentRed;
    if (status === 'Dispatched') return Colors.accentBlue;
    return Colors.accentAmber;
  };

  const handleUpdate = (field: keyof Shipment, value: string) => {
    if (!selected) return;
    const upd = { ...selected, [field]: value };
    setSelected(upd as Shipment);
  };

  const saveUpdates = () => {
    if (!selected) return;
    updateShipment(selected.id, selected);
    showToast(`Shipment #${selected.id} updated!`, 'success');
    bottomSheetRef.current?.dismiss();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Shipments</Text>
      </View>

      <View style={styles.tabs}>
        <FlatList 
          horizontal 
          showsHorizontalScrollIndicator={false}
          data={TABS} 
          keyExtractor={i => i}
          renderItem={({ item: t }) => (
            <Pressable onPress={() => setFilter(t)} style={[styles.tab, filter === t && styles.tabActive]}>
              <Text style={[styles.tabText, filter === t && styles.tabTextActive]}>{t}</Text>
            </Pressable>
          )} 
        />
      </View>

      <FlatList
        data={filteredData}
        keyExtractor={i => i.id.toString()}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Truck size={48} color={Colors.textHint} />
            <Text style={styles.emptyTitle}>No shipments found</Text>
          </View>
        )}
        renderItem={({ item }) => (
          <Pressable style={[styles.card, item.status === 'Delayed' && styles.cardDelayed]} onPress={() => openDetails(item)}>
            <View style={styles.cardHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{item.client}</Text>
                <Text style={styles.cardSubtitle}>{item.product} ({item.qty} units)</Text>
              </View>
              <View style={[styles.badge, { backgroundColor: getStatusColor(item.status) }]}>
                <Text style={styles.badgeText}>{item.status}</Text>
              </View>
            </View>
            
            <View style={styles.cardRow}>
              <Text style={styles.subTitle}>Carrier: <Text style={styles.subValue}>{item.carrier}</Text></Text>
              <Text style={styles.subTitle}>Exp: <Text style={styles.subValue}>{item.expectedDelivery}</Text></Text>
            </View>

            {item.status === 'Delayed' && item.delayReason && (
              <View style={styles.delayBox}>
                <Text style={styles.delayText}>Reason: {item.delayReason}</Text>
              </View>
            )}
          </Pressable>
        )}
      />

      <BottomSheetModal
        ref={bottomSheetRef}
        snapPoints={['70%']}
        enablePanDownToClose
        backdropComponent={(props) => <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.6} />}
        backgroundStyle={{ backgroundColor: Colors.surface }}
        keyboardBehavior="fillParent"
      >
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <BottomSheetScrollView contentContainerStyle={styles.sheetContent}>
            {selected && (
              <>
                <Text style={styles.sheetTitle}>Shipment #{selected.id}</Text>
                <Text style={styles.sheetSubtitle}>{selected.client} • {selected.product}</Text>
                
                <View style={styles.fieldRow}>
                  <Text style={styles.label}>Status</Text>
                  <View style={styles.actionsRow}>
                    {['Pending', 'Dispatched', 'Delayed', 'Delivered'].map(s => (
                      <Pressable key={s} 
                        style={[styles.actionBtn, selected.status === s && { backgroundColor: getStatusColor(s) }]} 
                        onPress={() => handleUpdate('status', s)}>
                        <Text style={[styles.actionText, selected.status === s && styles.actionTextActive]}>{s}</Text>
                      </Pressable>
                    ))}
                  </View>
                </View>

                {selected.status === 'Delayed' && (
                  <View style={styles.fieldRow}>
                    <Text style={styles.label}>Delay Reason</Text>
                    <TextInput 
                      style={styles.input} 
                      value={selected.delayReason || ''}
                      onChangeText={(val) => handleUpdate('delayReason', val)}
                      placeholder="e.g. Carrier issue, Customs check"
                    />
                  </View>
                )}

                <View style={styles.fieldRow}>
                  <Text style={styles.label}>Tracking Note / AWB</Text>
                  <TextInput 
                    style={styles.input} 
                    value={selected.trackingNote || ''}
                    onChangeText={(val) => handleUpdate('trackingNote', val)}
                  />
                </View>

                <Pressable style={styles.saveBtn} onPress={saveUpdates}>
                  <Text style={styles.saveBtnText}>Save Updates</Text>
                </Pressable>
              </>
            )}
          </BottomSheetScrollView>
        </KeyboardAvoidingView>
      </BottomSheetModal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { padding: 24, paddingBottom: 16 },
  title: { fontSize: 28, fontWeight: '700', color: Colors.textPrimary },
  tabs: { paddingHorizontal: 24, marginBottom: 16 },
  tab: { marginRight: 24, paddingBottom: 8 },
  tabActive: { borderBottomWidth: 2, borderBottomColor: Colors.accentBlue },
  tabText: { fontSize: 13, fontWeight: '600', color: Colors.textMuted, letterSpacing: 0.5 },
  tabTextActive: { color: Colors.accentBlue },
  listContent: { paddingHorizontal: 24, paddingBottom: 60 },
  card: { backgroundColor: '#fff', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, marginBottom: 16 },
  cardDelayed: { borderLeftWidth: 4, borderLeftColor: Colors.accentRed },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  cardSubtitle: { fontSize: 14, color: Colors.textMuted },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  badgeText: { fontSize: 10, fontWeight: '700', color: '#fff', textTransform: 'uppercase' },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 12, borderTopWidth: 1, borderTopColor: Colors.border },
  subTitle: { fontSize: 13, color: Colors.textMuted },
  subValue: { fontWeight: '600', color: Colors.textPrimary },
  delayBox: { marginTop: 12, backgroundColor: '#fef2f2', padding: 8, borderRadius: 6 },
  delayText: { color: '#991b1b', fontSize: 13, fontWeight: '500' },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: Colors.textMuted, marginTop: 16 },
  sheetContent: { padding: 24, paddingBottom: 60 },
  sheetTitle: { fontSize: 20, fontWeight: '700', color: Colors.textPrimary },
  sheetSubtitle: { fontSize: 14, color: Colors.textMuted, marginBottom: 24 },
  fieldRow: { marginBottom: 24 },
  label: { fontSize: 13, fontWeight: '600', color: Colors.textMuted, marginBottom: 8, letterSpacing: 0.5 },
  input: { borderWidth: 1, borderColor: Colors.border, borderRadius: 8, padding: 12, fontSize: 16, color: Colors.textPrimary },
  actionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  actionBtn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, backgroundColor: '#f3f4f6' },
  actionText: { fontSize: 12, fontWeight: '600', color: Colors.textMuted },
  actionTextActive: { color: '#ffffff' },
  saveBtn: { backgroundColor: Colors.textPrimary, padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 16 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
