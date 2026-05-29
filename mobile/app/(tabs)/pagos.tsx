import { useEffect, useState, useCallback } from 'react';
import { View, FlatList, Text, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing } from '@canalpay/shared';
import { useAuth } from '@/context/AuthContext';
import { fetchSellerOrders } from '@/lib/orders';
import type { OrderWithRelations } from '@/lib/orders';
import { AppHeader } from '@/components/AppHeader';
import { OrderCard } from '@/components/OrderCard';

export default function PagosTab() {
  const router = useRouter();
  const { session } = useAuth();
  const [orders, setOrders] = useState<OrderWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const uid = session?.user?.id;
    if (!uid) return;
    const data = await fetchSellerOrders(uid, { paymentStatus: 'paid', limit: 40 });
    setOrders(data);
    setLoading(false);
  }, [session?.user?.id]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <View style={styles.root}>
      <AppHeader title="Pagos" />
      <Text style={styles.sub}>Órdenes cobradas y confirmadas</Text>
      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={colors.primary} />
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          style={styles.list}
          renderItem={({ item }) => (
            <OrderCard order={item} onPress={() => router.push(`/orden/${item.id}`)} />
          )}
          ListEmptyComponent={<Text style={styles.empty}>Aún no hay pagos registrados</Text>}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={async () => {
                setRefreshing(true);
                await load();
                setRefreshing(false);
              }}
              tintColor={colors.primary}
            />
          }
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  sub: { paddingHorizontal: spacing.md, color: colors.onSurfaceVariant, marginBottom: 8 },
  list: { paddingHorizontal: spacing.md },
  empty: { textAlign: 'center', color: colors.onSurfaceVariant, marginTop: 32 },
});
