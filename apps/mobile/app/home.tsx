import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, copy, getRoleLabel } from '@canalpay/shared';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

export default function HomeScreen() {
  const router = useRouter();
  const { loading, profile, merchantName, branchName, session } = useAuth();
  const [stats, setStats] = useState({ paid: 0, pending: 0 });

  useEffect(() => {
    if (!session?.user?.id) return;

    (async () => {
      const today = new Date().toISOString().slice(0, 10);
      const { data: orders } = await supabase
        .from('orders')
        .select('payment_status')
        .eq('seller_id', session.user.id)
        .gte('created_at', `${today}T00:00:00`);

      let paid = 0;
      let pending = 0;
      for (const o of orders ?? []) {
        if (o.payment_status === 'paid') paid++;
        else pending++;
      }
      setStats({ paid, pending });
    })();
  }, [session?.user?.id]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.teal} />
      </View>
    );
  }

  const commerceLine =
    merchantName && branchName
      ? `${merchantName} · ${branchName}`
      : merchantName ?? 'Comercio no asignado';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.greeting}>Hola, {profile?.full_name ?? 'Usuario'}</Text>
      <Text style={styles.meta}>{commerceLine}</Text>
      {profile?.role && (
        <Text style={styles.role}>{getRoleLabel(profile.role)}</Text>
      )}
      <Text style={styles.tagline}>{copy.homeTagline}</Text>

      <View style={styles.row}>
        <View style={styles.stat}>
          <Text style={styles.statN}>{stats.paid}</Text>
          <Text style={styles.statL}>Pagadas hoy</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statN}>{stats.pending}</Text>
          <Text style={styles.statL}>Pendientes hoy</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.primary} onPress={() => router.push('/crear-cobro')}>
        <Text style={styles.primaryText}>Crear cobro</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.secondary} onPress={() => router.push('/ordenes')}>
        <Text style={styles.secondaryText}>Ver mis órdenes</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={async () => {
          await supabase.auth.signOut();
          router.replace('/login');
        }}
      >
        <Text style={styles.logout}>Cerrar sesión</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 24, paddingTop: 56 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  greeting: { fontSize: 24, fontWeight: '700', color: colors.navy },
  meta: { color: colors.gray, marginTop: 4, fontSize: 15 },
  role: { color: colors.teal, fontSize: 13, fontWeight: '600', marginTop: 4 },
  tagline: { color: colors.gray, marginTop: 12, marginBottom: 24 },
  row: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  stat: {
    flex: 1,
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  statN: { fontSize: 28, fontWeight: '700', color: colors.teal },
  statL: { color: colors.gray, fontSize: 12 },
  primary: {
    backgroundColor: colors.teal,
    padding: 18,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryText: { color: colors.white, fontSize: 18, fontWeight: '700' },
  secondary: {
    borderWidth: 2,
    borderColor: colors.navy,
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  secondaryText: { color: colors.navy, fontWeight: '600' },
  logout: { color: colors.gray, textAlign: 'center', marginTop: 32 },
});
