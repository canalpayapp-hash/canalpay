import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  type ViewStyle,
  type ReactNode,
} from 'react-native';
import { colors } from '@canalpay/shared';

type Variant = 'primary' | 'outline' | 'whatsapp';

const variantStyles: Record<Variant, { btn: object; text: string }> = {
  primary: { btn: { backgroundColor: colors.primary }, text: colors.onPrimary },
  outline: {
    btn: { backgroundColor: 'transparent', borderWidth: 2, borderColor: colors.primary },
    text: colors.primary,
  },
  whatsapp: { btn: { backgroundColor: colors.whatsapp }, text: colors.white },
};

export function Button({
  label,
  onPress,
  disabled,
  loading,
  variant = 'primary',
  icon,
  style,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: Variant;
  icon?: ReactNode;
  style?: ViewStyle;
}) {
  const v = variantStyles[variant];
  return (
    <TouchableOpacity
      style={[styles.base, v.btn, disabled && styles.disabled, style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.85}
    >
      {loading ? (
        <ActivityIndicator color={v.text} />
      ) : (
        <>
          {icon}
          <Text style={[styles.label, { color: v.text }]}>{label}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 20,
  },
  label: { fontSize: 16, fontWeight: '700' },
  disabled: { opacity: 0.5 },
});
