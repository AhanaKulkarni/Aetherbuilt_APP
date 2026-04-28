import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { LightTheme, DarkTheme } from '../theme/tokens';
import { useTheme } from '../hooks/useTheme';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface ActionCardProps {
  title: string;
  subtitle: string;
  onPress: () => void;
  icon: React.ReactNode;
  color?: string;
}

export default function ActionCard({ title, subtitle, onPress, icon, color }: ActionCardProps) {
  const { theme } = useTheme();
  const accentColor = color || theme.accentBlue;

  return (
    <Animated.View entering={FadeInDown}>
      <Pressable style={[styles.container, { backgroundColor: theme.surface, borderColor: theme.border }]} onPress={onPress}>
        <View style={[styles.iconContainer, { backgroundColor: accentColor + '15' }]}>
          {icon}
        </View>
        <View style={styles.content}>
          <Text style={[styles.title, { color: theme.textPrimary }]}>{title}</Text>
          <Text style={[styles.subtitle, { color: theme.textMuted }]}>{subtitle}</Text>
        </View>
        <View style={[styles.btn, { backgroundColor: theme.background }]}>
            <Text style={[styles.btnText, { color: accentColor }]}>TAP</Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 14,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  btn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  btnText: {
    fontSize: 10,
    fontWeight: '900',
  }
});
