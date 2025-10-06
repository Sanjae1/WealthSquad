import React from 'react';
import { TouchableOpacity, StyleSheet, Text } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, spacing, radii, elevation } from '../../DesignSystem/theme';

const FloatingActionButton = ({ onPress, icon = 'plus', label }) => {
  return (
    <TouchableOpacity style={[styles.fab, elevation.fab]} onPress={onPress} activeOpacity={0.85}>
      <MaterialCommunityIcons name={icon} color={colors.text} size={24} />
      {label ? <Text style={styles.label}>{label}</Text> : null}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: spacing.xl,
    bottom: spacing.xl,
    backgroundColor: colors.accentYellow,
    borderRadius: radii.pill,
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    display: 'none',
  },
});

export default FloatingActionButton;

