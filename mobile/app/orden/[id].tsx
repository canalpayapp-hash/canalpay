import { useEffect, useState, type ComponentProps } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Linking,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';
import {
  colors,
  formatCurrency,
  formatOrderDate,
  getChannelLabel,
  getPaymentStatusLabel,
  radius,
  spacing,
} from '@canalpay/shared';
import { fetchOrderById, type OrderWithRelations } from '@/lib/orders';
import { AppHeader } from '@/components/AppHeader';
import { Button } from '@/components/ui/Button';
import { getPaymentStatusColors } from '@canalpay/shared';

export default function OrdenDetalleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<OrderWithRelations | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const data = await fetchOrderById(id);
      setOrder(data);
      setLoading(false);
    })();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.center}>
        <Text>Orden no encontrada</Text>
        <Button label="Volver" variant="outline" onPress={() => router.back()} />
      </View>
    );
  }

  const customer = order.customers as { name?: string; phone?: string } | undefined;
  const branch = order.branches as { name?: string } | undefined;
  const badge = getPaymentStatusColors(order.payment_status);
  const link = order.payment_link ?? '';

  const waMessage = `Hola, tu link de pago ${order.public_code}: ${link}`;

  return (
    <View style={styles.root}>
      <AppHeader title="Detalle" showBack />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.orderLabel}>ORDEN #{order.public_code}</Text>
        <Text style={styles.customerName}>{customer?.name ?? 'Cliente'}</Text>
        <View style={[styles.badge, { backgroundColor: badge.bg }]}>
          <Text style={[styles.badgeText, { color: badge.text }]}>
            {getPaymentStatusLabel(order.payment_status).toUpperCase()}
          </Text>
        </View>

        <View style={styles.amountCard}>
          <Ionicons name="card-outline" size={28} color={colors.onPrimary} style={{ opacity: 0.8 }} />
          <Text style={styles.amountLabel}>Monto</Text>
          <Text style={styles.amountValue}>{formatCurrency(order.amount, order.currency)}</Text>
          <Text style={styles.concept}>{order.concept}</Text>
        </View>

        <View style={styles.infoGrid}>
          <InfoTile icon="chatbubble-outline" label="Canal" value={getChannelLabel(order.channel)} />
          <InfoTile icon="storefront-outline" label="Sucursal" value={branch?.name ?? '—'} />
          <InfoTile icon="calendar-outline" label="Creada" value={formatOrderDate(order.created_at)} />
          <InfoTile icon="receipt-outline" label="Estado" value={order.status.replace(/_/g, ' ')} />
        </View>

        {link ? (
          <>
            <TouchableOpacity
              style={styles.linkRow}
              onPress={async () => {
                await Clipboard.setStringAsync(link);
                Alert.alert('Copiado', 'Link de pago copiado');
              }}
            >
              <Ionicons name="link" size={20} color={colors.primary} />
              <Text style={styles.linkText} numberOfLines={2}>
                {link}
              </Text>
            </TouchableOpacity>
            {order.payment_status !== 'paid' ? (
              <Button
                label="Enviar por WhatsApp"
                variant="whatsapp"
                onPress={() => {
                  const phone = (customer?.phone ?? '').replace(/\D/g, '');
                  const url = phone
                    ? `https://wa.me/${phone}?text=${encodeURIComponent(waMessage)}`
                    : `https://wa.me/?text=${encodeURIComponent(waMessage)}`;
                  Linking.openURL(url);
                }}
              />
            ) : null}
          </>
        ) : null}
      </ScrollView>
    </View>
  );
}

function InfoTile({
  icon,
  label,
  value,
}: {
  icon: ComponentProps<typeof Ionicons>['name'];
  label: string;
  value: string;
}) {
  return (
    <View style={styles.tile}>
      <View style={styles.tileIcon}>
        <Ionicons name={icon} size={22} color={colors.primary} />
      </View>
      <View>
        <Text style={styles.tileLabel}>{label}</Text>
        <Text style={styles.tileValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  scroll: { padding: spacing.md, paddingBottom: 40 },
  orderLabel: { fontSize: 12, fontWeight: '600', color: colors.onSurfaceVariant, letterSpacing: 1 },
  customerName: { fontSize: 28, fontWeight: '700', color: colors.onSurface, marginTop: 4 },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.full,
    marginTop: 12,
    marginBottom: 20,
  },
  badgeText: { fontSize: 12, fontWeight: '700' },
  amountCard: {
    backgroundColor: colors.primaryContainer,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  amountLabel: { color: colors.onPrimary, opacity: 0.9, fontSize: 12, marginTop: 8 },
  amountValue: { fontSize: 36, fontWeight: '700', color: colors.onPrimary },
  concept: { color: colors.onPrimary, opacity: 0.85, marginTop: 8 },
  infoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  tile: {
    width: '47%',
    flexDirection: 'row',
    gap: 10,
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    padding: 14,
  },
  tileIcon: {
    backgroundColor: colors.surfaceContainerHigh,
    padding: 8,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  tileLabel: { fontSize: 11, color: colors.onSurfaceVariant, fontWeight: '600' },
  tileValue: { fontSize: 15, fontWeight: '600', color: colors.onSurface, marginTop: 2 },
  linkRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerHighest,
    padding: 14,
    borderRadius: radius.md,
    marginTop: spacing.lg,
    marginBottom: 12,
  },
  linkText: { flex: 1, fontSize: 13, color: colors.onSurface },
});
