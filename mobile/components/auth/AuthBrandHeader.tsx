import { Image, StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '@canalpay/shared';

const LOGO_ASPECT = 168 / 228;

type Props = {
  /** Ancho del bloque de logo (mock: w-32 ≈ 128px; usamos un poco más para legibilidad) */
  logoWidth?: number;
  /** Si el PNG ya incluye texto de marca, no duplicar el título */
  showTitle?: boolean;
  showTagline?: boolean;
};

export function AuthBrandHeader({
  logoWidth = 168,
  showTitle = false,
  showTagline = true,
}: Props) {
  const logoHeight = logoWidth / LOGO_ASPECT;

  return (
    <View style={styles.wrap}>
      <View style={styles.plate}>
        <Image
          source={require('@/assets/images/canalpay-logo.png')}
          style={{ width: logoWidth, height: logoHeight }}
          resizeMode="contain"
          accessibilityLabel="CanalPay"
        />
      </View>

      {showTitle ? (
        <Text style={styles.title}>CanalPay</Text>
      ) : null}

      {showTagline ? (
        <Text style={styles.tagline}>Pagos rápidos para canales de venta rápidos</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  plate: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 20,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: -0.3,
    marginBottom: spacing.sm,
  },
  tagline: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    maxWidth: 280,
    paddingHorizontal: spacing.sm,
  },
});
