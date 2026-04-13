import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, RefreshControl } from 'react-native';
import { Colors, Typography, Layout } from '../../theme/tokens';
import { useFactory } from '../../hooks/useFactory';
import { Machine } from '../../lib/db';
import * as Haptics from 'expo-haptics';
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import { Swipeable } from 'react-native-gesture-handler';
import ConfirmSheet from '../../components/ConfirmSheet';
import { useToast } from '../../hooks/useToast';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, FadeInUp } from 'react-native-reanimated';
import { Settings, Plus, AlertTriangle, CheckCircle } from 'lucide-react-native';

const HOURLY_RATE = 5000;

function PulseCard({ isDown, children, onPress }: { isDown: boolean, children: React.ReactNode, onPress: () => void }) {
  const sv = useSharedValue(0);
  
  useEffect(() => {
    if (isDown) {
      sv.value = withRepeat(withTiming(1, { duration: 800 }), -1, true);
    } else {
      sv.value = 0;
    }
  }, [isDown]);

  const style = useAnimatedStyle(() => ({
    borderColor: isDown ? `rgba(220, 38, 38, ${0.4 + sv.value * 0.6})` : Colors.border,
    borderWidth: isDown ? 2 : 1,
  }));

  return (
    <Pressable style={{ flex: 1, margin: 8 }} onPress={onPress}>
      <Animated.View style={[styles.card, style]}>
        {children}
      </Animated.View>
    </Pressable>
  );
}

export default function MachinesScreen() {
  const { machines, updateMachine, loadData } = useFactory();
  const { showToast } = useToast();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [pendingAction, setPendingAction] = useState<{ id: string; action: 'down' | 'running' } | null>(null);

  const bottomSheetRef = useRef<BottomSheetModal>(null);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleAction = (id: string, action: 'down' | 'running') => {
    setPendingAction({ id, action });
    setConfirmVisible(true);
  };

  const executeAction = () => {
    if (!pendingAction) return;
    const { id, action } = pendingAction;
    if (action === 'down') {
      updateMachine(id, { status: 'Down' });
      showToast(`Machine #${id} marked as DOWN.`, 'error');
    } else {
      updateMachine(id, { status: 'Running' });
      showToast(`Machine #${id} is now running!`, 'success');
    }
  };

  const openDetails = (m: Machine) => {
    setSelectedMachine(m);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    bottomSheetRef.current?.present();
  };

  const isDueSoon = (dateStr: string) => {
    const nextSvc = new Date(dateStr);
    const diff = (nextSvc.getTime() - new Date().getTime()) / (1000 * 3600 * 24);
    return diff >= 0 && diff <= 14;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Machine Maintenance</Text>
          <Text style={styles.subtitle}>Monitor active equipment and manage downtime.</Text>
        </View>
        <Pressable style={styles.addBtn} onPress={() => showToast('Demo: Add Machine', 'success')}>
          <Plus size={16} color="#ffffff" style={{ marginRight: 8 }} />
          <Text style={styles.addBtnText}>Add Machine</Text>
        </Pressable>
      </View>

      <FlatList
        data={machines}
        numColumns={2}
        keyExtractor={i => i.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Settings size={48} color={Colors.textHint} />
            <Text style={styles.emptyTitle}>No machines added</Text>
            <Text style={styles.emptySubtitle}>Add your first machine.</Text>
          </View>
        )}
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInUp.delay(index * 100).duration(400)} style={{ flex: 1 }}>
            <Swipeable 
              containerStyle={{ flex: 1 }}
              renderLeftActions={() => (
                <Pressable style={[styles.swipeAction, { backgroundColor: Colors.accentRed, marginLeft: 8 }]} onPress={() => handleAction(item.id, 'down')}>
                  <Text style={styles.swipeText}>Log Downtime</Text>
                </Pressable>
              )}
              renderRightActions={() => (
                <Pressable style={[styles.swipeAction, { backgroundColor: Colors.accentGreen, marginRight: 8 }]} onPress={() => handleAction(item.id, 'running')}>
                  <Text style={styles.swipeText}>Running</Text>
                </Pressable>
              )}
            >
              <PulseCard isDown={item.status === 'Down'} onPress={() => openDetails(item)}>
                {isDueSoon(item.nextService) && (
                  <View style={styles.dueBadge}>
                    <Text style={styles.dueBadgeText}>DUE SOON</Text>
                  </View>
                )}
                
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <View>
                    <Text style={styles.cardTitle}>{item.name}</Text>
                    <Text style={styles.cardSubtitle}>{item.type}</Text>
                  </View>
                  <View style={[styles.pill, item.status === 'Running' ? styles.pillSuccess : item.status === 'Down' ? styles.pillDanger : styles.pillWarning]}>
                    {item.status === 'Running' ? <CheckCircle size={10} color={Colors.accentGreen} /> : <AlertTriangle size={10} color={item.status === 'Down' ? Colors.accentRed : Colors.accentAmber} />}
                    <Text style={[styles.pillText, item.status === 'Running' ? styles.pillTextSuccess : item.status === 'Down' ? styles.pillTextDanger : styles.pillTextWarning]}>
                      {item.status.toUpperCase()}
                    </Text>
                  </View>
                </View>

                <View style={styles.statsRow}>
                  <View>
                    <Text style={styles.statLabel}>NEXT SERVICE</Text>
                    <Text style={styles.statValue}>{item.nextService}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.statLabel}>DOWNTIME</Text>
                    <Text style={styles.statValue}>{item.downtimeHours}h</Text>
                  </View>
                </View>

                {item.status === 'Running' ? (
                   <Pressable style={styles.outlineBtn} onPress={() => handleAction(item.id, 'down')}>
                     <Text style={styles.outlineBtnText}>Log Downtime</Text>
                   </Pressable>
                ) : (
                   <Pressable style={[styles.outlineBtn, { borderColor: Colors.accentGreen }]} onPress={() => handleAction(item.id, 'running')}>
                     <Text style={[styles.outlineBtnText, { color: Colors.accentGreen }]}>Mark Running</Text>
                   </Pressable>
                )}

              </PulseCard>
            </Swipeable>
          </Animated.View>
        )}
      />

      <ConfirmSheet
        visible={confirmVisible}
        title={pendingAction?.action === 'down' ? 'Log Downtime?' : 'Mark Running?'}
        message={pendingAction?.action === 'down' 
          ? `Confirm machine is down? This will alert the dashboard.` 
          : `Mark this machine as fully operational?`}
        confirmStyle={pendingAction?.action === 'down' ? 'danger' : 'success'}
        onConfirm={executeAction}
        onClose={() => setConfirmVisible(false)}
      />

      <BottomSheetModal
        ref={bottomSheetRef}
        snapPoints={['55%']}
        enablePanDownToClose
        backdropComponent={(props) => <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.6} />}
        backgroundStyle={styles.sheetBackground}
      >
        <BottomSheetView style={styles.sheetContent}>
          {selectedMachine && (
            <>
              <Text style={styles.sheetTitle}>{selectedMachine.name}</Text>
              <Text style={styles.sheetSubtitle}>{selectedMachine.type} • Last service: {selectedMachine.lastService}</Text>
              
              <View style={styles.costBox}>
                <Text style={styles.costTitle}>Total downtime cost</Text>
                <Text style={styles.costValue}>₹{(selectedMachine.downtimeHours * HOURLY_RATE).toLocaleString()}</Text>
                <Text style={styles.costSub}>({selectedMachine.downtimeHours} hours at ₹5,000/hr)</Text>
              </View>
            </>
          )}
        </BottomSheetView>
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
  listContent: { paddingHorizontal: 16, paddingBottom: 60 },
  card: { flex: 1, backgroundColor: Colors.surface, padding: 16, borderRadius: Layout.radius.m, ...Layout.shadow, elevation: 2 },
  cardTitle: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary },
  cardSubtitle: { fontSize: 14, color: Colors.textMuted, marginBottom: 16 },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  pillSuccess: { backgroundColor: '#dcfce7' },
  pillDanger: { backgroundColor: '#fee2e2' },
  pillWarning: { backgroundColor: '#fef3c7' },
  pillText: { fontSize: 10, fontWeight: '800' },
  pillTextSuccess: { color: Colors.accentGreen },
  pillTextDanger: { color: Colors.accentRed },
  pillTextWarning: { color: Colors.accentAmber },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  statLabel: { ...Typography.label, color: Colors.textHint },
  statValue: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary, marginTop: 4 },
  outlineBtn: { paddingVertical: 10, borderWidth: 1, borderColor: Colors.accentRed, borderRadius: Layout.radius.s, alignItems: 'center', backgroundColor: '#fff' },
  outlineBtnText: { color: Colors.accentRed, fontWeight: '700', fontSize: 13 },
  swipeAction: { justifyContent: 'center', alignItems: 'center', paddingHorizontal: 16, borderRadius: 12, marginVertical: 8, flex: 1 },
  swipeText: { color: '#fff', fontWeight: '600', fontSize: 12 },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: Colors.textPrimary, marginTop: 16 },
  emptySubtitle: { fontSize: 14, color: Colors.textMuted, marginTop: 8 },
  sheetBackground: { borderRadius: 24, padding: 16 },
  sheetContent: { padding: 24, flex: 1 },
  sheetTitle: { fontSize: 24, fontWeight: '800', color: Colors.textPrimary, marginBottom: 4 },
  sheetSubtitle: { fontSize: 14, color: Colors.textMuted, marginBottom: 32 },
  costBox: { backgroundColor: '#fef2f2', padding: 24, borderRadius: Layout.radius.s, borderWidth: 1, borderColor: '#fecaca', alignItems: 'center' },
  costTitle: { fontSize: 13, fontWeight: '700', color: '#991b1b', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 },
  costValue: { fontSize: 36, fontWeight: '800', color: Colors.accentRed },
  costSub: { fontSize: 13, color: '#991b1b', marginTop: 8 },
  dueBadge: { position: 'absolute', top: -8, left: -8, backgroundColor: Colors.accentAmber, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, zIndex: 10 },
  dueBadgeText: { fontSize: 10, fontWeight: '800', color: '#fff' },
});
