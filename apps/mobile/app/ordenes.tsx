import { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@canalpay/shared';
import { supabase } from '@/lib/supabase';
import type { Order } from '@canalpay/shared';

export default function OrdenesScreen() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from('orders')
        .select('*, customers(name)')
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false })
        .limit(30);
      setOrders((data as Order[]) ?? []);
    })();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mis órdenes</Text>
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const customer = item.customers as { name?: string } | undefined;
          return (
            <View style={styles.card}>
              <Text style={styles.code}>{item.public_code}</Text>
              <Text>{customer?.name ?? 'Sin cliente'}</Text>
              <Text style={styles.amount}>
                {item.amount} {item.currency} · {item.payment_status}
              </Text>
            </View>
          );
        }}
        ListEmptyComponent={<Text style={styles.empty}>Sin órdenes aún</Text>}
      />
      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.back}>Volver</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingTop: 56, backgroundColor: colors.background },
  title: { fontSize: 22, fontWeight: '700', color: colors.navy, marginBottom: 16 },
  card: {
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  code: { fontWeight: '700', color: colors.navy },
  amount: { color: colors.gray, marginTop: 4 },
  empty: { color: colors.gray, textAlign: 'center', marginTop: 24 },
  back: { textAlign: 'center', color: colors.gray, marginTop: 16 },
});
