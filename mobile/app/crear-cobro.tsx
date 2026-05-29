import { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import {
  SALES_CHANNELS,
  buildPaymentLink,
  colors,
  copy,
  getChannelLabel,
  spacing,
} from '@canalpay/shared';
import type { Branch, Currency, SalesChannel } from '@canalpay/shared';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { AppHeader } from '@/components/AppHeader';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

const APP_URL = process.env.EXPO_PUBLIC_APP_URL ?? 'http://localhost:3000';

export default function CrearCobroScreen() {
  const router = useRouter();
  const { session, profile } = useAuth();
  const merchantId = profile?.merchant_id ?? null;
  const [branches, setBranches] = useState<Branch[]>([]);
  const [branchId, setBranchId] = useState<string | null>(profile?.branch_id ?? null);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [channel, setChannel] = useState<SalesChannel>('whatsapp');
  const [concept, setConcept] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<Currency>('USD');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!merchantId) return;
    (async () => {
      const { data } = await supabase
        .from('branches')
        .select('id, merchant_id, name, status')
        .eq('merchant_id', merchantId)
        .eq('status', 'active');
      setBranches((data as Branch[]) ?? []);
    })();
  }, [merchantId]);

  async function crear() {
    const sellerId = session?.user?.id ?? null;
    if (!merchantId || !sellerId) {
      Alert.alert('Error', 'Perfil sin comercio. Ejecuta el seed en Supabase.');
      return;
    }
    const amt = parseFloat(amount.replace(',', '.'));
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
        id: order.id,
        code: order.public_code,
        link: order.payment_link ?? '',
        amount: String(order.amount),
        currency: order.currency,
        concept: order.concept,
        phone: customerPhone,
        channel,
      },
    });
  }

  return (
    <View style={styles.root}>
      <AppHeader title="Crear cobro" showBack />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.sub}>{copy.createChargeTagline}</Text>

        <Text style={styles.section}>Canal de venta</Text>
        <View style={styles.chips}>
          {SALES_CHANNELS.map((ch) => (
            <TouchableOpacity
              key={ch}
              style={[styles.chip, channel === ch && styles.chipOn]}
              onPress={() => setChannel(ch)}
            >
              <Text style={[styles.chipText, channel === ch && styles.chipTextOn]}>
                {getChannelLabel(ch)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {branches.length > 1 ? (
          <>
            <Text style={styles.section}>Sucursal</Text>
            <View style={styles.chips}>
              {branches.map((b) => (
                <TouchableOpacity
                  key={b.id}
                  style={[styles.chip, branchId === b.id && styles.chipOn]}
                  onPress={() => setBranchId(b.id)}
                >
                  <Text style={[styles.chipText, branchId === b.id && styles.chipTextOn]}>
                    {b.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        ) : null}

        <Input label="Cliente" placeholder="Nombre" value={customerName} onChangeText={setCustomerName} />
        <Input
          label="Teléfono"
          placeholder="+58 412 0000000"
          keyboardType="phone-pad"
          value={customerPhone}
          onChangeText={setCustomerPhone}
        />
        <Input label="Concepto" placeholder="Ej. Torta + delivery" value={concept} onChangeText={setConcept} />

        <Text style={styles.section}>Monto</Text>
        <View style={styles.currencyRow}>
          {(['USD', 'VES'] as Currency[]).map((c) => (
            <TouchableOpacity
              key={c}
              style={[styles.currencyBtn, currency === c && styles.currencyOn]}
              onPress={() => setCurrency(c)}
            >
              <Text style={[styles.currencyText, currency === c && styles.currencyTextOn]}>{c}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Input
          placeholder={currency === 'USD' ? '0.00' : '0'}
          keyboardType="decimal-pad"
          value={amount}
          onChangeText={setAmount}
        />

        <Button label="Generar orden de cobro" onPress={crear} loading={loading} style={{ marginTop: 8 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.md, paddingBottom: 40 },
  sub: { color: colors.onSurfaceVariant, marginBottom: 16 },
  section: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginTop: 8,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: colors.surfaceContainerHigh,
  },
  chipOn: { backgroundColor: colors.primary },
  chipText: { fontSize: 13, fontWeight: '600', color: colors.onSurfaceVariant },
  chipTextOn: { color: colors.onPrimary },
  currencyRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  currencyBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    alignItems: 'center',
  },
  currencyOn: { borderColor: colors.primary, backgroundColor: colors.secondaryContainer },
  currencyText: { fontWeight: '600', color: colors.onSurfaceVariant },
  currencyTextOn: { color: colors.primary },
});
