import { View, Text, StyleSheet, Linking, Alert, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import QRCode from 'react-native-qrcode-svg';
import { Ionicons } from '@expo/vector-icons';
import {
  colors,
  formatCurrency,
  getChannelLabel,
  getPaymentStatusLabel,
  radius,
  spacing,
} from '@canalpay/shared';
import { AppHeader } from '@/components/AppHeader';
import { Button } from '@/components/ui/Button';

export default function OrdenCreadaScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    id?: string;
    code: string;
    link: string;
    amount: string;
    currency: string;
    concept: string;
    phone?: string;
    channel?: string;
  }>();

  const message = `Hola, aquí tienes tu link de pago por ${params.amount} ${params.currency} para ${params.concept}: ${params.link}`;

  async function copyLink() {
    await Clipboard.setStringAsync(params.link);
    Alert.alert('Copiado', 'Link copiado al portapapeles');
  }

  function shareWhatsApp() {
    const phone = (params.phone ?? '').replace(/\D/g, '');
    const url = phone
      ? `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
      : `https://wa.me/?text=${encodeURIComponent(message)}`;
    Linking.openURL(url);
  }

  return (
    <View style={styles.root}>
      <AppHeader title="CanalPay" showBack />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.statusPill}>
          <Ionicons name="time-outline" size={16} color={colors.tertiary} />
          <Text style={styles.statusText}>{getPaymentStatusLabel('unpaid')}</Text>
        </View>
        <Text style={styles.headline}>Orden creada</Text>
        <Text style={styles.code}>{params.code}</Text>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>TOTAL A PAGAR</Text>
          <Text style={styles.cardAmount}>
            {formatCurrency(Number(params.amount), params.currency)}
          </Text>
          <View style={styles.grid}>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>CONCEPTO</Text>
              <Text style={styles.gridValue}>{params.concept}</Text>
            </View>
            {params.channel ? (
              <View style={styles.gridItem}>
                <Text style={styles.gridLabel}>CANAL</Text>
                <Text style={[styles.gridValue, { color: colors.whatsapp }]}>
                  {getChannelLabel(params.channel)}
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        {params.link ? (
          <View style={styles.qrBox}>
            <QRCode value={params.link} size={160} />
            <Text style={styles.qrHint}>Escanea para pagar directamente</Text>
          </View>
        ) : null}

        <TouchableOpacity style={styles.linkRow} onPress={copyLink}>
          <Ionicons name="link" size={20} color={colors.primary} />
          <Text style={styles.linkText} numberOfLines={1}>
            {params.link}
          </Text>
          <View style={styles.copyBtn}>
            <Text style={styles.copyBtnText}>Copiar</Text>
          </View>
        </TouchableOpacity>

        <Button label="Enviar por WhatsApp" variant="whatsapp" onPress={shareWhatsApp} />
        <Button
          label="Ver orden"
          variant="outline"
          onPress={() => {
            if (params.id) router.replace(`/orden/${params.id}`);
            else router.replace('/(tabs)/ordenes');
          }}
          style={{ marginTop: 10 }}
        />
        <TouchableOpacity onPress={() => router.replace('/(tabs)')} style={{ marginTop: 20 }}>
          <Text style={styles.homeLink}>Ir al inicio</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.md, alignItems: 'center', paddingBottom: 40 },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.tertiaryFixed,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
    marginTop: 8,
  },
  statusText: { fontSize: 12, fontWeight: '600', color: colors.tertiary },
  headline: { fontSize: 22, fontWeight: '700', color: colors.onSurface, marginTop: 12 },
  code: { fontSize: 36, fontWeight: '700', color: colors.primary, letterSpacing: -1, marginBottom: 16 },
  card: {
    width: '100%',
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    padding: spacing.lg,
  },
  cardLabel: { fontSize: 12, color: colors.onSurfaceVariant, fontWeight: '600' },
  cardAmount: { fontSize: 28, fontWeight: '700', color: colors.primary, marginVertical: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, borderTopWidth: 1, borderTopColor: colors.outlineVariant, paddingTop: 16, marginTop: 8 },
  gridItem: { width: '45%' },
  gridLabel: { fontSize: 11, color: colors.onSurfaceVariant, fontWeight: '600' },
  gridValue: { fontSize: 15, fontWeight: '600', color: colors.onSurface, marginTop: 4 },
  qrBox: {
    marginTop: spacing.lg,
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  qrHint: { marginTop: 12, fontSize: 12, color: colors.onSurfaceVariant },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: '100%',
    backgroundColor: colors.surfaceContainerHighest,
    borderRadius: radius.md,
    padding: 14,
    marginVertical: spacing.lg,
  },
  linkText: { flex: 1, fontSize: 13, color: colors.onSurface },
  copyBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
  },
  copyBtnText: { color: colors.onPrimary, fontSize: 12, fontWeight: '600' },
  homeLink: { textAlign: 'center', color: colors.onSurfaceVariant },
});
