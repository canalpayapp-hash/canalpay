import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, getRoleLabel, radius, spacing } from '@canalpay/shared';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { getDisplayName } from '@/lib/displayUser';
import { AppHeader } from '@/components/AppHeader';
import { Button } from '@/components/ui/Button';

export default function PerfilTab() {
  const router = useRouter();
  const { profile, merchantName, branchName, session } = useAuth();
  const displayName = getDisplayName(profile, session);

  async function signOut() {
    await supabase.auth.signOut();
    router.replace('/login');
  }

  return (
    <View style={styles.root}>
      <AppHeader title="Perfil" />
      <View style={styles.card}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={40} color={colors.primary} />
        </View>
        <Text style={styles.name}>{displayName}</Text>
        {profile?.role && (
          <View style={styles.rolePill}>
            <Text style={styles.roleText}>{getRoleLabel(profile.role)}</Text>
          </View>
        )}
        <View style={styles.row}>
          <Ionicons name="storefront-outline" size={20} color={colors.onSurfaceVariant} />
          <Text style={styles.meta}>{merchantName ?? 'Sin comercio'}</Text>
        </View>
        {branchName ? (
          <View style={styles.row}>
            <Ionicons name="location-outline" size={20} color={colors.onSurfaceVariant} />
            <Text style={styles.meta}>{branchName}</Text>
          </View>
        ) : null}
        {profile?.phone ? (
          <View style={styles.row}>
            <Ionicons name="call-outline" size={20} color={colors.onSurfaceVariant} />
            <Text style={styles.meta}>{profile.phone}</Text>
          </View>
        ) : null}
      </View>

      <Button
        label="Cerrar sesión"
        variant="outline"
        onPress={() =>
          Alert.alert('Cerrar sesión', '¿Salir de CanalPay?', [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Salir', style: 'destructive', onPress: signOut },
          ])
        }
        style={{ marginHorizontal: spacing.md }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  card: {
    margin: spacing.md,
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    padding: spacing.lg,
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.secondaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  name: { fontSize: 22, fontWeight: '700', color: colors.onSurface },
  rolePill: {
    backgroundColor: colors.secondaryContainer,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: radius.full,
    marginTop: 8,
    marginBottom: 16,
  },
  roleText: { fontSize: 12, fontWeight: '600', color: colors.primary },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'stretch', marginTop: 8 },
  meta: { fontSize: 15, color: colors.onSurfaceVariant, flex: 1 },
});
