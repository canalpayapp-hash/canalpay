import { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '@canalpay/shared';
import { useAuth } from '@/context/AuthContext';
import { fetchSellerOrders, filterOrders } from '@/lib/orders';
import type { OrderWithRelations } from '@/lib/orders';
import { AppHeader } from '@/components/AppHeader';
import { OrderCard } from '@/components/OrderCard';
import { ChipRow } from '@/components/ui/Chip';

const FILTERS = [
  { id: 'all', label: 'Todas' },
  { id: 'today', label: 'Hoy' },
  { id: 'pending', label: 'Pendientes' },
  { id: 'paid', label: 'Pagadas' },
  { id: 'failed', label: 'Fallidas' },
];

export default function OrdenesTab() {
  const router = useRouter();
  const { session } = useAuth();
  const [orders, setOrders] = useState<OrderWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const uid = session?.user?.id;
    if (!uid) return;
    const data = await fetchSellerOrders(uid, { limit: 50 });
    setOrders(data);
    setLoading(false);
  }, [session?.user?.id]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(
    () => filterOrders(orders, search, filter === 'all' ? '' : filter),
    [orders, search, filter]
  );

  async function onRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  return (
    <View style={styles.root}>
      <AppHeader title="Órdenes" />
      <View style={styles.body}>
        <View style={styles.searchWrap}>
          <Ionicons name="search" size={20} color={colors.onSurfaceVariant} style={styles.searchIcon} />
          <TextInput
            style={styles.search}
            placeholder="Buscar por código o cliente"
            placeholderTextColor={colors.outline}
            value={search}
            onChangeText={setSearch}
          />
        </View>
        <ChipRow options={FILTERS} value={filter} onChange={setFilter} />
        {loading ? (
          <ActivityIndicator style={{ marginTop: 40 }} color={colors.primary} />
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <OrderCard order={item} onPress={() => router.push(`/orden/${item.id}`)} />
            )}
            ListEmptyComponent={<Text style={styles.empty}>Sin órdenes</Text>}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
            }
            contentContainerStyle={{ paddingBottom: 100 }}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  body: { flex: 1, paddingHorizontal: spacing.md },
  searchWrap: { position: 'relative', marginBottom: 12 },
  searchIcon: { position: 'absolute', left: 14, top: 17, zIndex: 1 },
  search: {
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: 12,
    paddingLeft: 44,
    paddingRight: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.onSurface,
  },
  empty: { textAlign: 'center', color: colors.onSurfaceVariant, marginTop: 32 },
});
