import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, Pressable, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Typography, Layout } from '../../theme/tokens';
import { useFactory } from '../../hooks/useFactory';
import { useTheme } from '../../hooks/useTheme';
import { useCommand } from '../../hooks/useCommand';
import { MessageSquare, Send, Bot, User, Package, Zap, Truck, Users, ShoppingBag, Activity } from 'lucide-react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { parseCommand } from '../../lib/parser';

const SUGGESTIONS = [
  'show orders', 
  'machine status', 
  'procurement summary',
  'summary'
];

export default function QuickCommandScreen() {
  const [text, setText] = useState('');
  const [messages, setMessages] = useState<any[]>([
    { role: 'bot', content: 'AetherBuilt OS Quick Command ready. Type "show orders" or "summary" to begin.', timestamp: new Date() }
  ]);
  
  const { orders, machines, shipments, pos, vendors, rfqs } = useFactory();
  const { theme, isDarkMode } = useTheme();
  const { executeCommand } = useCommand();
  const flatListRef = useRef<FlatList>(null);

  const handleSend = (cmd: string = text) => {
    if (!cmd.trim()) return;
    
    const userMsg = { role: 'user', content: cmd, timestamp: new Date() };
    setMessages(prev => [userMsg, ...prev]);
    setText('');

    // Execute
    setTimeout(() => {
      const context = { orders, machines, shipments, pos, vendors, rfqs };
      const result = parseCommand(cmd, context);
      
      const botMsg: any = { 
        role: 'bot', 
        content: result.message, 
        timestamp: new Date(),
        action: result.action,
        payload: result.payload
      };

      setMessages(prev => [botMsg, ...prev]);
      executeCommand(cmd); 
    }, 400);
  };

  const renderWidget = (payload: any) => {
    if (!payload) return null;

    switch (payload.type) {
      case 'ORDERS_DASHBOARD':
        return (
          <View style={styles.widget}>
            <View style={styles.widgetHeader}>
              <Package size={16} color={theme.accentBlue} />
              <Text style={[styles.widgetTitle, { color: theme.textPrimary }]}>Order Dashboard</Text>
            </View>
            {payload.data.slice(0, 3).map((o: any) => (
              <View key={o.id} style={styles.widgetRow}>
                <Text style={[styles.widgetCellMain, { color: theme.textPrimary }]}>{o.client}</Text>
                <Text style={[styles.widgetCellSub, { color: theme.textMuted }]}>{o.progress}%</Text>
              </View>
            ))}
          </View>
        );
      case 'MACHINES_DASHBOARD':
        return (
          <View style={styles.widget}>
            <View style={styles.widgetHeader}>
              <Zap size={16} color={theme.accentAmber} />
              <Text style={[styles.widgetTitle, { color: theme.textPrimary }]}>Machine Status</Text>
            </View>
            {payload.data.map((m: any) => (
              <View key={m.id} style={styles.widgetRow}>
                <Text style={[styles.widgetCellMain, { color: theme.textPrimary }]}>{m.name}</Text>
                <View style={[styles.statusDot, { backgroundColor: m.status === 'Running' ? theme.accentGreen : theme.accentRed }]} />
              </View>
            ))}
          </View>
        );
      case 'VENDORS_DASHBOARD':
        return (
          <View style={styles.widget}>
            <View style={styles.widgetHeader}>
              <Users size={16} color={theme.accentBlue} />
              <Text style={[styles.widgetTitle, { color: theme.textPrimary }]}>Vendor Reliability</Text>
            </View>
            {payload.data.slice(0, 3).map((v: any) => (
              <View key={v.id} style={styles.widgetRow}>
                <Text style={[styles.widgetCellMain, { color: theme.textPrimary }]}>{v.name}</Text>
                <Text style={[styles.widgetCellSub, { color: theme.accentGreen }]}>{v.reliability}%</Text>
              </View>
            ))}
          </View>
        );
      case 'GLOBAL_DASHBOARD':
        return (
          <View style={styles.widget}>
            <View style={styles.widgetHeader}>
              <Activity size={16} color={theme.accentBlue} />
              <Text style={[styles.widgetTitle, { color: theme.textPrimary }]}>System Overview</Text>
            </View>
            <View style={styles.widgetRow}>
               <Text style={[styles.widgetCellMain, { color: theme.textPrimary }]}>Active Orders</Text>
               <Text style={[styles.widgetCellSub, { color: theme.textPrimary }]}>{payload.data.orders.length}</Text>
            </View>
            <View style={styles.widgetRow}>
               <Text style={[styles.widgetCellMain, { color: theme.textPrimary }]}>Machines Down</Text>
               <Text style={[styles.widgetCellSub, { color: theme.accentRed }]}>{payload.data.machines.filter((m: any) => m.status === 'Down').length}</Text>
            </View>
            <View style={styles.widgetRow}>
               <Text style={[styles.widgetCellMain, { color: theme.textPrimary }]}>Deliveries Today</Text>
               <Text style={[styles.widgetCellSub, { color: theme.accentBlue }]}>{payload.data.shipments.length}</Text>
            </View>
          </View>
        );
      case 'PROCUREMENT_DASHBOARD':
        return (
          <View style={styles.widget}>
            <View style={styles.widgetHeader}>
              <ShoppingBag size={16} color={theme.accentBlue} />
              <Text style={[styles.widgetTitle, { color: theme.textPrimary }]}>Procurement Summary</Text>
            </View>
            <Text style={{ color: theme.textMuted, fontSize: 12 }}>Open POs: {payload.data.pos.length}</Text>
            <Text style={{ color: theme.textMuted, fontSize: 12 }}>Pending RFQs: {payload.data.rfqs.length}</Text>
          </View>
        );
      default:
        return null;
    }
  };

  const renderMessage = ({ item }: { item: any }) => {
    const isUser = item.role === 'user';
    
    return (
      <Animated.View entering={FadeIn} style={isUser ? styles.userBubbleContainer : styles.botBubbleContainer}>
        {!isUser && (
          <View style={[styles.botAvatar, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#f1f5f9' }]}>
            <Bot size={16} color={theme.accentBlue} />
          </View>
        )}
        
        <View style={[
          isUser ? styles.userBubble : styles.botBubble,
          { 
            backgroundColor: isUser ? theme.accentBlue : theme.surface,
            borderColor: theme.border
          }
        ]}>
          <Text style={isUser ? styles.userBubbleText : [styles.botBubbleText, { color: theme.textPrimary }]}>
            {item.content}
          </Text>
          {item.payload && renderWidget(item.payload)}
        </View>

        {isUser && (
          <View style={[styles.userAvatar, { backgroundColor: theme.textPrimary }]}>
            <User size={16} color={isDarkMode ? '#000' : '#fff'} />
          </View>
        )}
      </Animated.View>
    );
  };

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: theme.background }]} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>Quick Command</Text>
        <Text style={[styles.subtitle, { color: theme.textMuted }]}>Real-time factory intelligence</Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={styles.listContent}
        inverted={true}
        ListFooterComponent={() => (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
            {SUGGESTIONS.map((chip, idx) => (
              <Pressable 
                key={idx} 
                style={[styles.chip, { backgroundColor: theme.surface, borderColor: theme.border }]} 
                onPress={() => handleSend(chip)}
              >
                <Text style={[styles.chipText, { color: theme.textPrimary }]}>{chip}</Text>
              </Pressable>
            ))}
          </ScrollView>
        )}
      />

      <View style={[styles.inputOuter, { backgroundColor: theme.surface, borderTopColor: theme.border }]}>
        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, { backgroundColor: theme.background, borderColor: theme.border, color: theme.textPrimary }]}
            placeholder="Type a command..."
            placeholderTextColor={theme.textHint}
            value={text}
            onChangeText={setText}
            onSubmitEditing={() => handleSend()}
          />
          <Pressable 
            style={[styles.sendBtn, { backgroundColor: text.trim() ? theme.accentBlue : theme.textHint }]} 
            onPress={() => handleSend()}
            disabled={!text.trim()}
          >
            <Send size={20} color="#fff" />
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 24, paddingBottom: 8 },
  title: { fontSize: 24, fontWeight: '800' },
  subtitle: { fontSize: 13, marginTop: 4 },
  chipScroll: { marginBottom: 20 },
  chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, marginRight: 8 },
  chipText: { fontSize: 12, fontWeight: '600' },
  listContent: { paddingHorizontal: 16, paddingBottom: 24 },
  userBubbleContainer: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'flex-end', marginBottom: 20 },
  userBubble: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 20, borderBottomRightRadius: 4, maxWidth: '80%' },
  userBubbleText: { color: '#ffffff', fontSize: 15, fontWeight: '500' },
  userAvatar: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginLeft: 8 },
  botBubbleContainer: { flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start', marginBottom: 20 },
  botBubble: { paddingHorizontal: 16, paddingVertical: 16, borderRadius: 20, borderTopLeftRadius: 4, maxWidth: '85%', borderWidth: 1 },
  botAvatar: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  botBubbleText: { fontSize: 15, lineHeight: 22, fontWeight: '500' },
  widget: { marginTop: 16, padding: 16, borderRadius: 16, backgroundColor: 'rgba(0,0,0,0.02)', borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)', width: 260 },
  widgetHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  widgetTitle: { fontSize: 13, fontWeight: '800', letterSpacing: 0.5 },
  widgetRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  widgetCellMain: { fontSize: 12, fontWeight: '600' },
  widgetCellSub: { fontSize: 11, fontWeight: '700' },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  inputOuter: { padding: 16, borderTopWidth: 1 },
  inputContainer: { flexDirection: 'row', alignItems: 'center' },
  input: { flex: 1, height: 52, borderWidth: 1, borderRadius: 16, paddingHorizontal: 16, fontSize: 15 },
  sendBtn: { width: 52, height: 52, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginLeft: 8 },
});
