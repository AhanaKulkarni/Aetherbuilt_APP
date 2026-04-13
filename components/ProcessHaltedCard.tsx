import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Layout } from '../theme/tokens';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing, withRepeat, withSequence } from 'react-native-reanimated';

export default function ProcessHaltedCard({ haltPercent = 35 }: { haltPercent?: number }) {
  const width = useSharedValue(0);
  const opacity = useSharedValue(1);

  useEffect(() => {
    width.value = withTiming(haltPercent, {
      duration: 1000,
      easing: Easing.out(Easing.exp),
    });

    opacity.value = withRepeat(
      withSequence(
        withTiming(0.4, { duration: 800 }),
        withTiming(1, { duration: 800 })
      ),
      -1,
      true
    );
  }, [haltPercent]);

  const animatedBarStyle = useAnimatedStyle(() => ({
    width: `${width.value}%`,
  }));

  const animatedDotStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.pill}>
          <Animated.View style={[styles.dot, animatedDotStyle]} />
          <Text style={styles.pillText}>DELAYED</Text>
        </View>
      </View>
      
      <Text style={styles.subtext}>Supply Chain Halt</Text>
      
      <View style={styles.bottomRow}>
        <Text style={styles.title}>PROCESS HALTED</Text>
        <Text style={styles.percentText}>{haltPercent}%</Text>
      </View>

      <View style={styles.barBackground}>
        <Animated.View style={[styles.barFill, animatedBarStyle]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Layout.radius.xl,
    padding: Layout.spacing.xxl,
    marginBottom: Layout.spacing.l,
    ...Layout.shadow,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#fee2e2',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.accentRed,
    marginRight: 6,
  },
  pillText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.accentRed,
    letterSpacing: 1,
  },
  subtext: {
    fontSize: 14,
    fontWeight: '500',
    color: '#b91c1c',
    textAlign: 'right',
    marginBottom: 32,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  title: {
    ...Typography.label,
    color: Colors.textMuted,
  },
  percentText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  barBackground: {
    height: 6,
    backgroundColor: '#f1f5f9',
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: '#ec4899', // pinkish red as per mockup
    borderRadius: 3,
  },
});
