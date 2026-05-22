import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@canalpay/shared';
import { supabase } from '@/lib/supabase';

export default function CuentaInactivaScreen() {
  const router = useRouter();

  async function salir() {
    await supabase.auth.signOut();
    router.replace('/login');
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cuenta desactivada</Text>
      <Text style={styles.text}>
        Tu usuario fue desactivado. Contacta al administrador del comercio.
      </Text>
      <TouchableOpacity style={styles.btn} onPress={salir}>
        <Text style={styles.btnText}>Cerrar sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: colors.background },
  title: { fontSize: 22, fontWeight: '700', color: colors.navy, marginBottom: 12 },
  text: { color: colors.gray, marginBottom: 24, lineHeight: 22 },
  btn: { backgroundColor: colors.teal, padding: 16, borderRadius: 12, alignItems: 'center' },
  btnText: { color: colors.white, fontWeight: '700' },
});
