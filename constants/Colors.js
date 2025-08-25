const tintColorLight = '#2f95dc';
const tintColorDark = '#fff';

export const COLORS = {
  primary: '#007AFF',
  accent: '#FF6B6B',
  background: '#F8F9FA',
  surface: '#FFFFFF',
  text: '#1A1A1A',
  textSecondary: '#6C757D',
  border: '#E9ECEF',
  success: '#28A745',
  warning: '#FFC107',
  error: '#DC3545',
  info: '#17A2B8',
};

export const SIZING = {
  padding_xs: 4,
  padding_sm: 8,
  padding_md: 16,
  padding_lg: 24,
  padding_xl: 32,
  margin_xs: 4,
  margin_sm: 8,
  margin_md: 16,
  margin_lg: 24,
  margin_xl: 32,
  radius_xs: 4,
  radius_sm: 8,
  radius_md: 12,
  radius_lg: 16,
  radius_xl: 24,
  font_xs: 10,
  font_sm: 12,
  font_md: 14,
  font_lg: 16,
  font_xl: 18,
  font_xxl: 24,
};

export default {
  light: {
    text: '#000',
    background: '#fff',
    tint: tintColorLight,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#fff',
    background: '#000',
    tint: tintColorDark,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorDark,
  },
};
