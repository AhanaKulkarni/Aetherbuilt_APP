import { Drawer } from 'expo-router/drawer';
import Sidebar from '../../components/Sidebar';
import { Colors } from '../../theme/tokens';
import { Dimensions } from 'react-native';

export default function DrawerLayout() {
  const { width } = Dimensions.get('window');
  // Simplistic breakpoint for desktop/tablet layout
  const isLargeScreen = width >= 768;

  return (
    <Drawer
      drawerContent={(props) => <Sidebar {...props} />}
      screenOptions={{
        headerShown: false,
        drawerType: isLargeScreen ? 'permanent' : 'front',
        drawerStyle: {
          width: 260,
          backgroundColor: Colors.sidebarBg,
        },
        overlayColor: 'rgba(0,0,0,0.5)',
      }}
    >
      <Drawer.Screen name="dashboard" options={{ title: 'Dashboard' }} />
      <Drawer.Screen name="orders" options={{ title: 'Orders' }} />
      <Drawer.Screen name="shipments" options={{ title: 'Shipments' }} />
      <Drawer.Screen name="machines" options={{ title: 'Machines' }} />
      <Drawer.Screen name="vendors" options={{ title: 'Vendors' }} />
      <Drawer.Screen name="procurement" options={{ title: 'Procurement' }} />
      <Drawer.Screen name="command" options={{ title: 'Quick Command' }} />
    </Drawer>
  );
}
