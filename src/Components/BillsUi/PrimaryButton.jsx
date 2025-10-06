import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, View } from 'react-native';
import { colors, spacing, radii, typography } from '../../DesignSystem/theme';

const PrimaryButton = ({ title, onPress, loading = false, disabled = false, style, textStyle }) => {
  const isDisabled = disabled || loading;
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={isDisabled}
      style={[styles.button, isDisabled && styles.buttonDisabled, style]}
    >
      {loading ? (
        <View style={styles.rowCenter}>
          <ActivityIndicator color={colors.text} />
        </View>
      ) : (
        <Text style={[styles.text, textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.accentYellow,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  text: {
    color: colors.text,
    fontSize: typography.body,
    fontFamily: typography.headingFamily,
  },
  rowCenter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
});

export default PrimaryButton;

