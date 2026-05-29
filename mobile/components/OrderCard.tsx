import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  colors,
  formatCurrency,
  formatOrderDate,
  getChannelLabel,
  radius,
} from '@canalpay/shared';
import type { Order } from '@canalpay/shared';
import { PaymentBadge } from './ui/Badge';

export function OrderCard({ order, onPress }: { order: Order; onPress?: () => void }) {
  const customer = order.customers as { name?: string } | undefined;
  const Wrapper = onPress ? TouchableOpacity : View;

  return (
    <Wrapper style={styles.card} onPress={onPress} activeOpacity={0.9}>
      <View style={styles.top}>
        <View>
          <Text style={styles.code}>#{order.public_code}</Text>
          <Text style={styles.name}>{customer?.name ?? 'Sin cliente'}</Text>
        </View>
        <PaymentBadge status={order.payment_status} />
      </View>
      <View style={styles.divider} />
      <View style={styles.bottom}>
        <View style={styles.meta}>
          <View style={styles.metaRow}>
            <Ionicons name="chatbubble-outline" size={18} color={colors.onSurfaceVariant} />
            <Text style={styles.metaText}>{getChannelLabel(order.channel)}</Text>
          </View>
          <View style={styles.metaRow}>
            <Ionicons name="time-outline" size={18} color={colors.onSurfaceVariant} />
            <Text style={styles.metaText}>{formatOrderDate(order.created_at)}</Text>
          </View>
        </View>
        <Text style={styles.amount}>{formatCurrency(order.amount, order.currency)}</Text>
      </View>
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    padding: 16,
    marginBottom: 12,
  },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  code: { fontSize: 12, fontWeight: '600', color: colors.onSurfaceVariant },
  name: { fontSize: 18, fontWeight: '600', color: colors.onSurface, marginTop: 2 },
  divider: { height: 1, backgroundColor: colors.outlineVariant, opacity: 0.5, marginVertical: 12 },
  bottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  meta: { gap: 6 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { fontSize: 14, color: colors.onSurfaceVariant },
  amount: { fontSize: 20, fontWeight: '700', color: colors.primary },
});
