import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { colors, copy, translateAuthError } from '@canalpay/shared';
import { supabase } from '@/lib/supabase';
import { fetchMobileAuthContext } from '@/lib/auth';

export default function LoginScreen() {
  const [email, setEmail] = useState('vendedor@dulcecaracas.com');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function signIn() {
    setLoading(true);
    setError(null);
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) {
      setLoading(false);
      setError(translateAuthError(authError.message));
      return;
    }

    const ctx = await fetchMobileAuthContext();
    if (!ctx?.canMobile) {
      await supabase.auth.signOut();
      setLoading(false);
      setError('Tu rol usa el panel web, no la app móvil.');
      return;
    }

    if (ctx.gate === 'inactive') {
      await supabase.auth.signOut();
      setLoading(false);
      setError('Tu cuenta está desactivada.');
      return;
    }

    setLoading(false);
    // AuthProvider redirige a home / perfil-incompleto
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={styles.title}>CanalPay</Text>
      <Text style={styles.sub}>{copy.homeTagline}</Text>
      <Text style={styles.hint}>Acceso para vendedores y cajeros.</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      {error && <Text style={styles.error}>{error}</Text>}
      <TouchableOpacity style={styles.btn} onPress={signIn} disabled={loading}>
        {loading ? (
          <ActivityIndicator color={colors.white} />
        ) : (
          <Text style={styles.btnText}>Iniciar sesión</Text>
        )}
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: colors.background },
  title: { fontSize: 28, fontWeight: '700', color: colors.navy, marginBottom: 8 },
  sub: { color: colors.gray, marginBottom: 8 },
  hint: { color: colors.gray, fontSize: 12, marginBottom: 24 },
  input: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  btn: {
    backgroundColor: colors.teal,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    minHeight: 52,
    justifyContent: 'center',
  },
  btnText: { color: colors.white, fontWeight: '700', fontSize: 16 },
  error: { color: colors.danger, marginBottom: 8 },
});
