import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { Colors, Typography, Layout } from '../theme/tokens';
import { useI18n } from '../lib/i18n';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  color: string;
  icon: React.ReactNode;
  flex?: number;
}

export default function StatCard({ title, value, subtitle, color, icon, flex = 1 }: StatCardProps) {
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
      <Animated.View style={[styles.card, animatedStyle]}>
        <View style={styles.header}>
          <View style={[styles.iconBox, { backgroundColor: `${color}15` }]}>
            {icon}
          </View>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
        <Text style={styles.value} numberOfLines={1} adjustsFontSizeToFit>
          {value}
        </Text>
        <Text style={styles.title}>{title}</Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Layout.radius.l,
    padding: Layout.spacing.xl,
    marginBottom: Layout.spacing.l,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Layout.shadow,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  iconBox: {
    padding: 8,
    borderRadius: 12,
  },
  title: {
    ...Typography.label,
    color: '#334155', // slightly darker for better contrast
    marginTop: 4,
  },
  value: {
    ...Typography.stat,
    color: Colors.textPrimary,
  },
  subtitle: {
    ...Typography.label,
    color: Colors.textHint,
  },
});
