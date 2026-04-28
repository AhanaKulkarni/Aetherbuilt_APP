import React, { useState, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, RefreshControl, ScrollView, Platform, KeyboardAvoidingView } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { useFactory } from '../../hooks/useFactory';
import { useTheme } from '../../hooks/useTheme';
import { Plus, ShoppingCart, FileText, Download, Edit3, CheckCircle2, Search } from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetTextInput, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useToast } from '../../hooks/useToast';

export default function ProcurementScreen() {
  const { rfqs, pos, quotations, addRFQ, addPO, loadData, isDarkMode, updateQuotation } = useFactory();
  const { theme } = useTheme();
  const { showToast } = useToast();
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState<'purchases' | 'rfqs'>('purchases');
  
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const [sheetMode, setSheetMode] = useState<'RFQ' | 'QUOTATION'>('RFQ');
  const [selectedQuotationId, setSelectedQuotationId] = useState<string | null>(null);

  // Form State
  const [draftMaterial, setDraftMaterial] = useState('');
  const [draftQty, setDraftQty] = useState('');

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const openRFQDraft = () => {
    setSheetMode('RFQ');
    bottomSheetRef.current?.present();
  };

  const openQuotation = (qtnId: string) => {
    setSelectedQuotationId(qtnId);
    setSheetMode('QUOTATION');
    bottomSheetRef.current?.present();
  };

  const saveRFQ = () => {
    if (!draftMaterial || !draftQty) {
      showToast('Fill material and quantity', 'error');
      return;
    }
    addRFQ({
      material: draftMaterial,
      quantity: parseInt(draftQty, 10) || 0,
      status: 'Open',
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });
    bottomSheetRef.current?.dismiss();
    setDraftMaterial('');
    setDraftQty('');
    showToast(`RFQ for ${draftMaterial} created`, 'success');
  };

  const currentQuotation = useMemo(() => 
    quotations.find(q => q.id === selectedQuotationId), 
    [selectedQuotationId, quotations]
  );

  const simulateDownload = async () => {
    if (!currentQuotation) return;
    showToast('Starting PDF Generation...', 'success');
    
    // Auto-generate realistic generic RFQ/Quotation details for PDF
    const rfq = rfqs.find(r => r.id === currentQuotation.rfqId);
    const htmlContent = `
      <html>
        <head>
          <style>
            body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 40px; color: #333; }
            h1 { color: #0056b3; font-size: 28px; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #ddd; padding-bottom: 20px; margin-bottom: 30px; }
            .details { margin-bottom: 30px; }
            .table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background-color: #f8f9fa; }
            .footer { margin-top: 50px; font-size: 12px; color: #777; border-top: 1px solid #ddd; padding-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1>AetherBuilt Enterprise</h1>
              <p>Official Supplier Quotation</p>
            </div>
            <div style="text-align: right;">
              <h2>No. ${currentQuotation.id}</h2>
              <p>Date: ${new Date().toLocaleDateString()}</p>
            </div>
          </div>
          <div class="details">
            <h3>Vendor: ${currentQuotation.vendorName}</h3>
            <p>Terms & Conditions: ${currentQuotation.terms}</p>
          </div>
          <table class="table">
            <thead><tr><th>Material Description</th><th>Quantity</th><th>Unit Price (INR)</th><th>Total (INR)</th></tr></thead>
            <tbody>
              <tr>
                <td>${rfq?.material || 'Requested Material'}</td>
                <td>${rfq?.quantity || 0}</td>
                <td>${currentQuotation.price}</td>
                <td>${(rfq?.quantity || 0) * currentQuotation.price}</td>
              </tr>
            </tbody>
          </table>
          <div class="footer">Generated automatically by AetherBuilt OS. This is a computer-generated document.</div>
        </body>
      </html>
    `;

    try {
      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
      showToast('PDF Exported Successfully!', 'success');
    } catch (err) {
      showToast('Failed to generate PDF', 'error');
      console.log(err);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>Procurement</Text>
        <Text style={[styles.subtitle, { color: theme.textMuted }]}>Sourcing & Material Management</Text>
        
        <View style={styles.tabRow}>
          <Pressable 
            style={[styles.tab, tab === 'purchases' ? { backgroundColor: theme.textPrimary } : { backgroundColor: theme.surface, borderColor: theme.border }]} 
            onPress={() => setTab('purchases')}
          >
            <ShoppingCart size={16} color={tab === 'purchases' ? (isDarkMode ? '#000' : '#fff') : theme.textMuted} />
            <Text style={[styles.tabText, { color: tab === 'purchases' ? (isDarkMode ? '#000' : '#fff') : theme.textMuted }]}>Orders</Text>
          </Pressable>
          <Pressable 
            style={[styles.tab, tab === 'rfqs' ? { backgroundColor: theme.textPrimary } : { backgroundColor: theme.surface, borderColor: theme.border }]} 
            onPress={() => setTab('rfqs')}
          >
            <FileText size={16} color={tab === 'rfqs' ? (isDarkMode ? '#000' : '#fff') : theme.textMuted} />
            <Text style={[styles.tabText, { color: tab === 'rfqs' ? (isDarkMode ? '#000' : '#fff') : theme.textMuted }]}>RFQs</Text>
          </Pressable>
        </View>

        <Pressable 
          style={[styles.addBtn, { backgroundColor: theme.accentBlue }]} 
          onPress={openRFQDraft}
        >
          <Plus size={18} color="#fff" />
          <Text style={styles.addBtnText}>New {tab === 'purchases' ? 'Purchase' : 'RFQ'}</Text>
        </Pressable>
      </View>

      <FlatList
        data={tab === 'purchases' ? pos : rfqs}
        keyExtractor={(item: any) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.listContent}
        renderItem={({ item, index }: any) => {
          const isRFQ = tab === 'rfqs';
          const linkedQuotation = isRFQ ? quotations.find(q => q.rfqId === item.id) : null;

          return (
            <Animated.View entering={FadeInUp.delay(index * 50)} style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={[styles.cardLabel, { color: theme.textHint }]}>{isRFQ ? 'REQUEST FOR QUOTE' : 'PURCHASE ORDER'}</Text>
                  <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>{item.material}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: theme.accentBlue + '20' }]}>
                  <Text style={[styles.statusLabel, { color: theme.accentBlue }]}>{item.status}</Text>
                </View>
              </View>

              <View style={styles.statsRow}>
                <View style={styles.stat}>
                  <Text style={[styles.statLabel, { color: theme.textHint }]}>QUANTITY</Text>
                  <Text style={[styles.statValue, { color: theme.textPrimary }]}>{item.qty || item.quantity} units</Text>
                </View>
                <View style={styles.stat}>
                  <Text style={[styles.statLabel, { color: theme.textHint }]}>{isRFQ ? 'DUE DATE' : 'PRICE'}</Text>
                  <Text style={[styles.statValue, { color: theme.textPrimary }]}>{isRFQ ? item.dueDate : `₹${item.qty * item.unitPrice}`}</Text>
                </View>
              </View>

              {isRFQ && linkedQuotation && (
                <Pressable 
                  style={[styles.qtnLink, { backgroundColor: theme.background, borderColor: theme.border }]}
                  onPress={() => openQuotation(linkedQuotation.id)}
                >
                  <CheckCircle2 size={14} color={theme.accentGreen} />
                  <Text style={[styles.qtnLinkText, { color: theme.textPrimary }]}>View Quotation Draft ({linkedQuotation.status})</Text>
                </Pressable>
              )}
            </Animated.View>
          );
        }}
      />

      <BottomSheetModal
        ref={bottomSheetRef}
        snapPoints={sheetMode === 'RFQ' ? ['50%'] : ['75%']}
        enablePanDownToClose
        backdropComponent={(props) => <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.4} />}
        backgroundStyle={{ backgroundColor: theme.surface, borderRadius: 32 }}
      >
        <BottomSheetScrollView contentContainerStyle={styles.sheetContent}>
          {sheetMode === 'RFQ' ? (
            <View>
              <Text style={[styles.sheetTitle, { color: theme.textPrimary }]}>New Sourcing Request</Text>
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.textHint }]}>MATERIAL DESCRIPTION</Text>
                <BottomSheetTextInput style={[styles.input, { backgroundColor: theme.background, borderColor: theme.border, color: theme.textPrimary }]} value={draftMaterial} onChangeText={setDraftMaterial} placeholder="e.g. Aluminum Ingots" />
              </View>
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.textHint }]}>QUANTITY NEEDED</Text>
                <BottomSheetTextInput style={[styles.input, { backgroundColor: theme.background, borderColor: theme.border, color: theme.textPrimary }]} value={draftQty} onChangeText={setDraftQty} keyboardType="number-pad" placeholder="0" />
              </View>
              <TouchableOpacity style={[styles.saveBtn, { backgroundColor: theme.textPrimary }]} onPress={saveRFQ}>
                <Text style={[styles.saveBtnText, { color: isDarkMode ? '#000' : '#fff' }]}>Submit RFQ</Text>
              </TouchableOpacity>
            </View>
          ) : currentQuotation && (
            <View>
              <View style={styles.qtnHeader}>
                <View>
                  <Text style={[styles.qtnLabel, { color: theme.accentBlue }]}>QUOTATION</Text>
                  <Text style={[styles.qtnId, { color: theme.textPrimary }]}>{currentQuotation.id}</Text>
                </View>
                <TouchableOpacity onPress={simulateDownload}>
                   <Download size={24} color={theme.accentBlue} />
                </TouchableOpacity>
              </View>
              
              <View style={[styles.qtnBody, { backgroundColor: theme.background, borderColor: theme.border }]}>
                <View style={styles.qtnField}>
                   <Text style={[styles.label, { color: theme.textHint }]}>VENDOR</Text>
                   <BottomSheetTextInput 
                     style={[styles.qtnInput, { color: theme.textPrimary }]} 
                     value={currentQuotation.vendorName} 
                     onChangeText={(txt) => updateQuotation(currentQuotation.id, { vendorName: txt })}
                   />
                </View>
                <View style={styles.qtnField}>
                   <Text style={[styles.label, { color: theme.textHint }]}>PRICE OFFERED (INR)</Text>
                   <BottomSheetTextInput 
                     style={[styles.qtnInput, { color: theme.textPrimary }]} 
                     value={currentQuotation.price.toString()} 
                     onChangeText={(txt) => updateQuotation(currentQuotation.id, { price: parseInt(txt, 10) || 0 })}
                     keyboardType="number-pad"
                   />
                </View>
                <View style={styles.qtnField}>
                   <Text style={[styles.label, { color: theme.textHint }]}>TERMS & CONDITIONS</Text>
                   <BottomSheetTextInput 
                     style={[styles.qtnInput, { color: theme.textPrimary }]} 
                     value={currentQuotation.terms} 
                     onChangeText={(txt) => updateQuotation(currentQuotation.id, { terms: txt })}
                     multiline
                   />
                </View>
              </View>

              <TouchableOpacity style={[styles.saveBtn, { backgroundColor: theme.accentGreen }]} onPress={() => bottomSheetRef.current?.dismiss()}>
                <Text style={[styles.saveBtnText, { color: '#fff' }]}>Finalize & Send</Text>
              </TouchableOpacity>
            </View>
          )}
        </BottomSheetScrollView>
      </BottomSheetModal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 24, paddingTop: 32 },
  title: { fontSize: 28, fontWeight: '800' },
  subtitle: { fontSize: 13, marginTop: 4, marginBottom: 24 },
  
  tabRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 12, borderWidth: 1, gap: 8 },
  tabText: { fontSize: 13, fontWeight: '700' },
  
  addBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 14, gap: 10 },
  addBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  
  listContent: { padding: 20, paddingTop: 0 },
  card: { borderRadius: 20, padding: 20, marginBottom: 16, borderWidth: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  cardLabel: { fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  cardTitle: { fontSize: 18, fontWeight: '800', marginTop: 4 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusLabel: { fontSize: 9, fontWeight: '800' },
  
  statsRow: { flexDirection: 'row', gap: 24, marginBottom: 16 },
  stat: { flex: 1 },
  statLabel: { fontSize: 9, fontWeight: '800', letterSpacing: 0.5, marginBottom: 4 },
  statValue: { fontSize: 15, fontWeight: '700' },
  
  qtnLink: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderRadius: 12, borderWidth: 1 },
  qtnLinkText: { fontSize: 12, fontWeight: '700' },

  sheetContent: { padding: 24 },
  sheetTitle: { fontSize: 22, fontWeight: '800', marginBottom: 24 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 10, fontWeight: '800', letterSpacing: 1, marginBottom: 8 },
  input: { borderWidth: 1, borderRadius: 12, padding: 14, fontSize: 15 },
  saveBtn: { paddingVertical: 16, borderRadius: 16, alignItems: 'center', marginTop: 12 },
  saveBtnText: { fontSize: 16, fontWeight: '700' },

  qtnHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  qtnLabel: { fontSize: 12, fontWeight: '800' },
  qtnId: { fontSize: 24, fontWeight: '800' },
  qtnBody: { padding: 20, borderRadius: 20, borderWidth: 1, marginBottom: 20 },
  qtnField: { marginBottom: 20 },
  qtnInput: { fontSize: 16, fontWeight: '600', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.1)' },
});
