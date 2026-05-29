import { useState } from 'react';
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { translateAuthError } from '@canalpay/shared';
import { supabase } from '@/lib/supabase';
import { fetchMobileAuthContext } from '@/lib/auth';
import { AuthBrandHeader } from '@/components/auth/AuthBrandHeader';
import { AuthScreenShell } from '@/components/auth/AuthScreenShell';
import { BancaribeAlliance } from '@/components/auth/BancaribeAlliance';
import { authCardStyles as s } from '@/components/auth/authCardStyles';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function signIn() {
    if (!email.trim() || !password) {
      setError('Ingresa email y contraseña.');
      return;
    }
    setLoading(true);
    setError(null);
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
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
  }

  return (
    <AuthScreenShell>
      <KeyboardAvoidingView
        style={{ flex: 1, paddingTop: insets.top + 16 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={{ padding: 24, flexGrow: 1, justifyContent: 'center' }}
          keyboardShouldPersistTaps="handled"
        >
          <AuthBrandHeader logoWidth={168} showTagline={false} />

          <View style={s.card}>
            <Text style={s.cardTitle}>Iniciar sesión</Text>
            <Text style={s.hint}>Acceso para vendedores y cajeros</Text>
            <Input
              label="Email"
              placeholder="tu@email.com"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
            <Input
              label="Contraseña"
              placeholder="••••••••"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
            {error ? <Text style={s.error}>{error}</Text> : null}
            <Button label="Iniciar sesión" onPress={signIn} loading={loading} />
            <View
              style={{
                marginTop: 16,
                paddingTop: 16,
                borderTopWidth: 1,
                borderTopColor: '#cbc4d2',
                alignItems: 'center',
              }}
            >
              <Pressable onPress={() => router.push('/registro')}>
                <Text style={s.footerText}>
                  ¿No tienes una cuenta? <Text style={s.footerLink}>Regístrate ahora</Text>
                </Text>
              </Pressable>
            </View>
          </View>

          <BancaribeAlliance />
        </ScrollView>
      </KeyboardAvoidingView>
    </AuthScreenShell>
  );
}
