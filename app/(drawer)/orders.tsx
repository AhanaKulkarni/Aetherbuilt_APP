import React, { useState, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, RefreshControl, KeyboardAvoidingView, Platform, TextInput } from 'react-native';
import { Colors, Typography, Layout } from '../../theme/tokens';
import { useFactory } from '../../hooks/useFactory';
import { Order } from '../../lib/db';
import * as Haptics from 'expo-haptics';
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import { useToast } from '../../hooks/useToast';
import { Package, Trash2, Edit2, Plus } from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useI18n } from '../../lib/i18n';

export default function OrdersScreen() {
  const { orders, updateOrder, setOrders, loadData } = useFactory();
  const { showToast } = useToast();
  const { t } = useI18n();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Form State
  const [draftClient, setDraftClient] = useState('');
  const [draftProduct, setDraftProduct] = useState('');
  const [draftQty, setDraftQty] = useState('1');
  const [draftDeadline, setDraftDeadline] = useState('');
  const [draftNotes, setDraftNotes] = useState('');

  const bottomSheetRef = useRef<BottomSheetModal>(null);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const openUpdate = (order: Order) => {
    setIsCreating(false);
    setSelectedOrder(order);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    bottomSheetRef.current?.present();
  };

  const openCreate = () => {
    setIsCreating(true);
    setSelectedOrder(null);
    setDraftClient('');
    setDraftProduct('');
    setDraftQty('1');
    setDraftDeadline(new Date().toISOString().split('T')[0]);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    bottomSheetRef.current?.present();
  };

  const saveNewOrder = () => {
    if (!draftClient || !draftProduct) {
      showToast('Client and Product are required', 'error');
      return;
    }
    const newOrder: Order = {
      id: `${100 + Math.floor(Math.random() * 900)}`,
      client: draftClient,
      product: draftProduct,
      quantity: parseInt(draftQty, 10) || 1,
      deadline: draftDeadline,
      status: 'NOT STARTED',
      progress: 0,
      delayed: false,
    };
    setOrders([newOrder, ...orders]);
    bottomSheetRef.current?.dismiss();
    showToast(`Order created for ${draftClient}`, 'success');
  };

  const deleteOrder = (id: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    setOrders(orders.filter(o => o.id !== id));
    showToast(`Order #${id} deleted`, 'success');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Orders & Production</Text>
          <Text style={styles.subtitle}>Manage all factory orders and track production progress.</Text>
        </View>
        <Pressable style={styles.addBtn} onPress={openCreate}>
          <Plus size={16} color="#ffffff" style={{ marginRight: 8 }} />
          <Text style={styles.addBtnText}>New Order</Text>
        </Pressable>
      </View>

      <FlatList
        data={orders}
        keyExtractor={i => i.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.listContent}
        numColumns={2}
        columnWrapperStyle={{ gap: 16 }}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Package size={48} color={Colors.textHint} />
            <Text style={styles.emptyTitle}>No orders found</Text>
          </View>
        )}
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInUp.delay(index * 100).duration(400)} style={styles.card}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.cardTitle}>#{item.id} {item.client}</Text>
                <Text style={styles.cardSubtitle}>{item.product}</Text>
              </View>
              <View style={[styles.badge, item.status === 'COMPLETED' ? styles.badgeSuccess : styles.badgeNeutral]}>
                <Text style={[styles.badgeText, item.status === 'COMPLETED' ? styles.badgeTextSuccess : styles.badgeTextNeutral]}>
                  {item.status}
                </Text>
              </View>
            </View>

            <View style={styles.statsRow}>
              <View>
                <Text style={styles.statLabel}>QUANTITY</Text>
                <Text style={styles.statValue}>{item.quantity}</Text>
              </View>
              <View>
                <Text style={styles.statLabel}>DEADLINE</Text>
                <Text style={styles.statValue}>{item.deadline}</Text>
              </View>
            </View>

            <View style={styles.progressSection}>
              <View style={styles.progressHeader}>
                <Text style={styles.statLabel}>PROGRESS</Text>
                <Text style={styles.statLabel}>{item.progress}%</Text>
              </View>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${item.progress}%`, backgroundColor: item.progress === 100 ? Colors.accentGreen : Colors.textPrimary }]} />
              </View>
            </View>

            <View style={styles.cardFooter}>
              <Pressable style={styles.updateBtn} onPress={() => openUpdate(item)}>
                <Edit2 size={14} color={Colors.textPrimary} style={{ marginRight: 6 }} />
                <Text style={styles.updateBtnText}>Update</Text>
              </Pressable>
              <Pressable style={styles.deleteBtn} onPress={() => deleteOrder(item.id)}>
                <Trash2 size={16} color={Colors.accentRed} />
              </Pressable>
            </View>
          </Animated.View>
        )}
      />

      <BottomSheetModal
        ref={bottomSheetRef}
        snapPoints={['75%']}
        enablePanDownToClose
        backdropComponent={(props) => <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.4} />}
        backgroundStyle={styles.sheetBackground}
      >
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <BottomSheetView style={styles.sheetContent}>
            {isCreating ? (
              <>
                <Text style={styles.sheetTitle}>Create New Order</Text>
                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>Client Name</Text>
                  <TextInput style={styles.input} value={draftClient} onChangeText={setDraftClient} />
                </View>
                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>Product / Item</Text>
                  <TextInput style={styles.input} value={draftProduct} onChangeText={setDraftProduct} />
                </View>
                <View style={styles.fieldRow}>
                  <View style={[styles.fieldGroup, { flex: 1, marginRight: 8 }]}>
                    <Text style={styles.label}>Quantity</Text>
                    <TextInput style={styles.input} keyboardType="number-pad" value={draftQty} onChangeText={setDraftQty} />
                  </View>
                  <View style={[styles.fieldGroup, { flex: 1, marginLeft: 8 }]}>
                    <Text style={styles.label}>Deadline</Text>
                    <TextInput style={styles.input} value={draftDeadline} onChangeText={setDraftDeadline} />
                  </View>
                </View>
                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>Notes (Optional)</Text>
                  <TextInput style={[styles.input, { height: 80 }]} multiline value={draftNotes} onChangeText={setDraftNotes} />
                </View>
                <Pressable style={styles.saveBtn} onPress={saveNewOrder}>
                  <Text style={styles.saveBtnText}>Save Order</Text>
                </Pressable>
              </>
            ) : selectedOrder && (
              <>
                <Text style={styles.sheetTitle}>Update Status: #{selectedOrder.id}</Text>
                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>Progress: {selectedOrder.progress}%</Text>
                  <View style={styles.quickActions}>
                    {[0, 25, 50, 75, 100].map(pt => (
                      <Pressable key={pt} style={[styles.quickBtn, selectedOrder.progress === pt && styles.quickBtnActive]} 
                        onPress={() => updateOrder(selectedOrder.id, { progress: pt, status: pt === 100 ? 'COMPLETED' : pt === 0 ? 'NOT STARTED' : 'IN PROGRESS' })}>
                        <Text style={[styles.quickBtnText, selectedOrder.progress === pt && styles.quickBtnTextActive]}>{pt}%</Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>Notes</Text>
                  <TextInput style={[styles.input, { height: 80 }]} multiline placeholder="Add updates..." />
                </View>
                <Pressable style={styles.saveBtn} onPress={() => bottomSheetRef.current?.dismiss()}>
                  <Text style={styles.saveBtnText}>Save Update</Text>
                </Pressable>
              </>
            )}
          </BottomSheetView>
        </KeyboardAvoidingView>
      </BottomSheetModal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { padding: Layout.spacing.xxl, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 16 },
  title: { ...Typography.heading, fontSize: 32 },
  subtitle: { ...Typography.body, color: Colors.textMuted },
  addBtn: { backgroundColor: Colors.textPrimary, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderRadius: Layout.radius.s },
  addBtnText: { color: '#ffffff', fontWeight: '700', fontSize: 14 },
  listContent: { paddingHorizontal: Layout.spacing.xxl, paddingBottom: 80 },
  card: { flex: 1, backgroundColor: Colors.surface, borderRadius: Layout.radius.m, borderWidth: 1, borderColor: Colors.border, padding: Layout.spacing.l, ...Layout.shadow },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  cardTitle: { fontSize: 16, fontWeight: '800', color: Colors.textPrimary },
  cardSubtitle: { fontSize: 14, color: Colors.textMuted, marginTop: 4 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  badgeNeutral: { backgroundColor: '#f1f5f9' },
  badgeSuccess: { backgroundColor: '#dcfce7' },
  badgeText: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
  badgeTextNeutral: { color: Colors.textMuted },
  badgeTextSuccess: { color: Colors.accentGreen },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  statLabel: { ...Typography.label },
  statValue: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary, marginTop: 4 },
  progressSection: { marginBottom: 20 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  progressBar: { height: 6, backgroundColor: '#f1f5f9', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  cardFooter: { flexDirection: 'row', gap: 12, borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: 16 },
  updateBtn: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 8, borderWidth: 1, borderColor: Colors.border, borderRadius: Layout.radius.s },
  updateBtnText: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  deleteBtn: { paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: '#fee2e2', borderRadius: Layout.radius.s, backgroundColor: '#fef2f2', alignItems: 'center', justifyContent: 'center' },
  emptyContainer: { alignItems: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: Colors.textPrimary, marginTop: 16 },
  sheetBackground: { borderRadius: 24, padding: 16 },
  sheetContent: { padding: 24, flex: 1 },
  sheetTitle: { fontSize: 20, fontWeight: '800', color: Colors.textPrimary, marginBottom: 24 },
  fieldGroup: { marginBottom: 20 },
  fieldRow: { flexDirection: 'row' },
  label: { ...Typography.label, color: Colors.textPrimary, marginBottom: 8 },
  input: { borderWidth: 1, borderColor: Colors.border, borderRadius: 8, padding: 12, fontSize: 15, color: Colors.textPrimary },
  quickActions: { flexDirection: 'row', gap: 8 },
  quickBtn: { flex: 1, paddingVertical: 12, borderRadius: 8, backgroundColor: '#f1f5f9', alignItems: 'center' },
  quickBtnActive: { backgroundColor: Colors.textPrimary },
  quickBtnText: { fontSize: 13, fontWeight: '700', color: Colors.textMuted },
  quickBtnTextActive: { color: '#ffffff' },
  saveBtn: { backgroundColor: Colors.textPrimary, paddingVertical: 16, borderRadius: Layout.radius.s, alignItems: 'center', marginTop: 12 },
  saveBtnText: { color: '#ffffff', fontWeight: '800', fontSize: 15 },
});
