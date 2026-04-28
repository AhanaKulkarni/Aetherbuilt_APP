import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFactory } from '../hooks/useFactory';
import { useTheme } from '../hooks/useTheme';
import { useRouter } from 'expo-router';
import { LogOut, Menu, Moon, Sun } from 'lucide-react-native';

interface TopHeaderProps {
  onMenuPress?: () => void;
}

export default function TopHeader({ onMenuPress }: TopHeaderProps) {
  const insets = useSafeAreaInsets();
  const { toggleDarkMode, isDarkMode } = useFactory();
  const { theme } = useTheme();
  const router = useRouter();

  const handleSignOut = async () => {
    // router.replace('/(auth)/sign-in' as any);
  };

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 16), backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
      <View style={styles.leftRow}>
        <Pressable onPress={onMenuPress} style={styles.menuBtn} hitSlop={12}>
          <Menu size={20} color={theme.textPrimary} />
        </Pressable>
        <Text style={[styles.logo, { color: theme.textPrimary }]}>AETHERBUILT</Text>
      </View>
      <View style={styles.rightRow}>
        <Pressable onPress={toggleDarkMode} style={styles.themeBtn} hitSlop={8}>
          {isDarkMode ? <Sun size={18} color={theme.accentAmber} /> : <Moon size={18} color={theme.textMuted} />}
        </Pressable>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>A</Text>
        </View>
        <Pressable onPress={handleSignOut} style={styles.signOutBtn} hitSlop={8}>
          <LogOut size={16} color={theme.textMuted} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    zIndex: 100,
    borderBottomWidth: 1,
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuBtn: {
    padding: 4,
  },
  logo: {
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 2,
  },
  rightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#38bdf8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
  },
  themeBtn: {
    padding: 4,
  },
  signOutBtn: {
    padding: 4,
  },
});
