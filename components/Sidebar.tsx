import React from 'react';
import { View, Text, StyleSheet, Pressable, Switch, Platform } from 'react-native';
import { DrawerContentComponentProps } from '@react-navigation/drawer';
import { Colors, Typography, Layout } from '../theme/tokens';
import { Grid, Package, Truck, PenTool, Users, ShoppingCart, Terminal, Settings, Globe } from 'lucide-react-native';
import { useFactory } from '../hooks/useFactory';
import { useI18n } from '../lib/i18n';

const MENU_ITEMS = [
  { name: 'dashboard', labelKey: 'dashboard', icon: Grid },
  { name: 'orders', labelKey: 'orders', icon: Package },
  { name: 'shipments', labelKey: 'shipments', icon: Truck },
  { name: 'machines', labelKey: 'machines', icon: PenTool },
  { name: 'vendors', labelKey: 'vendors', icon: Users },
  { name: 'procurement', labelKey: 'procurement', icon: ShoppingCart },
  { name: 'command', labelKey: 'command', icon: Terminal },
];

export default function Sidebar(props: DrawerContentComponentProps) {
  const { state, navigation } = props;
  const currentRouteName = state.routeNames[state.index];
  const { demoMode, setDemoMode } = useFactory();
  const { t, locale, setLocale } = useI18n();

  const cycleLanguage = () => {
    if (locale === 'en') setLocale('hi');
    else if (locale === 'hi') setLocale('mr');
    else setLocale('en');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>AETHERBUILT OS</Text>
        <Text style={styles.subtitle}>{t('controlRoom')}</Text>
      </View>

      <View style={styles.menuItems}>
        {MENU_ITEMS.map((item) => {
          const isActive = currentRouteName === item.name;
          const IconInfo = item.icon;
          return (
            <Pressable
              key={item.name}
              style={[styles.menuItem, isActive && styles.menuItemActive]}
              onPress={() => navigation.navigate(item.name)}
            >
              <IconInfo size={20} color={isActive ? Colors.accentBlue : Colors.textMuted} style={styles.icon} />
              <Text style={[styles.menuText, isActive && styles.menuTextActive]}>
                {t(item.labelKey as any)}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.footer}>
        <Pressable style={styles.demoRow} onPress={cycleLanguage}>
          <Globe size={18} color={Colors.textHint} />
          <Text style={styles.demoText}>{t('language')}</Text>
          <Text style={styles.langValue}>{locale.toUpperCase()}</Text>
        </Pressable>
        <View style={styles.demoRow}>
          <Settings size={18} color={Colors.textHint} />
          <Text style={styles.demoText}>{t('demoMode')}</Text>
          <Switch 
            value={demoMode} 
            onValueChange={setDemoMode} 
            trackColor={{ false: '#334155', true: Colors.accentBlue }}
          />
        </View>
        <View style={styles.statusRow}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>{t('systemOnline')}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.sidebarBg, padding: Layout.spacing.l, paddingTop: 60 },
  header: { marginBottom: 40, paddingHorizontal: 12 },
  title: { color: Colors.surface, fontSize: 18, fontWeight: '800', letterSpacing: 0.5 },
  subtitle: { color: Colors.textHint, fontSize: 13, marginTop: 4, fontWeight: '500' },
  menuItems: { flex: 1 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16, borderRadius: Layout.radius.m, marginBottom: 8 },
  menuItemActive: { backgroundColor: Colors.sidebarActive },
  icon: { marginRight: 16 },
  menuText: { color: Colors.textMuted, fontSize: 15, fontWeight: '600' },
  menuTextActive: { color: Colors.accentBlue },
  footer: { paddingHorizontal: 12, paddingBottom: 30 },
  demoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, backgroundColor: 'rgba(255,255,255,0.03)', padding: 14, borderRadius: Layout.radius.m },
  demoText: { color: Colors.textHint, fontSize: 14, fontWeight: '600', marginLeft: 12, flex: 1 },
  langValue: { color: Colors.surface, fontWeight: '800', fontSize: 12, backgroundColor: Colors.sidebarActive, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.accentGreen, marginRight: 8 },
  statusText: { color: Colors.textHint, fontSize: 13, fontWeight: '600' },
});
