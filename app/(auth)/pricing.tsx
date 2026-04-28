import React, { useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import { Typography, Layout, LightTheme, DarkTheme } from '../../theme/tokens';
import { useTheme } from '../../hooks/useTheme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ShieldCheck, CheckCircle2, ChevronRight, CreditCard, Factory } from 'lucide-react-native';
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import { useUser } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';

interface Plan {
  id: string;
  name: string;
  price: string;
  period: string;
  employees: string;
  forWhom: string;
  value: string;
  colorKey: keyof typeof LightTheme;
}

const PLANS: Plan[] = [
  {
    id: 'GO',
    name: 'GO PLAN',
    price: '₹999',
    period: '/month',
    employees: '2–10 employees',
    forWhom: 'Early-stage factories',
    value: 'Replace Excel + WhatsApp chaos',
    colorKey: 'accentBlue',
  },
  {
    id: 'PRO',
    name: 'PRO PLAN',
    price: '₹2,499',
    period: '/month',
    employees: '11–50 employees',
    forWhom: 'Growing MSMEs',
    value: 'Save time + reduce operational friction',
    colorKey: 'accentGreen',
  },
  {
    id: 'PREMIUM',
    name: 'PREMIUM PLAN',
    price: '₹6,999',
    period: '/month',
    employees: '51–100 employees',
    forWhom: 'Scaling factories',
    value: 'Data-driven decision making',
    colorKey: 'accentPurple',
  },
  {
    id: 'ENTERPRISE',
    name: 'ENTERPRISE PLAN',
    price: '₹50,000+',
    period: '/month',
    employees: '100+ employees',
    forWhom: 'Large manufacturers',
    value: 'Full operational automation',
    colorKey: 'accentAmber',
  },
];

export default function PricingScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useUser();
  const { theme, isDarkMode } = useTheme();
  const router = useRouter();
  const bottomSheetRef = useRef<BottomSheetModal>(null);

  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  const handleSelectPlan = (plan: Plan) => {
    setSelectedPlan(plan);
    bottomSheetRef.current?.present();
  };

  const handlePayment = async () => {
    if (!selectedPlan || !user) return;
    setLoading(true);
    
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      await user.update({
        unsafeMetadata: {
          ...user.unsafeMetadata,
          role: 'owner',
          plan: selectedPlan.id,
        }
      });
      bottomSheetRef.current?.dismiss();
      router.replace('/');
    } catch (err) {
      console.error("Failed to update user plan", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background, paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Select Your Plan</Text>
        <Text style={[styles.headerSubtitle, { color: theme.textMuted }]}>Upgrade your factory OS</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {PLANS.map((plan) => {
          const planColor = theme[plan.colorKey] as string;
          return (
            <Pressable 
              key={plan.id} 
              style={[styles.planCard, { backgroundColor: theme.surface, borderColor: planColor + '40' }]} 
              onPress={() => handleSelectPlan(plan)}
            >
              <View style={[styles.planHeader, { backgroundColor: planColor + '15' }]}>
                <View style={[styles.iconBox, { backgroundColor: planColor }]}>
                  <Factory size={20} color="#fff" />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={[styles.planName, { color: theme.textPrimary }]}>{plan.name}</Text>
                  <Text style={[styles.planForWhom, { color: theme.textMuted }]}>{plan.forWhom}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={[styles.planPrice, { color: planColor }]}>{plan.price}</Text>
                  <Text style={[styles.planPeriod, { color: theme.textMuted }]}>{plan.period}</Text>
                </View>
              </View>
              
              <View style={styles.planBody}>
                <View style={styles.featureRow}>
                  <CheckCircle2 size={16} color={theme.textHint} />
                  <Text style={[styles.featureText, { color: theme.textPrimary }]}>{plan.employees}</Text>
                </View>
                <View style={styles.featureRow}>
                  <CheckCircle2 size={16} color={theme.textHint} />
                  <Text style={[styles.featureText, { color: theme.textPrimary }]}>{plan.value}</Text>
                </View>
              </View>
              
              <View style={[styles.selectBtn, { backgroundColor: planColor }]}>
                <Text style={styles.selectBtnText}>Select {plan.name}</Text>
                <ChevronRight size={18} color="#fff" />
              </View>
            </Pressable>
          );
        })}
      </ScrollView>

      <BottomSheetModal
        ref={bottomSheetRef}
        snapPoints={['55%']}
        enablePanDownToClose
        backdropComponent={(props) => (
          <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.7} />
        )}
        backgroundStyle={{ backgroundColor: theme.surface, borderRadius: 24 }}
        handleIndicatorStyle={{ backgroundColor: theme.textHint, width: 40 }}
      >
        <BottomSheetView style={styles.sheetContent}>
          {selectedPlan && (
            <>
              <View style={styles.paymentHeader}>
                <View style={[styles.secureBadge, { backgroundColor: theme.accentGreen + '15' }]}>
                  <ShieldCheck size={14} color={theme.accentGreen} />
                  <Text style={[styles.secureText, { color: theme.accentGreen }]}>Secure Payment</Text>
                </View>
                <Text style={[styles.paymentAmount, { color: theme.textPrimary }]}>{selectedPlan.price}</Text>
                <Text style={[styles.paymentPlan, { color: theme.textHint }]}>{selectedPlan.name}</Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.textHint }]}>CARD NUMBER</Text>
                <View style={[styles.inputWrapper, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.03)' : '#F8FAFC', borderColor: theme.border }]}>
                  <CreditCard size={18} color={theme.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { color: theme.textPrimary }]}
                    placeholder="0000 0000 0000 0000"
                    placeholderTextColor={theme.textHint}
                    keyboardType="number-pad"
                    value={cardNumber}
                    onChangeText={setCardNumber}
                    maxLength={19}
                  />
                </View>
              </View>

              <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 16 }]}>
                  <Text style={[styles.label, { color: theme.textHint }]}>EXPIRY</Text>
                  <View style={[styles.inputWrapper, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.03)' : '#F8FAFC', borderColor: theme.border }]}>
                    <TextInput
                      style={[styles.input, { color: theme.textPrimary }]}
                      placeholder="MM/YY"
                      placeholderTextColor={theme.textHint}
                      keyboardType="number-pad"
                      value={expiry}
                      onChangeText={setExpiry}
                      maxLength={5}
                    />
                  </View>
                </View>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={[styles.label, { color: theme.textHint }]}>CVV</Text>
                  <View style={[styles.inputWrapper, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.03)' : '#F8FAFC', borderColor: theme.border }]}>
                    <TextInput
                      style={[styles.input, { color: theme.textPrimary }]}
                      placeholder="123"
                      placeholderTextColor={theme.textHint}
                      keyboardType="number-pad"
                      secureTextEntry
                      value={cvv}
                      onChangeText={setCvv}
                      maxLength={3}
                    />
                  </View>
                </View>
              </View>

              <Pressable 
                style={[styles.payBtn, { backgroundColor: theme[selectedPlan.colorKey] as string, opacity: loading ? 0.7 : 1 }]} 
                onPress={handlePayment}
                disabled={loading}
              >
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.payBtnText}>Pay & Activate</Text>}
              </Pressable>
            </>
          )}
        </BottomSheetView>
      </BottomSheetModal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 24, paddingBottom: 16 },
  headerTitle: { fontSize: 28, fontWeight: '800', marginBottom: 4 },
  headerSubtitle: { fontSize: 14 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40, gap: 16 },
  
  planCard: {
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  planHeader: {
    flexDirection: 'row',
    padding: 20,
    alignItems: 'center',
  },
  iconBox: {
    width: 44, height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  planName: { fontSize: 16, fontWeight: '800', marginBottom: 2 },
  planForWhom: { fontSize: 12, fontWeight: '500' },
  planPrice: { fontSize: 24, fontWeight: '900' },
  planPeriod: { fontSize: 11, fontWeight: '600', marginTop: -2 },
  planBody: { padding: 20, gap: 12 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  featureText: { fontSize: 14, fontWeight: '500', flex: 1 },
  selectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  selectBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  
  sheetContent: { padding: 24, flex: 1 },
  paymentHeader: { alignItems: 'center', marginBottom: 24 },
  secureBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginBottom: 12 },
  secureText: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  paymentAmount: { fontSize: 32, fontWeight: '900', marginBottom: 4 },
  paymentPlan: { fontSize: 13, fontWeight: '600' },
  
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 10, fontWeight: '700', letterSpacing: 1.5, marginBottom: 8 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, height: 52 },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, fontWeight: '500' },
  row: { flexDirection: 'row' },
  
  payBtn: { height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginTop: 12 },
  payBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' }
});
