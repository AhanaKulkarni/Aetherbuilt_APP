import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, RefreshControl, TextInput, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useFactory } from '../../hooks/useFactory';
import { useTheme } from '../../hooks/useTheme';
import { Package, Truck, Clock, CheckCircle2, AlertCircle, Plus, MapPin } from 'lucide-react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import { useToast } from '../../hooks/useToast';

export default function ShipmentsScreen() {
  const { shipments, addShipment, loadData, isDarkMode } = useFactory();
  const { theme } = useTheme();
  const { showToast } = useToast();
  const [refreshing, setRefreshing] = useState(false);
  const bottomSheetRef = useRef<BottomSheetModal>(null);

  // Form State
  const [draftClient, setDraftClient] = useState('');
  const [draftProduct, setDraftProduct] = useState('');
  const [draftQty, setDraftQty] = useState('');
  const [draftCarrier, setDraftCarrier] = useState('BlueDart');

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const saveNewShipment = () => {
    if (!draftClient || !draftProduct || !draftQty) {
      showToast('Please fill all required fields', 'error');
      return;
    }
    
    addShipment({
      orderId: Math.floor(Math.random() * 1000),
      client: draftClient,
      product: draftProduct,
      qty: parseInt(draftQty, 10) || 0,
      dispatchDate: new Date().toISOString().split('T')[0],
      expectedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'Pending',
      carrier: draftCarrier,
      trackingNote: 'Awaiting Pickup'
    });

    bottomSheetRef.current?.dismiss();
    setDraftClient('');
    setDraftProduct('');
    setDraftQty('');
    showToast(`Shipment for ${draftClient} created`, 'success');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered': return theme.accentGreen;
      case 'Dispatched': return theme.accentBlue;
      case 'Delayed': return theme.accentRed;
      default: return theme.accentAmber;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={[styles.title, { color: theme.textPrimary }]}>Shipments</Text>
            <Text style={[styles.subtitle, { color: theme.textMuted }]}>Logistics & Tracking</Text>
          </View>
          <Pressable style={[styles.addBtn, { backgroundColor: theme.textPrimary }]} onPress={() => bottomSheetRef.current?.present()}>
            <Plus size={18} color={isDarkMode ? '#000' : '#fff'} />
          </Pressable>
        </View>
      </View>

      <FlatList
        data={shipments}
        keyExtractor={i => i.id.toString()}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Truck size={40} color={theme.textHint} />
            <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>No Shipments Yet</Text>
          </View>
        )}
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeIn.delay(index * 50)} style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={[styles.cardLabel, { color: theme.textHint }]}>#{item.id}</Text>
                <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>{item.client}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '15' }]}>
                <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{item.status.toUpperCase()}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Package size={14} color={theme.textMuted} />
              <Text style={[styles.infoText, { color: theme.textMuted }]}>{item.qty} units of {item.product}</Text>
            </View>

            <View style={[styles.footer, { borderTopColor: theme.border }]}>
              <View style={styles.timeInfo}>
                <Clock size={12} color={theme.textHint} />
                <Text style={[styles.timeText, { color: theme.textHint }]}>ETA: {item.expectedDelivery}</Text>
              </View>
              <View style={styles.carrierInfo}>
                <Truck size={12} color={theme.textHint} />
                <Text style={[styles.timeText, { color: theme.textHint }]}>{item.carrier}</Text>
              </View>
            </View>
          </Animated.View>
        )}
      />

      <BottomSheetModal
        ref={bottomSheetRef}
        snapPoints={['65%']}
        enablePanDownToClose
        backdropComponent={(props) => <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.4} />}
        backgroundStyle={{ backgroundColor: theme.surface, borderRadius: 32 }}
        handleIndicatorStyle={{ backgroundColor: theme.border }}
      >
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView contentContainerStyle={styles.sheetContent}>
            <Text style={[styles.sheetTitle, { color: theme.textPrimary }]}>New Shipment</Text>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.textHint }]}>CLIENT NAME</Text>
              <TextInput style={[styles.input, { backgroundColor: theme.background, borderColor: theme.border, color: theme.textPrimary }]} value={draftClient} onChangeText={setDraftClient} placeholder="e.g. Tata Motors" placeholderTextColor={theme.textHint} />
            </View>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.textHint }]}>PRODUCT</Text>
              <TextInput style={[styles.input, { backgroundColor: theme.background, borderColor: theme.border, color: theme.textPrimary }]} value={draftProduct} onChangeText={setDraftProduct} placeholder="e.g. Gear Assemblies" placeholderTextColor={theme.textHint} />
            </View>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.textHint }]}>QUANTITY</Text>
              <TextInput style={[styles.input, { backgroundColor: theme.background, borderColor: theme.border, color: theme.textPrimary }]} value={draftQty} onChangeText={setDraftQty} keyboardType="number-pad" placeholder="0" placeholderTextColor={theme.textHint} />
            </View>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.textHint }]}>CARRIER</Text>
              <TextInput style={[styles.input, { backgroundColor: theme.background, borderColor: theme.border, color: theme.textPrimary }]} value={draftCarrier} onChangeText={setDraftCarrier} placeholder="BlueDart" placeholderTextColor={theme.textHint} />
            </View>
            <Pressable style={[styles.saveBtn, { backgroundColor: theme.textPrimary }]} onPress={saveNewShipment}>
              <Text style={[styles.saveBtnText, { color: isDarkMode ? '#000' : '#fff' }]}>Book Shipment</Text>
            </Pressable>
          </ScrollView>
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
  card: { borderRadius: 20, padding: 16, marginBottom: 16, borderWidth: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  cardLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5, marginBottom: 4 },
  cardTitle: { fontSize: 18, fontWeight: '700' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 10, fontWeight: '800' },
  
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  infoText: { fontSize: 14, fontWeight: '500' },
  
  footer: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 12, borderTopWidth: 1 },
  timeInfo: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  carrierInfo: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  timeText: { fontSize: 11, fontWeight: '600' },

  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyTitle: { fontSize: 16, fontWeight: '600', marginTop: 16 },

  sheetContent: { padding: 24 },
  sheetTitle: { fontSize: 24, fontWeight: '800', marginBottom: 24 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 10, fontWeight: '800', letterSpacing: 1, marginBottom: 8 },
  input: { borderWidth: 1, borderRadius: 12, padding: 14, fontSize: 15 },
  saveBtn: { paddingVertical: 16, borderRadius: 16, alignItems: 'center', marginTop: 12 },
  saveBtnText: { fontSize: 16, fontWeight: '700' },
});
