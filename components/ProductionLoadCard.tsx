import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Layout } from '../theme/tokens';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';

export default function ProductionLoadCard({ loadPercent = 94.2 }: { loadPercent?: number }) {
  const width = useSharedValue(0);

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
    <View style={styles.card}>
      <Text style={styles.title}>PRODUCTION LOAD</Text>
      <Text style={styles.value}>{loadPercent}%</Text>
      <View style={styles.barBackground}>
        <Animated.View style={[styles.barFill, animatedBarStyle]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.darkCard,
    borderRadius: Layout.radius.xl,
    padding: Layout.spacing.xxl,
    marginBottom: Layout.spacing.l,
    ...Layout.shadow,
  },
  title: {
    ...Typography.label,
    color: '#94a3b8',
    letterSpacing: 2,
    marginBottom: 8,
  },
  value: {
    ...Typography.stat,
    color: '#ffffff',
    marginBottom: 20,
  },
  barBackground: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: Colors.accentGreen,
    borderRadius: 3,
  },
});
