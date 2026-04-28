import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Typography, Layout, LightTheme, DarkTheme } from '../theme/tokens';
import { useTheme } from '../hooks/useTheme';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';

export default function ProductionLoadCard({ loadPercent = 94.2 }: { loadPercent?: number }) {
  const width = useSharedValue(0);
  const { theme, isDarkMode } = useTheme();

  useEffect(() => {
    width.value = withTiming(loadPercent, {
      duration: 1500,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
  }, [loadPercent]);

  const animatedBarStyle = useAnimatedStyle(() => ({
    width: `${width.value}%`,
  }));

  return (
    <View style={[styles.card, { backgroundColor: isDarkMode ? theme.surface : '#0f172a' }]}>
      <Text style={[styles.title, { color: '#94a3b8' }]}>PRODUCTION LOAD</Text>
      <Text style={[styles.value, { color: '#ffffff' }]}>{loadPercent}%</Text>
      <View style={[styles.barBackground, { backgroundColor: 'rgba(255, 255, 255, 0.1)' }]}>
        <Animated.View style={[styles.barFill, animatedBarStyle, { backgroundColor: theme.accentGreen }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Layout.radius.xl,
    padding: Layout.spacing.xxl,
    marginBottom: Layout.spacing.l,
    ...Layout.shadow,
  },
  title: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 8,
  },
  value: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 20,
  },
  barBackground: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
  },
});
