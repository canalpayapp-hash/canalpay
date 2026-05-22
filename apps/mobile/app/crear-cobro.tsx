import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, copy, buildPaymentLink } from '@canalpay/shared';
import { supabase } from '@/lib/supabase';

const APP_URL = process.env.EXPO_PUBLIC_APP_URL ?? 'http://localhost:3000';

export default function CrearCobroScreen() {
  const router = useRouter();
  const { session, profile } = useAuth();
  const merchantId = profile?.merchant_id ?? null;
  const branchId = profile?.branch_id ?? null;
  const sellerId = session?.user?.id ?? null;
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [channel, setChannel] = useState('whatsapp');
  const [concept, setConcept] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<'VES' | 'USD'>('USD');
  const [loading, setLoading] = useState(false);

  async function crear() {
    if (!merchantId || !sellerId) {
      Alert.alert('Error', 'Perfil sin comercio. Ejecuta el seed en Supabase.');
      return;
    }
    const amt = parseFloat(amount);
    if (!concept || !amt || amt <= 0) {
      Alert.alert('Validación', 'Concepto y monto mayor a cero son obligatorios.');
      return;
    }
    if (!customerName && !customerPhone) {
      Alert.alert('Validación', 'Indica al menos nombre o teléfono del cliente.');
      return;
    }

    setLoading(true);
    let customerId: string | null = null;

    if (customerName || customerPhone) {
      const { data: c, error: cErr } = await supabase
        .from('customers')
        .insert({
          merchant_id: merchantId,
          name: customerName || 'Cliente',
          phone: customerPhone || null,
          channel_default: channel,
        })
        .select('id')
        .single();
      if (cErr) {
        setLoading(false);
        Alert.alert('Error', cErr.message);
        return;
      }
      customerId = c.id;
    }

    const { data: codeData } = await supabase.rpc('generate_public_code');
    const publicCode = codeData as string;

    const paymentLink = buildPaymentLink(APP_URL, publicCode);

    const { data: order, error } = await supabase
      .from('orders')
      .insert({
        public_code: publicCode,
        merchant_id: merchantId,
        branch_id: branchId,
        customer_id: customerId,
        seller_id: sellerId,
        channel,
        concept,
        amount: amt,
        currency,
        status: 'pending_payment',
        payment_status: 'unpaid',
        payment_link: paymentLink,
        qr_payload: paymentLink,
      })
      .select('id, public_code, payment_link, amount, currency, concept, payment_status')
      .single();

    setLoading(false);
    if (error) {
      Alert.alert('Error', error.message);
      return;
    }

    router.push({
      pathname: '/orden-creada',
      params: {
        code: order.public_code,
        link: order.payment_link ?? '',
        amount: String(order.amount),
        currency: order.currency,
        concept: order.concept,
        phone: customerPhone,
      },
    });
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Crear cobro</Text>
      <Text style={styles.sub}>{copy.createChargeTagline}</Text>

      <TextInput
        style={styles.input}
        placeholder="Nombre cliente"
        value={customerName}
        onChangeText={setCustomerName}
      />
      <TextInput
        style={styles.input}
        placeholder="Teléfono"
        keyboardType="phone-pad"
        value={customerPhone}
        onChangeText={setCustomerPhone}
      />
      <TextInput
        style={styles.input}
        placeholder="Concepto"
        value={concept}
        onChangeText={setConcept}
      />
      <TextInput
        style={styles.input}
        placeholder="Monto"
        keyboardType="decimal-pad"
        value={amount}
        onChangeText={setAmount}
      />

      <TouchableOpacity style={styles.btn} onPress={crear} disabled={loading}>
        <Text style={styles.btnText}>{loading ? 'Generando…' : 'Generar orden de cobro'}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.back}>Volver</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 24, paddingTop: 56 },
  title: { fontSize: 22, fontWeight: '700', color: colors.navy },
  sub: { color: colors.gray, marginBottom: 16 },
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
  },
  btnText: { color: colors.white, fontWeight: '700' },
  back: { textAlign: 'center', color: colors.gray, marginTop: 16 },
});
