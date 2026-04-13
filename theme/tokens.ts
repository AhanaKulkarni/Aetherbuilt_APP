export const Colors = {
  background: '#F8FAFC', // slightly cooler white
  surface: '#ffffff',
  border: '#f1f5f9',
  textPrimary: '#0f172a',
  textMuted: '#64748b',
  textHint: '#94a3b8',
  accentBlue: '#0ea5e9',
  accentGreen: '#10b981',
  accentRed: '#f43f5e',
  accentAmber: '#f59e0b',
  accentPurple: '#8b5cf6',
  accentTeal: '#14b8a6',
  sidebarBg: '#0f172a', 
  sidebarActive: '#1e293b',
  darkCard: '#0f172a',
};

export const Typography = {
  heading: { fontWeight: '800' as const, fontSize: 36, color: Colors.textPrimary },
  subheading: { fontWeight: '600' as const, fontSize: 18, color: Colors.textPrimary },
  label: { fontWeight: '700' as const, fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase' as const, color: Colors.textHint },
  body: { fontWeight: '500' as const, fontSize: 15, color: Colors.textPrimary },
  stat: { fontWeight: '800' as const, fontSize: 44, color: Colors.textPrimary, letterSpacing: -1 },
};

export const Layout = {
  sidebarWidth: 260,
  spacing: {
    s: 8,
    m: 12,
    l: 16,
    xl: 20,
    xxl: 24,
  },
  radius: {
    s: 8,
    m: 12,
    l: 16,
    xl: 24,
  },
  shadow: {
    shadowColor: '#64748b',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 4,
  }
};
