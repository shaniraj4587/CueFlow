export interface ThemeColors {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  background: string;
  card: string;
  surface: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  borderFocus: string;
  success: string;
  error: string;
  warning: string;
  overlayBg: string;
  activeIndicator: string;
}

export const lightColors: ThemeColors = {
  primary: '#CF5418',
  primaryLight: '#E86B2F',
  primaryDark: '#A63F0E',
  background: '#E7ECF3',
  card: '#FFFFFF',
  surface: '#F4F7FB',
  textPrimary: '#202631',
  textSecondary: '#69758D',
  textMuted: '#9AA5B9',
  border: '#D2DAE7',
  borderFocus: '#CF5418',
  success: '#2E7D32',
  error: '#D32F2F',
  warning: '#ED6C02',
  overlayBg: 'rgba(0, 0, 0, 0.65)',
  activeIndicator: '#CF5418',
};

export const darkColors: ThemeColors = {
  primary: '#FF6F2E',
  primaryLight: '#FFA06A',
  primaryDark: '#CF5418',
  background: '#0F141C',
  card: '#1A212D',
  surface: '#242D3D',
  textPrimary: '#F1F5F9',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  border: '#2A3547',
  borderFocus: '#FF6F2E',
  success: '#4CAF50',
  error: '#EF5350',
  warning: '#FF9800',
  overlayBg: 'rgba(0, 0, 0, 0.85)',
  activeIndicator: '#FF6F2E',
};
