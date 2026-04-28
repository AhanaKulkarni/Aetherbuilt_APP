import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, RefreshControl, KeyboardAvoidingView, Platform, TextInput, ScrollView } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { Typography, Layout, LightTheme, DarkTheme } from '../../theme/tokens';
import { useFactory } from '../../hooks/useFactory';
import { useTheme } from '../../hooks/useTheme';
import { Order } from '../../lib/db';
import * as Haptics from 'expo-haptics';
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetView, BottomSheetTextInput, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useToast } from '../../hooks/useToast';
import { Package, Trash2, Edit2, Plus, Sun, Moon } from 'lucide-react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

export default function OrdersScreen() {
  const { orders, updateOrder, addOrder, setOrders, loadData, isDarkMode, toggleDarkMode } = useFactory();
  const { theme } = useTheme();
  const { showToast } = useToast();
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
    
    addOrder({
      client: draftClient,
      product: draftProduct,
      quantity: parseInt(draftQty, 10) || 1,
      deadline: draftDeadline,
      expectedDays: 30,
      status: 'NOT STARTED',
      progress: 0,
      delayed: false,
    });

    bottomSheetRef.current?.dismiss();
    showToast(`Order created for ${draftClient}`, 'success');
  };

  const deleteOrder = (id: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    setOrders(orders.filter(o => o.id !== id));
    showToast(`Order deleted`, 'success');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={[styles.title, { color: theme.textPrimary }]}>Orders</Text>
            <Text style={[styles.subtitle, { color: theme.textMuted }]}>Production pipeline</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Pressable onPress={toggleDarkMode} style={{ justifyContent: 'center' }}>
               {isDarkMode ? <Sun size={20} color={theme.accentAmber} /> : <Moon size={20} color={theme.textMuted} />}
            </Pressable>
            <Pressable style={[styles.addBtn, { backgroundColor: theme.textPrimary }]} onPress={openCreate}>
              <Plus size={18} color={isDarkMode ? '#000' : '#fff'} />
            </Pressable>
          </View>
        </View>
      </View>

      <FlatList
        data={orders}
        keyExtractor={i => i.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Package size={40} color={theme.textHint} />
            <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>No Orders Yet</Text>
            <Text style={[styles.emptySub, { color: theme.textMuted }]}>Create your first order to get started</Text>
          </View>
        )}
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeIn.delay(index * 50)} style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.cardTop}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.cardLabel, { color: theme.textHint }]}>CLIENT</Text>
                <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>{item.client}</Text>
              </View>
              <View style={[styles.badge, item.status === 'COMPLETED' ? { backgroundColor: theme.accentGreen + '15' } : { backgroundColor: theme.accentAmber + '15' }]}>
                <Text style={[styles.badgeText, item.status === 'COMPLETED' ? { color: theme.accentGreen } : { color: theme.accentAmber }]}>
                  {item.status}
                </Text>
              </View>
            </View>

            <View style={styles.cardBody}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.cardLabel, { color: theme.textHint }]}>PRODUCT</Text>
                <Text style={[styles.cardSubText, { color: theme.textMuted }]}>{item.product}</Text>
              </View>
              <View style={{ width: 80 }}>
                <Text style={[styles.cardLabel, { color: theme.textHint }]}>QTY</Text>
                <Text style={[styles.cardSubText, { color: theme.textMuted }]}>{item.quantity}</Text>
              </View>
            </View>

            <View style={[styles.progressContainer, { borderTopColor: theme.border }]}>
              <View style={[styles.progressBarBg, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#F1F5F9' }]}>
                <View style={[styles.progressBarFill, { width: `${item.progress}%`, backgroundColor: item.progress === 100 ? theme.accentGreen : theme.accentBlue }]} />
              </View>
              <Text style={[styles.progressText, { color: theme.textPrimary }]}>{item.progress}%</Text>
            </View>

            <View style={[styles.cardActions, { borderTopColor: theme.border }]}>
              <Pressable style={[styles.actionBtn, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.03)' : '#F8FAFC' }]} onPress={() => openUpdate(item)}>
                <Edit2 size={14} color={theme.textMuted} />
                <Text style={[styles.actionBtnText, { color: theme.textPrimary }]}>Update</Text>
              </Pressable>
              <Pressable style={[styles.deleteBtn, { backgroundColor: theme.accentRed + '15' }]} onPress={() => deleteOrder(item.id)}>
                <Trash2 size={14} color={theme.accentRed} />
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
        backgroundStyle={{ backgroundColor: theme.surface, borderRadius: 32 }}
        handleIndicatorStyle={{ backgroundColor: theme.border }}
      >
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <BottomSheetScrollView contentContainerStyle={styles.sheetContent}>
            {isCreating ? (
              <View>
                <Text style={[styles.sheetTitle, { color: theme.textPrimary }]}>New Order</Text>
                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: theme.textHint }]}>CLIENT NAME</Text>
                  <BottomSheetTextInput style={[styles.input, { backgroundColor: theme.background, borderColor: theme.border, color: theme.textPrimary }]} value={draftClient} onChangeText={setDraftClient} placeholder="e.g. Tata Motors" placeholderTextColor={theme.textHint} />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: theme.textHint }]}>PRODUCT NAME</Text>
                  <BottomSheetTextInput style={[styles.input, { backgroundColor: theme.background, borderColor: theme.border, color: theme.textPrimary }]} value={draftProduct} onChangeText={setDraftProduct} placeholder="e.g. Gear Parts" placeholderTextColor={theme.textHint} />
                </View>
                <View style={styles.row}>
                  <View style={[styles.inputGroup, { flex: 1, marginRight: 12 }]}>
                    <Text style={[styles.label, { color: theme.textHint }]}>QUANTITY</Text>
                    <BottomSheetTextInput style={[styles.input, { backgroundColor: theme.background, borderColor: theme.border, color: theme.textPrimary }]} keyboardType="number-pad" value={draftQty} onChangeText={setDraftQty} />
                  </View>
                  <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={[styles.label, { color: theme.textHint }]}>DEADLINE</Text>
                    <BottomSheetTextInput style={[styles.input, { backgroundColor: theme.background, borderColor: theme.border, color: theme.textPrimary }]} value={draftDeadline} onChangeText={setDraftDeadline} placeholder="YYYY-MM-DD" placeholderTextColor={theme.textHint} />
                  </View>
                </View>
                <TouchableOpacity style={[styles.saveBtn, { backgroundColor: theme.textPrimary }]} onPress={saveNewOrder}>
                  <Text style={[styles.saveBtnText, { color: isDarkMode ? '#000' : '#fff' }]}>Create Order</Text>
                </TouchableOpacity>
              </View>
            ) : selectedOrder && (
              <View>
                <Text style={[styles.sheetTitle, { color: theme.textPrimary }]}>Update Progress</Text>
                <Text style={[styles.sheetSubtitle, { color: theme.textMuted }]}>{selectedOrder.client} • {selectedOrder.product}</Text>
                
                <View style={styles.progressPicker}>
                  {[0, 25, 50, 75, 100].map(val => (
                    <TouchableOpacity 
                      key={val} 
                      style={[
                        styles.pickerBtn, 
                        { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.03)' : '#F8FAFC', borderColor: theme.border },
                        selectedOrder.progress === val ? { backgroundColor: theme.accentBlue, borderColor: theme.accentBlue } : {}
                      ]}
                      onPress={() => updateOrder(selectedOrder.id, { progress: val, status: val === 100 ? 'COMPLETED' : 'IN PROGRESS' })}
                    >
                      <Text style={[styles.pickerBtnText, { color: theme.textPrimary }, selectedOrder.progress === val ? { color: '#fff' } : {}]}>{val}%</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <TouchableOpacity style={[styles.saveBtn, { backgroundColor: theme.textPrimary }]} onPress={() => bottomSheetRef.current?.dismiss()}>
                  <Text style={[styles.saveBtnText, { color: isDarkMode ? '#000' : '#fff' }]}>Confirm Update</Text>
                </TouchableOpacity>
              </View>
            )}
          </BottomSheetScrollView>
        </KeyboardAvoidingView>
      </BottomSheetModal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 24, paddingTop: 32 },
  title: { fontSize: 28, fontWeight: '800' },
  subtitle: { fontSize: 13, marginTop: 4 },
  addBtn: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  
  listContent: { padding: 20, paddingTop: 0 },
  card: { borderRadius: 20, padding: 16, marginBottom: 16, borderWidth: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  cardLabel: { fontSize: 9, fontWeight: '800', letterSpacing: 1, marginBottom: 4 },
  cardTitle: { fontSize: 16, fontWeight: '700' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeNeutral: {},
  badgeSuccess: {},
  badgeText: { fontSize: 10, fontWeight: '800' },
  badgeTextNeutral: {},
  badgeTextSuccess: {},
  
  cardBody: { flexDirection: 'row', marginBottom: 16 },
  cardSubText: { fontSize: 14, fontWeight: '600' },
  
  progressContainer: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  progressBarBg: { flex: 1, height: 6, backgroundColor: '#F1F5F9', borderRadius: 3, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 3 },
  progressText: { fontSize: 12, fontWeight: '700', width: 35 },
  
  cardActions: { flexDirection: 'row', gap: 8, paddingTop: 12, borderTopWidth: 1 },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 8, borderRadius: 8, backgroundColor: '#F8FAFC' },
  actionBtnText: { fontSize: 13, fontWeight: '600' },
  deleteBtn: { width: 40, height: 36, alignItems: 'center', justifyContent: 'center', borderRadius: 8, backgroundColor: '#FEF2F2' },

  emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 100 },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginTop: 16 },
  emptySub: { fontSize: 14, marginTop: 4 },

  sheetBackground: { borderRadius: 32 },
  sheetContent: { padding: 24, flex: 1 },
  sheetTitle: { fontSize: 24, fontWeight: '800', marginBottom: 8 },
  sheetSubtitle: { fontSize: 14, marginBottom: 24 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 10, fontWeight: '800', letterSpacing: 1, marginBottom: 8 },
  input: { backgroundColor: '#F8FAFC', borderWidth: 1, borderRadius: 12, padding: 14, fontSize: 15 },
  row: { flexDirection: 'row' },
  saveBtn: { paddingVertical: 16, borderRadius: 16, alignItems: 'center', marginTop: 12 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  progressPicker: { flexDirection: 'row', gap: 8, marginBottom: 24 },
  pickerBtn: { flex: 1, height: 50, borderRadius: 12, backgroundColor: '#F8FAFC', alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  pickerBtnActive: { },
  pickerBtnText: { fontSize: 14, fontWeight: '700' },
  pickerBtnTextActive: { color: '#fff' },
});
