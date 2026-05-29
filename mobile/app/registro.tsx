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
import { colors, translateAuthError } from '@canalpay/shared';
import { AuthBrandHeader } from '@/components/auth/AuthBrandHeader';
import { AuthScreenShell } from '@/components/auth/AuthScreenShell';
import { BancaribeAlliance } from '@/components/auth/BancaribeAlliance';
import { authCardStyles as s } from '@/components/auth/authCardStyles';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import {
  ensureMobileSellerProfile,
  sendRegistrationOtp,
  verifyRegistrationOtp,
} from '@/lib/register';

type Step = 'form' | 'otp';

export default function RegistroScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState<Step>('form');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSendOtp() {
    if (!fullName.trim() || !email.trim()) {
      setError('Nombre y email son obligatorios.');
      return;
    }
    setLoading(true);
    setError(null);
    const { error: otpError } = await sendRegistrationOtp(email, fullName);
    setLoading(false);
    if (otpError) {
      setError(translateAuthError(otpError.message));
      return;
    }
    setStep('otp');
  }

  async function handleVerifyOtp() {
    if (otp.trim().length < 6) {
      setError('Ingresa el código de 6 dígitos.');
      return;
    }
    setLoading(true);
    setError(null);
    const { error: verifyError } = await verifyRegistrationOtp(email, otp);
    if (verifyError) {
      setLoading(false);
      setError(translateAuthError(verifyError.message));
      return;
    }

    const profileResult = await ensureMobileSellerProfile(fullName, phone);
    setLoading(false);
    if (!profileResult.ok) {
      setError(
        profileResult.error?.includes('complete_mobile_registration')
          ? 'Falta aplicar la migración de registro en Supabase. Avísale al administrador.'
          : translateAuthError(profileResult.error ?? 'No se pudo crear el perfil')
      );
      return;
    }
  }

  async function handleResendOtp() {
    setOtp('');
    setError(null);
    await handleSendOtp();
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
            <Text style={s.cardTitle}>Crear cuenta</Text>
            <Text style={s.hint}>
              {step === 'form'
                ? 'Registro para vendedores. Te enviaremos un código de verificación a tu email.'
                : `Código enviado a ${email.trim().toLowerCase()}`}
            </Text>

            {step === 'form' ? (
              <>
                <Input
                  label="Nombre completo"
                  placeholder="María González"
                  value={fullName}
                  onChangeText={setFullName}
                  autoCapitalize="words"
                />
                <Input
                  label="Teléfono (opcional)"
                  placeholder="0414 0000000"
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={setPhone}
                />
                <Input
                  label="Email"
                  placeholder="tu@email.com"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  value={email}
                  onChangeText={setEmail}
                />
                {error ? <Text style={s.error}>{error}</Text> : null}
                <Button label="Enviar código" onPress={handleSendOtp} loading={loading} />
              </>
            ) : (
              <>
                <Input
                  label="Código de verificación"
                  placeholder="000000"
                  keyboardType="number-pad"
                  maxLength={6}
                  value={otp}
                  onChangeText={(t) => setOtp(t.replace(/\D/g, '').slice(0, 6))}
                />
                {error ? <Text style={s.error}>{error}</Text> : null}
                <Button label="Verificar y continuar" onPress={handleVerifyOtp} loading={loading} />
                <Pressable onPress={handleResendOtp} disabled={loading} style={s.linkBtn}>
                  <Text style={s.link}>Reenviar código</Text>
                </Pressable>
                <Pressable onPress={() => setStep('form')} style={s.linkBtn}>
                  <Text style={s.linkMuted}>Cambiar email</Text>
                </Pressable>
              </>
            )}

            <View
              style={{
                marginTop: 16,
                paddingTop: 16,
                borderTopWidth: 1,
                borderTopColor: colors.outlineVariant,
                alignItems: 'center',
              }}
            >
              <Pressable onPress={() => router.replace('/login')}>
                <Text style={s.footerText}>
                  ¿Ya tienes cuenta? <Text style={s.footerLink}>Iniciar sesión</Text>
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
