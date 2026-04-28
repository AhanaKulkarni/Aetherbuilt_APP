import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Typography, Layout, LightTheme, DarkTheme } from '../theme/tokens';
import { useTheme } from '../hooks/useTheme';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing, withRepeat, withSequence } from 'react-native-reanimated';

export default function ProcessHaltedCard({ haltPercent = 35 }: { haltPercent?: number }) {
  const width = useSharedValue(0);
  const opacity = useSharedValue(1);
  const { theme, isDarkMode } = useTheme();

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
    <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <View style={styles.topRow}>
        <View style={[styles.pill, { backgroundColor: theme.accentRed + '10', borderColor: theme.accentRed + '20' }]}>
          <Animated.View style={[styles.dot, animatedDotStyle, { backgroundColor: theme.accentRed }]} />
          <Text style={[styles.pillText, { color: theme.accentRed }]}>DELAYED</Text>
        </View>
      </View>
      
      <Text style={[styles.subtext, { color: theme.accentRed }]}>Supply Chain Halt</Text>
      
      <View style={styles.bottomRow}>
        <Text style={[styles.title, { color: theme.textMuted }]}>PROCESS HALTED</Text>
        <Text style={[styles.percentText, { color: theme.textMuted }]}>{haltPercent}%</Text>
      </View>

      <View style={[styles.barBackground, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#f1f5f9' }]}>
        <Animated.View style={[styles.barFill, animatedBarStyle, { backgroundColor: '#ec4899' }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Layout.radius.xl,
    padding: Layout.spacing.xxl,
    marginBottom: Layout.spacing.l,
    borderWidth: 1,
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
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  pillText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  subtext: {
    fontSize: 14,
    fontWeight: '500',
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
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  percentText: {
    fontSize: 13,
    fontWeight: '700',
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
