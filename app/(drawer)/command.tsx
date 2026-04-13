import React from 'react';
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { Colors } from '../../theme/tokens';
import { useFactory } from '../../hooks/useFactory';
import { Terminal, CheckCircle2, XCircle } from 'lucide-react-native';

export default function CommandScreen() {
  const { commandHistory } = useFactory();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Command Log</Text>
        <Text style={styles.subtitle}>History of parsed Natural Language intents</Text>
      </View>

      <FlatList
        data={commandHistory}
        keyExtractor={i => i.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Terminal size={48} color={Colors.textHint} />
            <Text style={styles.emptyTitle}>No commands yet</Text>
            <Text style={styles.emptySubtitle}>Try typing something in the Dashboard command bar.</Text>
          </View>
        )}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.row}>
                {item.success ? (
                  <CheckCircle2 size={16} color={Colors.accentGreen} />
                ) : (
                  <XCircle size={16} color={Colors.accentRed} />
                )}
                <Text style={styles.timestamp}>
                  {new Date(item.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                </Text>
              </View>
            </View>
            <Text style={styles.rawInput}>&quot;{item.rawInput}&quot;</Text>
            <Text style={[styles.message, { color: item.success ? Colors.textMuted : Colors.accentRed }]}>
              {item.message}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { padding: 24, paddingBottom: 16 },
  title: { fontSize: 28, fontWeight: '700', color: Colors.textPrimary },
  subtitle: { fontSize: 14, color: Colors.textMuted, marginTop: 4 },
  listContent: { paddingHorizontal: 24, paddingBottom: 60 },
  card: { backgroundColor: '#fff', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, marginBottom: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center' },
  timestamp: { fontSize: 12, color: Colors.textHint, marginLeft: 6 },
  rawInput: { fontSize: 16, fontWeight: '600', color: Colors.textPrimary, marginBottom: 8 },
  message: { fontSize: 14 },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: Colors.textMuted, marginTop: 16 },
  emptySubtitle: { fontSize: 14, color: Colors.textHint, marginTop: 8 },
});
