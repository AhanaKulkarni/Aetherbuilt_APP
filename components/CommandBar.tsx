import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, Pressable, Platform } from 'react-native';
import { Send } from 'lucide-react-native';
import { Colors } from '../theme/tokens';
import { parseCommand } from '../lib/parser';
import { useFactory } from '../hooks/useFactory';
import { useRouter } from 'expo-router';
import { useToast } from '../hooks/useToast';
import * as Haptics from 'expo-haptics';

const CHIPS = [
  'shipment for Tata Motors dispatched', 'how many orders active', 'order 2 started', 
  'machine 1 service done', 'delayed orders', 'dashboard', 'rfq for steel'
];

export default function CommandBar() {
  const [text, setText] = useState('');
  const { orders, machines, shipments, pos, updateOrder, updateMachine, updateShipment, updatePO, addCommandHistory } = useFactory();
  const router = useRouter();
  const { showToast } = useToast();

  const handleSend = (cmd: string = text) => {
    if (!cmd.trim()) return;
    
    const context = { orders, machines, shipments, pos };
    const result = parseCommand(cmd, context);
    
    // Log history
    addCommandHistory({
      timestamp: new Date().toISOString(),
      rawInput: cmd,
      success: result.action !== 'ERROR',
      message: result.message
    });

    if (result.action === 'ERROR') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      showToast(result.message, 'error');
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      if (result.action !== 'TOAST' && result.action !== 'NAVIGATE') {
        showToast(result.message, 'success');
      } else if (result.action === 'TOAST') {
        showToast(result.message, 'success');
      }
    }
    
    // Process intent
    if (result.action === 'UPDATE_MACHINE') {
      updateMachine(result.payload.id, result.payload.updates);
    } else if (result.action === 'UPDATE_ORDER') {
      updateOrder(result.payload.id, result.payload.updates);
    } else if (result.action === 'UPDATE_SHIPMENT') {
      updateShipment(result.payload.id, result.payload.updates);
    } else if (result.action === 'UPDATE_PO') {
      updatePO(result.payload.id, result.payload.updates);
    } else if (result.action === 'NAVIGATE') {
      // In Expo Router, params can be passed via navigating to the exact route or with search parameters
      router.push(result.payload.route as any);
      if (result.action === 'NAVIGATE') showToast(result.message, 'success'); // Toast on success navigate
    }

    setText('');
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <View style={styles.commandPill}>
          <Text style={styles.commandPillText}>⚡ COMMAND</Text>
        </View>
        <TextInput
          style={styles.input}
          placeholder='Try: "order 3 completed", "delayed orders", "machine 2 down"'
          placeholderTextColor={Colors.textHint}
          value={text}
          onChangeText={setText}
          onSubmitEditing={() => handleSend()}
          returnKeyType="send"
        />
        <Pressable style={styles.sendButton} onPress={() => handleSend()}>
          <Send size={16} color={Colors.textMuted} />
        </Pressable>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll} contentContainerStyle={styles.chipContent}>
        {CHIPS.map((chip, idx) => (
          <Pressable key={idx} style={styles.chip} onPress={() => handleSend(chip)}>
            <Text style={styles.chipText}>{chip}</Text>
          </Pressable>
        ))}
        <Pressable style={[styles.chip, styles.chipDark]} onPress={() => router.push('/command')}>
          <Text style={styles.chipDarkText}>Full Command Center {'>'}</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 8,
    marginBottom: 24,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 },
      android: { elevation: 2 },
    }),
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  commandPill: {
    backgroundColor: '#111827',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 12,
  },
  commandPillText: { color: '#ffffff', fontSize: 12, fontWeight: 'bold', letterSpacing: 0.5 },
  input: { flex: 1, fontSize: 14, color: Colors.textPrimary, paddingVertical: 8 },
  sendButton: { padding: 8, borderRadius: 20, borderWidth: 1, borderColor: Colors.border, marginLeft: 8 },
  chipScroll: { flexDirection: 'row' },
  chipContent: { alignItems: 'center' },
  chip: {
    backgroundColor: '#f3f4f6', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, marginRight: 8,
  },
  chipText: { color: Colors.textMuted, fontSize: 12 },
  chipDark: { backgroundColor: '#1f2937' },
  chipDarkText: { color: '#ffffff', fontSize: 12, fontWeight: '500' },
});
