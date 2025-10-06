// Design System Theme Tokens
export const colors = {
  primaryBlue: '#004AAD',
  primaryGreen: '#007A33',
  accentYellow: '#FFD100',
  background: '#F4F6F8',
  text: '#333333',
  white: '#FFFFFF',
  border: '#E5E7EB',
  mutedText: '#64748B',
  success: '#16A34A',
  error: '#DC2626',
};

export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
};

export const radii = {
  sm: 6,
  md: 10,
  lg: 14,
  pill: 999,
};

export const typography = {
  headingFamily: 'Inter-SemiBold',
  bodyFamily: 'Inter-Regular',
  heading1: 24,
  heading2: 20,
  body: 16,
  small: 14,
};

export const elevation = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  fab: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 12,
    elevation: 6,
  },
};

export const theme = { colors, spacing, radii, typography, elevation };

export default theme;

