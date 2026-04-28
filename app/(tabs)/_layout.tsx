import React, { useRef, useCallback } from 'react';
import { Tabs } from 'expo-router';
import { Typography, Layout, LightTheme, DarkTheme } from '../../theme/tokens';
import { useTheme } from '../../hooks/useTheme';
import { LayoutDashboard, ClipboardList, PenTool, MessageSquare, MoreHorizontal, Users } from 'lucide-react-native';
import { Pressable, View, Text, StyleSheet } from 'react-native';
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import TopHeader from '../../components/TopHeader';
import { useRouter } from 'expo-router';
import { useUser } from '@clerk/clerk-expo';

export default function TabLayout() {
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const router = useRouter();
  const { user } = useUser();
  const { theme, isDarkMode } = useTheme();
  const isEmployee = user?.unsafeMetadata?.role === 'employee';

  const handlePresentModalPress = useCallback(() => {
    bottomSheetRef.current?.present();
  }, []);

  const navigateTo = (route: string) => {
    bottomSheetRef.current?.dismiss();
    router.push(route as any);
  };

  return (
    <>
      <Tabs
        screenOptions={{
          header: () => <TopHeader onMenuPress={handlePresentModalPress} />,
          tabBarActiveTintColor: theme.accentBlue,
          tabBarInactiveTintColor: theme.textHint,
          tabBarStyle: [styles.tabBar, { backgroundColor: theme.surface, borderTopColor: theme.border }],
          tabBarLabelStyle: styles.tabBarLabel,
          tabBarIconStyle: { marginBottom: -2 },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'HIVE',
            tabBarIcon: ({ color, focused }) => (
              <LayoutDashboard size={focused ? 24 : 20} color={color} strokeWidth={focused ? 2.5 : 2} />
            ),
          }}
        />
        <Tabs.Screen
          name="orders"
          options={{
            title: 'ORDERS',
            tabBarIcon: ({ color, focused }) => (
              <ClipboardList size={focused ? 24 : 20} color={color} strokeWidth={focused ? 2.5 : 2} />
            ),
          }}
        />
        <Tabs.Screen
          name="machines"
          options={{
            href: isEmployee ? null : '/machines',
            title: 'FACTORY',
            tabBarIcon: ({ color, focused }) => (
              <PenTool size={focused ? 24 : 20} color={color} strokeWidth={focused ? 2.5 : 2} />
            ),
          }}
        />
        <Tabs.Screen
          name="command"
          options={{
            title: 'TERMINAL',
            tabBarIcon: ({ color, focused }) => (
              <MessageSquare size={focused ? 24 : 20} color={color} strokeWidth={focused ? 2.5 : 2} />
            ),
          }}
        />
        <Tabs.Screen
          name="team"
          options={{
            href: isEmployee ? null : '/team',
            title: 'TEAM',
            tabBarIcon: ({ color, focused }) => (
              <Users size={focused ? 24 : 20} color={color} strokeWidth={focused ? 2.5 : 2} />
            ),
          }}
        />
        <Tabs.Screen
          name="more"
          options={{
            title: 'MENU',
            tabBarIcon: ({ color, focused }) => (
              <MoreHorizontal size={focused ? 24 : 20} color={color} strokeWidth={focused ? 2.5 : 2} />
            ),
            tabBarButton: (props) => {
              const { href, ...rest } = props as any;
              return (
                <Pressable 
                  {...rest} 
                  onPress={(e) => {
                    if (e && e.preventDefault) e.preventDefault();
                    handlePresentModalPress();
                  }} 
                  style={[props.style, { flex: 1, alignItems: 'center', justifyContent: 'center' }]} 
                />
              );
            },
          }}
        />
        <Tabs.Screen name="shipments" options={{ href: null }} />
        <Tabs.Screen name="vendors" options={{ href: null }} />
        <Tabs.Screen name="procurement" options={{ href: null }} />
      </Tabs>

      <BottomSheetModal
        ref={bottomSheetRef}
        snapPoints={['55%']}
        enablePanDownToClose
        onDismiss={() => bottomSheetRef.current?.dismiss()}
        backdropComponent={(props) => (
          <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.6} />
        )}
        backgroundStyle={{ backgroundColor: theme.sidebarBg, borderRadius: 24 }}
        handleIndicatorStyle={{ backgroundColor: theme.textHint, width: 40 }}
      >
        <BottomSheetView style={styles.sheetContent}>
          <Text style={[styles.sheetHeader, { color: theme.textPrimary }]}>OPERATIONS</Text>
          <View style={styles.menuGrid}>
            <Pressable style={[styles.menuItem, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#F8FAFC', borderColor: theme.border }]} onPress={() => navigateTo('/shipments')}>
              <View style={[styles.iconBox, { backgroundColor: theme.accentBlue + '20' }]}>
                <LayoutDashboard size={24} color={theme.accentBlue} />
              </View>
              <Text style={[styles.menuText, { color: theme.textPrimary }]}>Shipments</Text>
            </Pressable>
            <Pressable style={[styles.menuItem, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#F8FAFC', borderColor: theme.border }]} onPress={() => navigateTo('/vendors')}>
              <View style={[styles.iconBox, { backgroundColor: theme.accentGreen + '20' }]}>
                <ClipboardList size={24} color={theme.accentGreen} />
              </View>
              <Text style={[styles.menuText, { color: theme.textPrimary }]}>Vendors</Text>
            </Pressable>
            <Pressable style={[styles.menuItem, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#F8FAFC', borderColor: theme.border }]} onPress={() => navigateTo('/procurement')}>
              <View style={[styles.iconBox, { backgroundColor: theme.accentPurple + '20' }]}>
                <PenTool size={24} color={theme.accentPurple} />
              </View>
              <Text style={[styles.menuText, { color: theme.textPrimary }]}>Procurement</Text>
            </Pressable>
          </View>
          
          <View style={[styles.sheetFooter, { borderTopColor: theme.border }]}>
            <Text style={[styles.footerText, { color: theme.textMuted }]}>AetherBuilt Factory OS v2.0</Text>
          </View>
        </BottomSheetView>
      </BottomSheetModal>
    </>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 70,
    paddingBottom: 10,
    borderTopWidth: 1,
  },
  tabBarLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  sheetContent: {
    padding: 24,
    flex: 1,
  },
  sheetHeader: {
    fontSize: 12,
    fontWeight: '900',
    marginBottom: 24,
    letterSpacing: 2,
    opacity: 0.6,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  menuItem: {
    width: '47%',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  menuText: {
    fontSize: 14,
    fontWeight: '700',
  },
  sheetFooter: {
    marginTop: 'auto',
    alignItems: 'center',
    paddingVertical: 16,
    borderTopWidth: 1,
  },
  footerText: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1,
  },
});
