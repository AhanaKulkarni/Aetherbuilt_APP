import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { CheckCircle, AlertTriangle, AlertCircle } from 'lucide-react-native';
import { ToastContext, ToastType } from '../hooks/useToast';
import { Typography, Layout, LightTheme, DarkTheme } from '../theme/tokens';
import { useTheme } from '../hooks/useTheme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<{ message: string; type: ToastType; id: number } | null>(null);
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();

  const showToast = (message: string, type: ToastType = 'success') => {
    setToast({ message, type, id: Date.now() });
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 2500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const getToastColor = (type: ToastType) => {
    switch (type) {
      case 'success': return theme.accentGreen;
      case 'warning': return theme.accentAmber;
      case 'error': return theme.accentRed;
      default: return theme.textPrimary;
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <Animated.View
          key={toast.id}
          entering={FadeInUp}
          exiting={FadeOutUp}
          style={[styles.toastContainer, { backgroundColor: getToastColor(toast.type), top: Math.max(insets.top, 16) + 16 }]}
        >
          {toast.type === 'success' && <CheckCircle color="#fff" size={20} />}
          {toast.type === 'warning' && <AlertTriangle color="#fff" size={20} />}
          {toast.type === 'error' && <AlertCircle color="#fff" size={20} />}
          <Text style={styles.toastText}>{toast.message}</Text>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
}

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute', left: 24, right: 24,
    padding: 16, borderRadius: 12,
    flexDirection: 'row', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 10,
    zIndex: 9999,
  },
  toastText: { color: '#fff', fontSize: 14, fontWeight: '600', marginLeft: 12 },
});
