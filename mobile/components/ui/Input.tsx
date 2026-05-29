import { TextInput, Text, View, StyleSheet, type TextInputProps } from 'react-native';
import { colors, radius } from '@canalpay/shared';

export function Input({
  label,
  ...props
}: TextInputProps & { label?: string }) {
  return (
    <View style={styles.wrap}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        placeholderTextColor={colors.outline}
        style={styles.input}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 12 },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.onSurfaceVariant,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: colors.surfaceContainerLow,
    borderWidth: 2,
    borderColor: 'transparent',
    borderRadius: radius.md,
    minHeight: 52,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.onSurface,
  },
});
