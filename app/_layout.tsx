import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Stack } from 'expo-router';
import { FactoryProvider, useFactory } from '../hooks/useFactory';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { ToastProvider } from '../components/ToastProvider';
import { Colors } from '../theme/tokens';
import Animated, { FadeOut, FadeInDown, FadeOutUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function AppContent() {
  const [isLoading, setIsLoading] = useState(true);
  const { demoMode } = useFactory();
  const insets = useSafeAreaInsets();

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
          <Animated.View exiting={FadeOut.duration(400)} style={styles.loaderContainer}>
            <View style={styles.logoBox}>
              <Text style={styles.logoText}>AB</Text>
            </View>
            <Text style={styles.appName}>AetherBuilt OS</Text>
            <Text style={styles.loadingText}>Loading factory data...</Text>
          </Animated.View>
        )}
        
        {demoMode && (
          <Animated.View entering={FadeInDown} exiting={FadeOutUp} style={[styles.demoBanner, { paddingTop: Math.max(insets.top, 8) + 8 }]}>
            <Text style={styles.demoBannerText}>DEMO MODE — Data resets on restart</Text>
          </Animated.View>
        )}

        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(drawer)" />
        </Stack>
      </ToastProvider>
    </BottomSheetModalProvider>
  );
}

import { I18nProvider } from '../lib/i18n';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <I18nProvider>
        <FactoryProvider>
          <AppContent />
        </FactoryProvider>
      </I18nProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  loaderContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.sidebarBg,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  logoBox: {
    width: 64, height: 64,
    borderRadius: 16,
    backgroundColor: Colors.accentBlue,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  logoText: { color: '#fff', fontSize: 24, fontWeight: '900', letterSpacing: 2 },
  appName: { fontSize: 24, fontWeight: '700', color: '#fff', marginBottom: 8 },
  loadingText: { fontSize: 14, color: Colors.textHint },
  demoBanner: {
    backgroundColor: Colors.accentAmber,
    paddingBottom: 8,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  demoBannerText: { color: '#fff', fontSize: 12, fontWeight: '700', letterSpacing: 1 },
});
