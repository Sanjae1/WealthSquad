import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, radii, typography, elevation } from '../../DesignSystem/theme';

const BillerCard = ({ logoSource, title, subtitle, rightCtaLabel = 'Pay Now', onPress }) => {
  return (
    <TouchableOpacity style={[styles.card, elevation.card]} activeOpacity={0.9} onPress={onPress}>
      <View style={styles.left}>
        {!!logoSource && <Image source={logoSource} style={styles.logo} resizeMode="contain" />}
        <View>
          <Text style={styles.title}>{title}</Text>
          {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
      </View>
      <Text style={styles.cta}>{rightCtaLabel} ›</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  logo: { width: 40, height: 40, marginRight: spacing.md },
  title: { color: colors.text, fontFamily: typography.headingFamily, fontSize: typography.body },
  subtitle: { color: colors.mutedText, fontSize: typography.small, marginTop: 2 },
  cta: { color: colors.primaryBlue, fontFamily: typography.headingFamily },
});

export default BillerCard;

