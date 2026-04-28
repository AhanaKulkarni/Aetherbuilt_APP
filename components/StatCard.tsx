import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { Typography, Layout, LightTheme, DarkTheme } from '../theme/tokens';
import { useTheme } from '../hooks/useTheme';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  color: string;
  icon: React.ReactNode;
  flex?: number;
}

export default function StatCard({ title, value, subtitle, color, icon, flex = 1 }: StatCardProps) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  return (
    <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut} style={{ flex }}>
      <Animated.View style={[styles.card, animatedStyle, { 
        backgroundColor: theme.surface, 
        borderColor: theme.border, 
        borderLeftColor: color 
      }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.textMuted }]}>{title}</Text>
          <View style={styles.iconBox}>
            {icon}
          </View>
        </View>
        <Text style={[styles.value, { color: theme.textPrimary }]} numberOfLines={1} adjustsFontSizeToFit>
          {value}
        </Text>
        <Text style={[styles.subtitle, { color: theme.textMuted }]}>{subtitle}</Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Layout.radius.m,
    padding: 16,
    marginBottom: Layout.spacing.m,
    borderWidth: 1,
    borderLeftWidth: 4,
    ...Layout.shadow,
    elevation: 2,
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  iconBox: {
    opacity: 0.9,
  },
  value: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '500',
  },
});
