import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, RefreshControl, TextInput, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { Typography, Layout, LightTheme, DarkTheme } from '../../theme/tokens';
import { useFactory } from '../../hooks/useFactory';
import { useTheme } from '../../hooks/useTheme';
import { Machine } from '../../lib/db';
import * as Haptics from 'expo-haptics';
import { useToast } from '../../hooks/useToast';
import { Trash2, Edit2, Plus, Wrench, AlertCircle, CheckCircle2, Sun, Moon } from 'lucide-react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetView, BottomSheetTextInput, BottomSheetScrollView } from '@gorhom/bottom-sheet';

export default function MachinesScreen() {
  const { machines, updateMachine, addMachine, setMachines, loadData, toggleDarkMode, isDarkMode } = useFactory();
  const { theme } = useTheme();
  const { showToast } = useToast();
  const [refreshing, setRefreshing] = useState(false);
  const bottomSheetRef = useRef<BottomSheetModal>(null);

  // Form State
  const [draftName, setDraftName] = useState('');
  const [draftType, setDraftType] = useState('');

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const deleteMachine = (id: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    setMachines(machines.filter(m => m.id !== id));
    showToast(`Machine deleted`, 'success');
  };

  const toggleStatus = (m: Machine) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const newStatus = m.status === 'Running' ? 'Down' : 'Running';
    updateMachine(m.id, { status: newStatus });
    showToast(`${m.name} is now ${newStatus}`, newStatus === 'Running' ? 'success' : 'error');
  };

  const saveNewMachine = () => {
    if (!draftName || !draftType) {
      showToast('Name and Type are required', 'error');
      return;
    }
    addMachine({
      name: draftName,
      type: draftType,
      status: 'Running',
      lastService: new Date().toISOString().split('T')[0],
      nextService: new Date(Date.now() + 90 * 24 * 3600 * 1000).toISOString().split('T')[0],
      downtimeHours: 0,
    });
    bottomSheetRef.current?.dismiss();
    showToast(`${draftName} added to inventory`, 'success');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={[styles.title, { color: theme.textPrimary }]}>Machines</Text>
            <Text style={[styles.subtitle, { color: theme.textMuted }]}>Operational health</Text>
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
        data={machines}
        keyExtractor={i => i.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Wrench size={40} color={theme.textHint} />
            <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>No Equipment Tracked</Text>
            <Text style={[styles.emptySub, { color: theme.textMuted }]}>Add your first machine to monitor health</Text>
          </View>
        )}
        renderItem={({ item, index }) => {
          const isDown = item.status === 'Down';
          return (
            <Animated.View entering={FadeIn.delay(index * 50)} style={[styles.card, { backgroundColor: theme.surface, borderColor: isDown ? theme.accentRed : theme.border }]}>
              <View style={styles.cardTop}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.cardLabel, { color: theme.textHint }]}>{item.type.toUpperCase()}</Text>
                  <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>{item.name}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: isDown ? theme.accentRed + '15' : theme.accentGreen + '15' }]}>
                  <Text style={[styles.statusBadgeText, { color: isDown ? theme.accentRed : theme.accentGreen }]}>
                    {item.status.toUpperCase()}
                  </Text>
                </View>
              </View>

              <View style={[styles.statsRow, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.03)' : '#F8FAFC' }]}>
                <View style={styles.statBox}>
                  <Text style={[styles.cardLabel, { color: theme.textHint }]}>NEXT SERVICE</Text>
                  <Text style={[styles.statValue, { color: theme.textPrimary }]}>{item.nextService}</Text>
                </View>
                <View style={[styles.statBox, { borderLeftWidth: 1, borderLeftColor: theme.border }]}>
                  <Text style={[styles.cardLabel, { color: theme.textHint }]}>TOTAL DOWNTIME</Text>
                  <Text style={[styles.statValue, { color: theme.textPrimary }]}>{item.downtimeHours}h</Text>
                </View>
              </View>

              <View style={[styles.cardActions, { borderTopColor: theme.border }]}>
                <Pressable style={[styles.actionBtn, isDown ? { backgroundColor: theme.accentGreen + '15' } : { backgroundColor: theme.accentRed + '15' }]} onPress={() => toggleStatus(item)}>
                  <AlertCircle size={14} color={isDown ? theme.accentGreen : theme.accentRed} />
                  <Text style={[styles.actionText, { color: isDown ? theme.accentGreen : theme.accentRed }]}>
                    {isDown ? 'Mark Fixed' : 'Log Downtime'}
                  </Text>
                </Pressable>
                <Pressable style={[styles.deleteBtn, { backgroundColor: theme.accentRed + '15' }]} onPress={() => deleteMachine(item.id)}>
                  <Trash2 size={14} color={theme.accentRed} />
                </Pressable>
              </View>
            </Animated.View>
          );
        }}
      />

      <BottomSheetModal
        ref={bottomSheetRef}
        snapPoints={['50%']}
        enablePanDownToClose
        backdropComponent={(props) => <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.4} />}
        backgroundStyle={{ backgroundColor: theme.surface, borderRadius: 32 }}
        handleIndicatorStyle={{ backgroundColor: theme.border }}
      >
        <BottomSheetScrollView style={styles.sheetContent}>
          <Text style={[styles.sheetTitle, { color: theme.textPrimary }]}>Add Equipment</Text>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.textHint }]}>MACHINE NAME</Text>
            <BottomSheetTextInput style={[styles.input, { backgroundColor: theme.background, borderColor: theme.border, color: theme.textPrimary }]} value={draftName} onChangeText={setDraftName} placeholder="e.g. CNC Unit A1" placeholderTextColor={theme.textHint} />
          </View>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.textHint }]}>EQUIPMENT TYPE</Text>
            <BottomSheetTextInput style={[styles.input, { backgroundColor: theme.background, borderColor: theme.border, color: theme.textPrimary }]} value={draftType} onChangeText={setDraftType} placeholder="e.g. Lathe, Cutting, Assembly" placeholderTextColor={theme.textHint} />
          </View>
          <TouchableOpacity style={[styles.saveBtn, { backgroundColor: theme.textPrimary }]} onPress={saveNewMachine}>
            <Text style={[styles.saveBtnText, { color: isDarkMode ? '#000' : '#fff' }]}>Register Machine</Text>
          </TouchableOpacity>
        </BottomSheetScrollView>
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
  cardDown: { },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  cardLabel: { fontSize: 9, fontWeight: '800', letterSpacing: 1, marginBottom: 4 },
  cardTitle: { fontSize: 16, fontWeight: '700' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusBadgeText: { fontSize: 10, fontWeight: '800' },
  
  statsRow: { flexDirection: 'row', borderRadius: 12, paddingVertical: 12, marginBottom: 16 },
  statBox: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 14, fontWeight: '700' },
  
  cardActions: { flexDirection: 'row', gap: 8, paddingTop: 12, borderTopWidth: 1 },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 10 },
  btnLog: { },
  btnResolve: { },
  actionText: { fontSize: 13, fontWeight: '700' },
  deleteBtn: { width: 44, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 10, backgroundColor: '#FEF2F2' },

  emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 100 },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginTop: 16 },
  emptySub: { fontSize: 14, marginTop: 4 },

  sheetBackground: { borderRadius: 32 },
  sheetContent: { padding: 24, flex: 1 },
  sheetTitle: { fontSize: 24, fontWeight: '800', marginBottom: 24 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 10, fontWeight: '800', letterSpacing: 1, marginBottom: 8 },
  input: { backgroundColor: '#F8FAFC', borderWidth: 1, borderRadius: 12, padding: 14, fontSize: 15 },
  saveBtn: { paddingVertical: 16, borderRadius: 16, alignItems: 'center', marginTop: 'auto', marginBottom: 20 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
