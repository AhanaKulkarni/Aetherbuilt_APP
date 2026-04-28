import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Platform, TextInput } from 'react-native';

// --- POLYFILL FOR GORHOM BOTTOM SHEET ON WEB ---
if (Platform.OS === 'web') {
  if (!(TextInput as any).State) (TextInput as any).State = {};
  (TextInput as any).State.currentlyFocusedInput = (TextInput as any).State.currentlyFocusedInput || (() => null);
  
  if (!(TextInput as any).default) (TextInput as any).default = TextInput;
  if (!(TextInput as any).default.State) (TextInput as any).default.State = {};
  (TextInput as any).default.State.currentlyFocusedInput = () => null;
}
// -----------------------------------------------
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Stack } from 'expo-router';
import { FactoryProvider, useFactory } from '../hooks/useFactory';
import { useTheme } from '../hooks/useTheme';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { ToastProvider } from '../components/ToastProvider';
import { Typography, Layout, LightTheme, DarkTheme } from '../theme/tokens';
import Animated, { FadeOut, FadeInDown, FadeOutUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ClerkProvider, useAuth } from '@clerk/clerk-expo';
import { Redirect } from 'expo-router';
import { tokenCache } from '../lib/cache';

const CLERK_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ?? '';

function AppContent() {
  const [isLoading, setIsLoading] = useState(true);
  const { demoMode, bypassAuth } = useFactory();
  const { theme, isDarkMode } = useTheme();
  const insets = useSafeAreaInsets();
  const { isLoaded, isSignedIn } = useAuth();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <BottomSheetModalProvider>
      <ToastProvider>
        {isLoading && (
          <Animated.View exiting={FadeOut.duration(400)} style={[styles.loaderContainer, { backgroundColor: theme.background }]}>
            <View style={[styles.logoBox, { backgroundColor: theme.accentBlue, shadowColor: theme.accentBlue }]}>
              <Text style={styles.logoText}>AB</Text>
            </View>
            <Text style={[styles.appName, { color: theme.textPrimary }]}>AetherBuilt OS</Text>
            <Text style={[styles.loadingText, { color: theme.textMuted }]}>Loading factory data...</Text>
          </Animated.View>
        )}
        
        {demoMode && (
          <Animated.View entering={FadeInDown} exiting={FadeOutUp} style={[styles.demoBanner, { paddingTop: Math.max(insets.top, 8) + 8, backgroundColor: theme.accentAmber }]}>
            <Text style={styles.demoBannerText}>DEMO MODE — Data resets on restart</Text>
          </Animated.View>
        )}

        <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="(auth)" />
        </Stack>
        {/* Auth guard: redirect once Clerk has loaded */}
        {isLoaded && !isSignedIn && !bypassAuth && <Redirect href={'/(auth)/sign-in' as any} />}
      </ToastProvider>
    </BottomSheetModalProvider>
  );
}

import { I18nProvider } from '../lib/i18n';

export default function RootLayout() {
  return (
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY} tokenCache={tokenCache}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <I18nProvider>
          <FactoryProvider>
            <AppContent />
          </FactoryProvider>
        </I18nProvider>
      </GestureHandlerRootView>
    </ClerkProvider>
  );
}

const styles = StyleSheet.create({
  loaderContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  logoBox: {
    width: 64, height: 64,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  logoText: { color: '#fff', fontSize: 24, fontWeight: '900', letterSpacing: 2 },
  appName: { fontSize: 24, fontWeight: '700', marginBottom: 8 },
  loadingText: { fontSize: 14 },
  demoBanner: {
    paddingBottom: 8,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  demoBannerText: { color: '#fff', fontSize: 12, fontWeight: '700', letterSpacing: 1 },
});
