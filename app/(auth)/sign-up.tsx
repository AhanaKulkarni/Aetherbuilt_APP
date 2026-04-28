import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useSignUp } from '@clerk/clerk-expo';
import { useRouter, Link } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Typography, Layout, LightTheme, DarkTheme } from '../../theme/tokens';
import { useTheme } from '../../hooks/useTheme';
import { UserPlus, Mail, Lock, Eye, EyeOff, Building2, KeyRound, Briefcase, Hash } from 'lucide-react-native';

export default function SignUpScreen() {
  const { signUp, setActive, isLoaded } = useSignUp();
  const { theme, isDarkMode } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [step, setStep] = useState<'details' | 'verify'>('details');
  const [role, setRole] = useState<'owner' | 'employee'>('owner');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [factoryName, setFactoryName] = useState('');
  const [employeeCode, setEmployeeCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!isLoaded) return;
    setError('');
    setLoading(true);
    try {
      await signUp.create({
        emailAddress: email,
        password,
        unsafeMetadata: { 
          role, 
          factoryName: role === 'owner' ? factoryName : undefined,
          employeeCode: role === 'employee' ? employeeCode : undefined
        },
      });
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setStep('verify');
    } catch (err: any) {
      const msg = err?.errors?.[0]?.longMessage || err?.message || 'Sign up failed.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!isLoaded) return;
    setError('');
    setLoading(true);
    try {
      const result = await signUp.attemptEmailAddressVerification({ code });
      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        router.replace('/');
      }
    } catch (err: any) {
      const msg = err?.errors?.[0]?.longMessage || err?.message || 'Verification failed.';
      if (msg.includes('already been verified')) {
        router.replace('/');
        return;
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[styles.container, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 40 }]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo */}
        <View style={[styles.logoBox, { backgroundColor: theme.accentGreen, shadowColor: theme.accentGreen }]}>
          <Text style={styles.logoText}>AB</Text>
        </View>
        <Text style={[styles.appName, { color: theme.textPrimary }]}>AetherBuilt OS</Text>
        <Text style={[styles.tagline, { color: theme.textMuted }]}>Factory intelligence at your fingertips</Text>

        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border, shadowColor: theme.textPrimary }]}>
          {step === 'details' ? (
            <>
              <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>Create account</Text>
              <Text style={[styles.cardSubtitle, { color: theme.textMuted }]}>Set up your factory workspace</Text>

              <View style={[styles.roleToggle, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#F1F5F9', borderColor: theme.border }]}>
                <Pressable 
                  style={[styles.roleBtn, role === 'owner' ? { backgroundColor: theme.accentGreen } : {}]} 
                  onPress={() => setRole('owner')}
                >
                  <Briefcase size={16} color={role === 'owner' ? '#fff' : theme.textMuted} />
                  <Text style={[styles.roleBtnText, { color: role === 'owner' ? '#fff' : theme.textMuted }]}>Owner</Text>
                </Pressable>
                <Pressable 
                  style={[styles.roleBtn, role === 'employee' ? { backgroundColor: theme.accentGreen } : {}]} 
                  onPress={() => setRole('employee')}
                >
                  <UserPlus size={16} color={role === 'employee' ? '#fff' : theme.textMuted} />
                  <Text style={[styles.roleBtnText, { color: role === 'employee' ? '#fff' : theme.textMuted }]}>Employee</Text>
                </Pressable>
              </View>

              {error ? (
                <View style={[styles.errorBox, { borderColor: theme.accentRed }]}>
                  <Text style={[styles.errorText, { color: theme.accentRed }]}>{error}</Text>
                </View>
              ) : null}

              {/* Factory Name or Employee Code */}
              {role === 'owner' ? (
                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: theme.textHint }]}>FACTORY NAME</Text>
                  <View style={[styles.inputWrapper, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.03)' : '#F8FAFC', borderColor: theme.border }]}>
                    <Building2 size={16} color={theme.textMuted} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.input, { color: theme.textPrimary }]}
                      value={factoryName}
                      onChangeText={setFactoryName}
                      placeholder="e.g. Sharma Steel Works"
                      placeholderTextColor={theme.textHint}
                    />
                  </View>
                </View>
              ) : (
                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: theme.textHint }]}>EMPLOYEE CODE</Text>
                  <View style={[styles.inputWrapper, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.03)' : '#F8FAFC', borderColor: theme.border }]}>
                    <Hash size={16} color={theme.textMuted} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.input, { color: theme.textPrimary }]}
                      value={employeeCode}
                      onChangeText={setEmployeeCode}
                      placeholder="e.g. FACTORY-XYZ"
                      placeholderTextColor={theme.textHint}
                      autoCapitalize="characters"
                    />
                  </View>
                </View>
              )}

              {/* Email */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.textHint }]}>EMAIL</Text>
                <View style={[styles.inputWrapper, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.03)' : '#F8FAFC', borderColor: theme.border }]}>
                  <Mail size={16} color={theme.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { color: theme.textPrimary }]}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="you@factory.com"
                    placeholderTextColor={theme.textHint}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    autoComplete="email"
                  />
                </View>
              </View>

              {/* Password */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.textHint }]}>PASSWORD</Text>
                <View style={[styles.inputWrapper, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.03)' : '#F8FAFC', borderColor: theme.border }]}>
                  <Lock size={16} color={theme.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { flex: 1, color: theme.textPrimary }]}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Min. 8 characters"
                    placeholderTextColor={theme.textHint}
                    secureTextEntry={!showPassword}
                    autoComplete="new-password"
                  />
                  <Pressable onPress={() => setShowPassword(s => !s)} style={styles.eyeBtn}>
                    {showPassword
                      ? <EyeOff size={16} color={theme.textMuted} />
                      : <Eye size={16} color={theme.textMuted} />}
                  </Pressable>
                </View>
              </View>

              <Pressable
                style={[styles.btn, { backgroundColor: theme.accentGreen, shadowColor: theme.accentGreen }, loading ? { opacity: 0.7 } : {}]}
                onPress={handleSignUp}
                disabled={loading || !isLoaded}
              >
                {loading
                  ? <ActivityIndicator color="#fff" />
                  : (
                    <>
                      <UserPlus size={18} color="#fff" style={{ marginRight: 8 }} />
                      <Text style={styles.btnText}>Create Account</Text>
                    </>
                  )
                }
              </Pressable>

              <View style={styles.divider}>
                <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
                <Text style={[styles.dividerText, { color: theme.textMuted }]}>Already have an account?</Text>
                <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
              </View>

              <Pressable 
                style={[styles.linkBtn, { borderColor: theme.accentGreen }]}
                onPress={() => router.push('/(auth)/sign-in' as any)}
              >
                <Text style={[styles.linkBtnText, { color: theme.accentGreen }]}>Sign In</Text>
              </Pressable>
            </>
          ) : (
            <>
              <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>Verify email</Text>
              <Text style={[styles.cardSubtitle, { color: theme.textMuted }]}>We sent a 6-digit code to {email}</Text>

              {error ? (
                <View style={[styles.errorBox, { borderColor: theme.accentRed }]}>
                  <Text style={[styles.errorText, { color: theme.accentRed }]}>{error}</Text>
                </View>
              ) : null}

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.textHint }]}>VERIFICATION CODE</Text>
                <View style={[styles.inputWrapper, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.03)' : '#F8FAFC', borderColor: theme.border }]}>
                  <KeyRound size={16} color={theme.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { color: theme.textPrimary }]}
                    value={code}
                    onChangeText={setCode}
                    placeholder="123456"
                    placeholderTextColor={theme.textHint}
                    keyboardType="number-pad"
                    maxLength={6}
                  />
                </View>
              </View>

              <Pressable
                style={[styles.btn, { backgroundColor: theme.accentGreen, shadowColor: theme.accentGreen }, loading ? { opacity: 0.7 } : {}]}
                onPress={handleVerify}
                disabled={loading || !isLoaded}
              >
                {loading
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={styles.btnText}>Verify & Enter</Text>
                }
              </Pressable>

              <Pressable style={styles.backBtn} onPress={() => { setStep('details'); setError(''); }}>
                <Text style={[styles.backBtnText, { color: theme.textMuted }]}>← Back</Text>
              </Pressable>
            </>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  logoBox: {
    width: 72,
    height: 72,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 8,
  },
  logoText: { color: '#fff', fontSize: 26, fontWeight: '900', letterSpacing: 2 },
  appName: { fontSize: 26, fontWeight: '800', marginBottom: 6 },
  tagline: { fontSize: 13, marginBottom: 40 },
  card: {
    width: '100%',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 24,
    elevation: 4,
  },
  cardTitle: { fontSize: 22, fontWeight: '800', marginBottom: 4 },
  cardSubtitle: { fontSize: 14, marginBottom: 24 },
  errorBox: {
    backgroundColor: '#fff1f2',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
  },
  errorText: { fontSize: 13, fontWeight: '600' },
  inputGroup: { marginBottom: 16 },
  label: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    height: 52,
  },
  inputIcon: { marginRight: 10 },
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },
  eyeBtn: { padding: 4 },
  btn: {
    borderRadius: 14,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    gap: 10,
  },
  dividerLine: { flex: 1, height: 1 },
  dividerText: { fontSize: 12, fontWeight: '600' },
  linkBtn: {
    borderRadius: 14,
    height: 52,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkBtnText: { fontSize: 16, fontWeight: '700' },
  backBtn: {
    marginTop: 16,
    alignItems: 'center',
  },
  backBtnText: { fontSize: 14, fontWeight: '600' },
  roleToggle: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
    borderWidth: 1,
  },
  roleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  roleBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
