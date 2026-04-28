import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, RefreshControl, KeyboardAvoidingView, Platform, ScrollView, TextInput } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useFactory } from '../../hooks/useFactory';
import { useTheme } from '../../hooks/useTheme';
import { Users, Plus, Trash2, Edit2, Hash, ShieldCheck, Sun, Moon } from 'lucide-react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetTextInput, BottomSheetView, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useToast } from '../../hooks/useToast';
import { Employee } from '../../lib/db';

export default function TeamScreen() {
  const { employees, addEmployee, updateEmployee, setEmployees, loadData, isDarkMode, toggleDarkMode } = useFactory();
  const { theme } = useTheme();
  const { showToast } = useToast();
  const [refreshing, setRefreshing] = useState(false);
  const bottomSheetRef = useRef<BottomSheetModal>(null);

  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  
  // Form State
  const [draftName, setDraftName] = useState('');
  const [draftEmail, setDraftEmail] = useState('');
  const [draftPassword, setDraftPassword] = useState('');

  const InputComponent = Platform.OS === 'web' ? TextInput : BottomSheetTextInput;

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const deleteEmployee = (id: string) => {
    setEmployees(employees.filter(e => e.id !== id));
    showToast('Employee removed', 'success');
  };

  const openCreate = () => {
    setSelectedEmployee(null);
    setDraftName('');
    setDraftEmail('');
    setDraftPassword('');
    bottomSheetRef.current?.present();
  };

  const openEdit = (emp: Employee) => {
    setSelectedEmployee(emp);
    setDraftName(emp.name);
    setDraftEmail(emp.email);
    setDraftPassword(emp.password || '');
    bottomSheetRef.current?.present();
  };

  const saveEmployee = () => {
    if (!draftName || !draftEmail || !draftPassword) {
      showToast('All fields are required', 'error');
      return;
    }
    
    if (selectedEmployee) {
      updateEmployee(selectedEmployee.id, {
        name: draftName,
        email: draftEmail,
        password: draftPassword
      });
      showToast('Employee updated', 'success');
    } else {
      addEmployee({
        name: draftName,
        email: draftEmail,
        password: draftPassword
      });
      showToast('Employee added', 'success');
    }
    bottomSheetRef.current?.dismiss();
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={[styles.title, { color: theme.textPrimary }]}>Team Management</Text>
            <Text style={[styles.subtitle, { color: theme.textMuted }]}>Manage your factory workforce</Text>
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
        data={employees}
        keyExtractor={i => i.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Users size={40} color={theme.textHint} />
            <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>No Employees Yet</Text>
            <Text style={[styles.emptySub, { color: theme.textMuted }]}>Add team members to give them access</Text>
          </View>
        )}
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeIn.delay(index * 50)} style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.cardHeader}>
              <View style={[styles.iconBox, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#F8FAFC' }]}>
                <Hash size={20} color={theme.textMuted} />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>{item.name}</Text>
                <Text style={[styles.cardMeta, { color: theme.textHint }]}>{item.email}</Text>
              </View>
              <View style={[styles.codeBadge, { backgroundColor: theme.accentBlue + '15' }]}>
                <Text style={[styles.codeBadgeText, { color: theme.accentBlue }]}>{item.id}</Text>
              </View>
            </View>

            <View style={[styles.cardActions, { borderTopColor: theme.border }]}>
              <Pressable style={[styles.actionBtn, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.03)' : '#F8FAFC' }]} onPress={() => openEdit(item)}>
                <Edit2 size={14} color={theme.textMuted} />
                <Text style={[styles.actionText, { color: theme.textPrimary }]}>Edit</Text>
              </Pressable>
              <Pressable style={[styles.deleteBtn, { backgroundColor: theme.accentRed + '15' }]} onPress={() => deleteEmployee(item.id)}>
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
            <Text style={[styles.sheetTitle, { color: theme.textPrimary }]}>
              {selectedEmployee ? 'Edit Employee' : 'New Employee'}
            </Text>
            
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.textHint }]}>FULL NAME</Text>
              <BottomSheetTextInput style={[styles.input, { backgroundColor: theme.background, borderColor: theme.border, color: theme.textPrimary }]} value={draftName} onChangeText={setDraftName} placeholder="e.g. John Smith" placeholderTextColor={theme.textHint} />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.textHint }]}>EMAIL ADDRESS</Text>
              <BottomSheetTextInput style={[styles.input, { backgroundColor: theme.background, borderColor: theme.border, color: theme.textPrimary }]} value={draftEmail} onChangeText={setDraftEmail} placeholder="e.g. john@factory.com" keyboardType="email-address" autoCapitalize="none" placeholderTextColor={theme.textHint} />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.textHint }]}>TEMPORARY PASSWORD</Text>
              <BottomSheetTextInput style={[styles.input, { backgroundColor: theme.background, borderColor: theme.border, color: theme.textPrimary }]} value={draftPassword} onChangeText={setDraftPassword} placeholder="Enter password" secureTextEntry placeholderTextColor={theme.textHint} />
            </View>

            <TouchableOpacity style={[styles.saveBtn, { backgroundColor: theme.textPrimary }]} onPress={saveEmployee}>
              <Text style={[styles.saveBtnText, { color: isDarkMode ? '#000' : '#fff' }]}>
                {selectedEmployee ? 'Save Changes' : 'Create Employee'}
              </Text>
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
  
  listContent: { padding: 20, paddingTop: 0, paddingBottom: 100 },
  card: { borderRadius: 20, padding: 16, marginBottom: 16, borderWidth: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  iconBox: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  cardMeta: { fontSize: 13, fontWeight: '500' },
  codeBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  codeBadgeText: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  
  cardActions: { flexDirection: 'row', gap: 8, paddingTop: 16, borderTopWidth: 1 },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 10, borderRadius: 10 },
  actionText: { fontSize: 13, fontWeight: '600' },
  deleteBtn: { width: 44, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },

  emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 100 },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginTop: 16 },
  emptySub: { fontSize: 14, marginTop: 4 },

  sheetContent: { padding: 24 },
  sheetTitle: { fontSize: 24, fontWeight: '800', marginBottom: 24 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 10, fontWeight: '800', letterSpacing: 1, marginBottom: 8 },
  input: { borderWidth: 1, borderRadius: 12, padding: 14, fontSize: 15 },
  saveBtn: { paddingVertical: 16, borderRadius: 16, alignItems: 'center', marginTop: 12, marginBottom: 40 },
  saveBtnText: { fontSize: 16, fontWeight: '700' },
});
