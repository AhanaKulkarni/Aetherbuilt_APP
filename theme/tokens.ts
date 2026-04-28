export const LightTheme = {
  background: '#F0F9FF', 
  surface: '#ffffff',
  border: '#bae6fd',
  textPrimary: '#0f172a',
  textMuted: '#475569',
  textHint: '#94a3b8',
  accentBlue: '#0284c7',
  accentGreen: '#059669',
  accentRed: '#e11d48',
  accentAmber: '#d97706',
  accentPurple: '#7c3aed',
  accentTeal: '#0d9488',
  sidebarBg: '#e0f2fe', 
  sidebarActive: '#bae6fd',
  card: '#ffffff',
};

export const DarkTheme = {
  background: '#0B1120', 
  surface: '#1e293b',
  border: '#334155',
  textPrimary: '#f8fafc',
  textMuted: '#94a3b8',
  textHint: '#64748b',
  accentBlue: '#38bdf8',
  accentGreen: '#34d399',
  accentRed: '#fb7185',
  accentAmber: '#fbbf24',
  accentPurple: '#a78bfa',
  accentTeal: '#2dd4bf',
  sidebarBg: '#1e293b', 
  sidebarActive: '#334155',
  card: '#1e293b',
};

// Default for backward compatibility (will be overridden by dynamic theme)
export const Colors = LightTheme;

export const Typography = {
  heading: { fontWeight: '800' as const, fontSize: 36 },
  subheading: { fontWeight: '600' as const, fontSize: 18 },
  label: { fontWeight: '700' as const, fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase' as const },
  body: { fontWeight: '500' as const, fontSize: 15 },
  stat: { fontWeight: '800' as const, fontSize: 44, letterSpacing: -1 },
};

export const Layout = {
  sidebarWidth: 260,
  spacing: { s: 8, m: 12, l: 16, xl: 20, xxl: 24 },
  radius: { s: 8, m: 12, l: 16, xl: 24 },
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  }
};
