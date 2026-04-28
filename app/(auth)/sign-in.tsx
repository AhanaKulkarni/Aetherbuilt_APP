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
import { useSignIn, useSignUp } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';
import { useFactory } from '../../hooks/useFactory';
import { LogIn, Mail, Lock, Eye, EyeOff } from 'lucide-react-native';

export default function SignInScreen() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const { signUp, isLoaded: isSignUpLoaded } = useSignUp();
  const { setBypassAuth, setDemoMode } = useFactory();
  const { theme, isDarkMode } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    if (!isLoaded || !isSignUpLoaded || !signIn || !signUp) {
      setError('Clerk not initialized.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      // 1. HARDCODED DEMO BYPASS (PRIORITY)
      if (email === 'demo@aetherbuilt.com' && password === 'password123') {
        setBypassAuth(true);
        setDemoMode(true);
        router.replace('/(tabs)' as any);
        return;
      }

      // 2. Try to sign in with Clerk
      try {
        const result = await signIn.create({ identifier: email, password });
        if (result.status === 'complete') {
          await setActive({ session: result.createdSessionId });
          router.replace('/(tabs)' as any);
          return;
        }
      } catch (signInErr: any) {
        // 3. Fallback: Auto-create demo account if it doesn't exist
        const isDataNotFound = signInErr?.errors?.some((e: any) => e.code === 'form_identifier_not_found');
        if (email === 'demo@aetherbuilt.com' && isDataNotFound) {
          const signUpRes = await signUp.create({ emailAddress: email, password });
          if (signUpRes.status === 'complete') {
            await setActive({ session: signUpRes.createdSessionId });
            router.replace('/(tabs)' as any);
            return;
          }
        }
        throw signInErr;
      }
    } catch (err: any) {
      const msg = err?.errors?.[0]?.longMessage || err?.message || 'Sign in failed.';
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
        <View style={[styles.logoBox, { backgroundColor: theme.accentBlue, shadowColor: theme.accentBlue }]}>
          <Text style={styles.logoText}>AB</Text>
        </View>
        <Text style={[styles.appName, { color: theme.textPrimary }]}>AetherBuilt OS</Text>
        <Text style={[styles.tagline, { color: theme.textMuted }]}>Factory intelligence at your fingertips</Text>

        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>Welcome back</Text>
          <Text style={[styles.cardSubtitle, { color: theme.textMuted }]}>Sign in to your account</Text>

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

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
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.textHint }]}>PASSWORD</Text>
            <View style={[styles.inputWrapper, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.03)' : '#F8FAFC', borderColor: theme.border }]}>
              <Lock size={16} color={theme.textMuted} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { flex: 1, color: theme.textPrimary }]}
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                secureTextEntry={!showPassword}
              />
              <Pressable onPress={() => setShowPassword(s => !s)} style={styles.eyeBtn}>
                {showPassword ? <EyeOff size={16} color={theme.textMuted} /> : <Eye size={16} color={theme.textMuted} />}
              </Pressable>
            </View>
          </View>

          <Pressable
            style={[styles.btn, { backgroundColor: theme.accentBlue }, loading ? { opacity: 0.7 } : {}]}
            onPress={handleSignIn}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#fff" /> : (
              <>
                <LogIn size={18} color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.btnText}>Sign In</Text>
              </>
            )}
          </Pressable>

          <View style={{ gap: 8, marginTop: 24 }}>
            <Pressable style={styles.demoLogin} onPress={() => { setBypassAuth(true); setDemoMode(true); router.replace('/(tabs)'); }}>
              <Text style={[styles.demoLoginText, { color: theme.textMuted }]}>Preview as Guest (Full Access)</Text>
            </Pressable>
            <Pressable style={styles.demoLogin} onPress={() => { setEmail('demo@aetherbuilt.com'); setPassword('password123'); }}>
              <Text style={[styles.demoLoginText, { color: theme.textMuted }]}>Use Demo Credentials</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingHorizontal: 24 },
  logoBox: { width: 72, height: 72, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  logoText: { color: '#fff', fontSize: 26, fontWeight: '900' },
  appName: { fontSize: 26, fontWeight: '800', marginBottom: 6 },
  tagline: { fontSize: 13, marginBottom: 40 },
  card: { width: '100%', borderRadius: 24, padding: 24, borderWidth: 1 },
  cardTitle: { fontSize: 22, fontWeight: '800', marginBottom: 4 },
  cardSubtitle: { fontSize: 14, marginBottom: 24 },
  errorBox: { backgroundColor: '#fff1f2', borderRadius: 10, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: '#ef4444' },
  errorText: { color: '#ef4444', fontSize: 13, fontWeight: '600' },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 10, fontWeight: '700', letterSpacing: 1.5, marginBottom: 8 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, height: 52 },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, fontWeight: '500' },
  eyeBtn: { padding: 4 },
  btn: { borderRadius: 14, height: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  demoLogin: { alignItems: 'center', padding: 10 },
  demoLoginText: { fontSize: 12, fontWeight: '600', textDecorationLine: 'underline' },
});
