import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import {
  colors,
  copy,
  formatCurrency,
  radius,
  spacing,
} from '@canalpay/shared';
import { useAuth } from '@/context/AuthContext';
import { getFirstName } from '@/lib/displayUser';
import { fetchSellerOrders, fetchTodayMetrics } from '@/lib/orders';
import type { OrderWithRelations } from '@/lib/orders';
import { OrderCard } from '@/components/OrderCard';
import { PaymentBadge } from '@/components/ui/Badge';

export default function HomeTab() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { loading, profile, merchantName, branchName, session, refresh } = useAuth();
  const firstName = getFirstName(profile, session);
  const [metrics, setMetrics] = useState({ collected: 0, paid: 0, pending: 0, failed: 0 });
  const [recent, setRecent] = useState<OrderWithRelations[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const uid = session?.user?.id;
    if (!uid) return;
    const [m, orders] = await Promise.all([
      fetchTodayMetrics(uid),
      fetchSellerOrders(uid, { limit: 3 }),
    ]);
    setMetrics(m);
    setRecent(orders);
  }, [session?.user?.id]);

  useEffect(() => {
    load();
  }, [load]);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  async function onRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const commerceLine =
    merchantName && branchName
      ? `${merchantName} · ${branchName}`
      : merchantName ?? 'Comercio';

  const currency = profile?.merchant_id ? 'VES' : 'VES';

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.topBar}>
        <Text style={styles.brand}>CanalPay</Text>
        <TouchableOpacity
          style={styles.avatar}
          onPress={() => router.push('/(tabs)/perfil')}
          activeOpacity={0.7}
          accessibilityLabel="Ver perfil"
          accessibilityRole="button"
        >
          <Ionicons name="person" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        <Text style={styles.greeting}>Hola, {firstName}</Text>
        <View style={styles.commerceRow}>
          <Ionicons name="storefront-outline" size={18} color={colors.onSurfaceVariant} />
          <Text style={styles.commerce}>{commerceLine}</Text>
        </View>

        <View style={styles.bentoMain}>
          <Text style={styles.metricLabel}>COBRADO HOY</Text>
          <Text style={styles.metricBig}>{formatCurrency(metrics.collected, currency)}</Text>
        </View>

        <View style={styles.bentoRow}>
          <View style={styles.miniCard}>
            <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
            <Text style={styles.miniLabel}>Pagadas</Text>
            <Text style={styles.miniValue}>{metrics.paid}</Text>
          </View>
          <View style={styles.miniCard}>
            <Ionicons name="time-outline" size={22} color={colors.secondary} />
            <Text style={styles.miniLabel}>Pendientes</Text>
            <Text style={styles.miniValue}>{metrics.pending}</Text>
          </View>
        </View>

        <View style={styles.failedCard}>
          <View style={styles.failedLeft}>
            <Ionicons name="close-circle" size={22} color={colors.error} />
            <View>
              <Text style={styles.miniLabel}>Fallidas</Text>
              <Text style={styles.miniValue}>{metrics.failed}</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.outline} />
        </View>

        <TouchableOpacity
          style={styles.cta}
          onPress={() => router.push('/crear-cobro')}
          activeOpacity={0.9}
        >
          <Ionicons name="add" size={22} color={colors.onPrimary} />
          <Text style={styles.ctaText}>Crear cobro</Text>
        </TouchableOpacity>

        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>Órdenes recientes</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/ordenes')}>
            <Text style={styles.link}>Ver todas</Text>
          </TouchableOpacity>
        </View>

        {recent.length === 0 ? (
          <Text style={styles.empty}>{copy.homeTagline}</Text>
        ) : (
          recent.map((order) => {
            const customer = order.customers as { name?: string } | undefined;
            return (
              <TouchableOpacity
                key={order.id}
                style={styles.recentRow}
                onPress={() => router.push(`/orden/${order.id}`)}
              >
                <View style={styles.recentIcon}>
                  <Ionicons name="person-outline" size={20} color={colors.primary} />
                </View>
                <View style={styles.recentBody}>
                  <Text style={styles.recentName}>{customer?.name ?? 'Cliente'}</Text>
                  <Text style={styles.recentCode}>{order.public_code}</Text>
                </View>
                <View style={styles.recentRight}>
                  <Text style={styles.recentAmount}>
                    {formatCurrency(order.amount, order.currency)}
                  </Text>
                  <PaymentBadge status={order.payment_status} />
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingBottom: 8,
  },
  brand: { fontSize: 22, fontWeight: '700', color: colors.primary },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.secondaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  scroll: { padding: spacing.md, paddingBottom: 100 },
  greeting: { fontSize: 24, fontWeight: '700', color: colors.onSurface },
  commerceRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4, marginBottom: spacing.lg },
  commerce: { fontSize: 14, color: colors.onSurfaceVariant },
  bentoMain: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  metricLabel: { fontSize: 12, fontWeight: '600', color: colors.onSurfaceVariant, letterSpacing: 1 },
  metricBig: { fontSize: 32, fontWeight: '700', color: colors.primary, marginTop: 8 },
  bentoRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.md },
  miniCard: {
    flex: 1,
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    padding: spacing.md,
  },
  miniLabel: { fontSize: 12, color: colors.onSurfaceVariant, marginTop: 8 },
  miniValue: { fontSize: 20, fontWeight: '600', color: colors.onSurface },
  failedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  failedLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  cta: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: spacing.lg,
  },
  ctaText: { color: colors.onPrimary, fontSize: 18, fontWeight: '600' },
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: colors.onSurface },
  link: { fontSize: 12, fontWeight: '600', color: colors.primary },
  empty: { color: colors.onSurfaceVariant, textAlign: 'center', paddingVertical: 24 },
  recentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    padding: 14,
    marginBottom: 8,
  },
  recentIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  recentBody: { flex: 1 },
  recentName: { fontSize: 16, fontWeight: '600', color: colors.onSurface },
  recentCode: { fontSize: 13, color: colors.onSurfaceVariant },
  recentRight: { alignItems: 'flex-end', gap: 4 },
  recentAmount: { fontSize: 16, fontWeight: '700', color: colors.onSurface },
});
