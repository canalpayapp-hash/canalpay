import { View, Text, StyleSheet } from 'react-native';
import { getPaymentStatusColors, getPaymentStatusLabel } from '@canalpay/shared';
import type { PaymentStatus } from '@canalpay/shared';

export function PaymentBadge({ status }: { status: PaymentStatus | string }) {
  const { bg, text } = getPaymentStatusColors(status);
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.text, { color: text }]}>{getPaymentStatusLabel(status)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  text: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
});
