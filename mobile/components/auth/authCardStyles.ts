import { StyleSheet } from 'react-native';
import { colors, spacing } from '@canalpay/shared';

/** Tarjeta de formulario alineada al mock Stitch (login-card) */
export const authCardStyles = StyleSheet.create({
  card: {
    marginTop: spacing.md,
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: spacing.lg,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.onSurface,
    marginBottom: 4,
  },
  hint: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.onSurfaceVariant,
    marginBottom: spacing.md,
  },
  error: {
    color: colors.error,
    marginBottom: spacing.sm,
    fontSize: 14,
  },
  footer: {
    marginTop: spacing.lg,
    alignItems: 'center',
  },
  footerText: {
    color: colors.onSurfaceVariant,
    fontSize: 14,
  },
  footerLink: {
    color: colors.primary,
    fontWeight: '700',
  },
  linkBtn: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  link: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 15,
  },
  linkMuted: {
    color: colors.onSurfaceVariant,
    fontSize: 14,
  },
});
