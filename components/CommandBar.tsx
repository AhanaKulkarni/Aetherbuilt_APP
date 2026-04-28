import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, Pressable, Platform } from 'react-native';
import { Send } from 'lucide-react-native';
import { useCommand } from '../hooks/useCommand';
import { useTheme } from '../hooks/useTheme';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

const CHIPS = [
  'shipment for Tata Motors dispatched', 'how many orders active', 'order 2 started', 
  'machine 1 service done', 'delayed orders', 'dashboard', 'rfq for steel'
];

export default function CommandBar() {
  const [text, setText] = useState('');
  const { executeCommand } = useCommand();
  const { theme, isDarkMode } = useTheme();
  const router = useRouter();

  const handleSend = (cmd: string = text) => {
    if (!cmd.trim()) return;
    executeCommand(cmd);
    setText('');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <View style={styles.inputContainer}>
        <View style={[styles.commandPill, { backgroundColor: theme.textPrimary }]}>
          <Text style={[styles.commandPillText, { color: isDarkMode ? '#000' : '#fff' }]}>⚡ COMMAND</Text>
        </View>
        <TextInput
          style={[styles.input, { color: theme.textPrimary }]}
          placeholder='Try: "order 3 completed", "delayed orders", "machine 2 down"'
          placeholderTextColor={theme.textHint}
          value={text}
          onChangeText={setText}
          onSubmitEditing={() => handleSend()}
          returnKeyType="send"
        />
        <Pressable style={[styles.sendButton, { borderColor: theme.border }]} onPress={() => handleSend()}>
          <Send size={16} color={theme.textMuted} />
        </Pressable>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll} contentContainerStyle={styles.chipContent}>
        {CHIPS.map((chip, idx) => (
          <Pressable key={idx} style={[styles.chip, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#f3f4f6' }]} onPress={() => handleSend(chip)}>
            <Text style={[styles.chipText, { color: theme.textMuted }]}>{chip}</Text>
          </Pressable>
        ))}
        <Pressable style={[styles.chip, styles.chipDark, { backgroundColor: theme.textPrimary }]} onPress={() => router.push('/command')}>
          <Text style={[styles.chipDarkText, { color: isDarkMode ? '#000' : '#fff' }]}>Full Command Center {'>'}</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: 1,
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
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 12,
  },
  commandPillText: { fontSize: 12, fontWeight: 'bold', letterSpacing: 0.5 },
  input: { flex: 1, fontSize: 14, paddingVertical: 8 },
  sendButton: { padding: 8, borderRadius: 20, borderWidth: 1, marginLeft: 8 },
  chipScroll: { flexDirection: 'row' },
  chipContent: { alignItems: 'center' },
  chip: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, marginRight: 8,
  },
  chipText: { fontSize: 12 },
  chipDark: {},
  chipDarkText: { fontSize: 12, fontWeight: '500' },
});
