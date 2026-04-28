import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  Pressable, 
  RefreshControl, 
  TextInput, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView 
} from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useFactory } from '../../hooks/useFactory';
import { useTheme } from '../../hooks/useTheme';
import { LightTheme, DarkTheme } from '../../theme/tokens';
import { Users, Plus, Trash2, MapPin, BarChart3, Sun, Moon } from 'lucide-react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetView, BottomSheetTextInput, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useToast } from '../../hooks/useToast';

export default function VendorsScreen() {
  const { vendors, addVendor, setVendors, loadData, toggleDarkMode, isDarkMode } = useFactory();
  const { theme } = useTheme();
  const { showToast } = useToast();
  const [refreshing, setRefreshing] = useState(false);
  const bottomSheetRef = useRef<BottomSheetModal>(null);

  // Form State
  const [draftName, setDraftName] = useState('');
  const [draftMaterial, setDraftMaterial] = useState('');
  const [draftCity, setDraftCity] = useState('');

  const InputComponent = Platform.OS === 'web' ? TextInput : BottomSheetTextInput;

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const deleteVendor = (id: string) => {
    setVendors(vendors.filter((v) => v.id !== id));
    showToast(`Vendor removed`, 'success');
  };

  const saveNewVendor = () => {
    if (!draftName || !draftMaterial) {
      showToast('Name and Material are required', 'error');
      return;
    }
    addVendor({
      name: draftName,
      material: draftMaterial,
      city: draftCity || 'Unknown',
      reliability: 100,
      avgDeliveryDays: 0,
      priceTrend: 'stable',
    });
    bottomSheetRef.current?.dismiss();
    setDraftName('');
    setDraftMaterial('');
    setDraftCity('');
    showToast(`${draftName} added to vendors`, 'success');
  };

  const getProgressColor = (score: number) => {
    if (score >= 90) return theme.accentGreen;
    if (score >= 70) return theme.accentAmber;
    return theme.accentRed;
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={[styles.title, { color: theme.textPrimary }]}>Vendors</Text>
            <Text style={[styles.subtitle, { color: theme.textMuted }]}>Supplier network</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Pressable onPress={toggleDarkMode} style={{ justifyContent: 'center' }}>
               {isDarkMode ? <Sun size={20} color={theme.accentAmber} /> : <Moon size={20} color={theme.textMuted} />}
            </Pressable>
            <Pressable style={[styles.addBtn, { backgroundColor: theme.textPrimary }]} onPress={() => bottomSheetRef.current?.present()}>
              <Plus size={18} color={isDarkMode ? '#000' : '#fff'} />
            </Pressable>
          </View>
        </View>
      </View>

      <FlatList
        data={vendors}
        keyExtractor={i => i.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Users size={40} color={theme.textHint} />
            <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>No Suppliers Yet</Text>
            <Text style={[styles.emptySub, { color: theme.textMuted }]}>Add vendors to manage procurement</Text>
          </View>
        )}
        renderItem={({ item, index }) => {
          const scoreColor = getProgressColor(item.reliability);
          return (
            <Animated.View entering={FadeIn.delay(index * 50)} style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>{item.name}</Text>
                  <View style={styles.locationRow}>
                    <MapPin size={10} color={theme.textMuted} />
                    <Text style={[styles.locationText, { color: theme.textMuted }]}>{item.city}</Text>
                  </View>
                </View>
                <View style={[styles.scoreBadge, { backgroundColor: scoreColor + '15' }]}>
                  <Text style={[styles.scoreBadgeText, { color: scoreColor }]}>{item.reliability}% RELIABILITY</Text>
                </View>
              </View>

              <View style={[styles.statsRow, { borderTopColor: theme.border, borderBottomColor: theme.border }]}>
                <View style={styles.statBox}>
                  <BarChart3 size={14} color={theme.textMuted} />
                  <Text style={[styles.statValue, { color: theme.textPrimary }]}>{item.material}</Text>
                </View>
              </View>
              
              <View style={styles.cardFooter}>
                <Pressable style={[styles.actionBtn, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.03)' : '#F8FAFC' }]}>
                  <Text style={[styles.actionText, { color: theme.textPrimary }]}>View Contracts</Text>
                </Pressable>
                <Pressable style={[styles.deleteBtn, { backgroundColor: theme.accentRed + '15' }]} onPress={() => deleteVendor(item.id)}>
                  <Trash2 size={14} color={theme.accentRed} />
                </Pressable>
              </View>
            </Animated.View>
          );
        }}
      />

      <BottomSheetModal
        ref={bottomSheetRef}
        snapPoints={['60%']}
        enablePanDownToClose
        backdropComponent={(props) => <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.4} />}
        backgroundStyle={{ backgroundColor: theme.surface, borderRadius: 32 }}
        handleIndicatorStyle={{ backgroundColor: theme.border }}
      >
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <BottomSheetScrollView contentContainerStyle={styles.sheetContent}>
            <Text style={[styles.sheetTitle, { color: theme.textPrimary }]}>New Vendor</Text>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.textHint }]}>COMPANY NAME</Text>
              <BottomSheetTextInput style={[styles.input, { backgroundColor: theme.background, borderColor: theme.border, color: theme.textPrimary }]} value={draftName} onChangeText={setDraftName} placeholder="e.g. Steel Corp" placeholderTextColor={theme.textHint} />
            </View>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.textHint }]}>PRIMARY MATERIAL</Text>
              <BottomSheetTextInput style={[styles.input, { backgroundColor: theme.background, borderColor: theme.border, color: theme.textPrimary }]} value={draftMaterial} onChangeText={setDraftMaterial} placeholder="e.g. Raw Aluminum" placeholderTextColor={theme.textHint} />
            </View>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.textHint }]}>OFFICE CITY</Text>
              <BottomSheetTextInput style={[styles.input, { backgroundColor: theme.background, borderColor: theme.border, color: theme.textPrimary }]} value={draftCity} onChangeText={setDraftCity} placeholder="e.g. Mumbai" placeholderTextColor={theme.textHint} />
            </View>
            <TouchableOpacity style={[styles.saveBtn, { backgroundColor: theme.textPrimary }]} onPress={saveNewVendor}>
              <Text style={[styles.saveBtnText, { color: isDarkMode ? '#000' : '#fff' }]}>Register Vendor</Text>
            </TouchableOpacity>
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
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  cardTitle: { fontSize: 16, fontWeight: '700' },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  locationText: { fontSize: 11, fontWeight: '500' },
  scoreBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  scoreBadgeText: { fontSize: 9, fontWeight: '800' },
  
  statsRow: { paddingVertical: 12, borderTopWidth: 1, borderBottomWidth: 1, marginTop: 4, marginBottom: 16 },
  statBox: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statValue: { fontSize: 13, fontWeight: '600' },
  
  cardFooter: { flexDirection: 'row', gap: 8 },
  actionBtn: { flex: 1, height: 40, borderRadius: 10, backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center' },
  actionText: { fontSize: 13, fontWeight: '600' },
  deleteBtn: { width: 44, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },

  emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 100 },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginTop: 16 },
  emptySub: { fontSize: 14, marginTop: 4 },

  sheetBackground: { borderRadius: 32 },
  sheetContent: { padding: 24 },
  sheetTitle: { fontSize: 24, fontWeight: '800', marginBottom: 24 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 10, fontWeight: '800', letterSpacing: 1, marginBottom: 8 },
  input: { borderWidth: 1, borderRadius: 12, padding: 14, fontSize: 15 },
  saveBtn: { paddingVertical: 16, borderRadius: 16, alignItems: 'center', marginTop: 12 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
