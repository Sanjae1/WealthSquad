import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { colors, spacing, radii, typography } from '../../DesignSystem/theme';

const InputField = ({ label, placeholder, value, onChangeText, keyboardType = 'default', secureTextEntry = false, helpText }) => {
  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={colors.mutedText}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
      />
      {helpText ? <Text style={styles.help}>{helpText}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: spacing.lg },
  label: {
    color: colors.text,
    fontFamily: typography.headingFamily,
    fontSize: typography.small,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.text,
    fontSize: typography.body,
  },
  help: {
    marginTop: spacing.xs,
    color: colors.mutedText,
    fontSize: typography.small,
  },
});

export default InputField;

