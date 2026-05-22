import { View, Text, TouchableOpacity, StyleSheet, Linking, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import QRCode from 'react-native-qrcode-svg';
import { colors } from '@canalpay/shared';

export default function OrdenCreadaScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    code: string;
    link: string;
    amount: string;
    currency: string;
    concept: string;
    phone?: string;
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
    <View style={styles.container}>
      <Text style={styles.code}>{params.code}</Text>
      <Text style={styles.amount}>
        {params.amount} {params.currency}
      </Text>
      <Text style={styles.concept}>{params.concept}</Text>

      {params.link ? (
        <View style={styles.qr}>
          <QRCode value={params.link} size={180} />
        </View>
      ) : null}

      <TouchableOpacity style={styles.btn} onPress={copyLink}>
        <Text style={styles.btnText}>Copiar link</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.btn, styles.wa]} onPress={shareWhatsApp}>
        <Text style={styles.btnText}>Enviar por WhatsApp</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.replace('/home')}>
        <Text style={styles.back}>Ir al inicio</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingTop: 56, backgroundColor: '#F7FAFC' },
  code: { fontSize: 22, fontWeight: '700', color: '#062B5F', fontFamily: 'monospace' },
  amount: { fontSize: 28, fontWeight: '700', color: '#00B8A9', marginVertical: 8 },
  concept: { color: '#64748B', marginBottom: 16 },
  qr: { alignSelf: 'center', marginVertical: 16, padding: 16, backgroundColor: '#fff', borderRadius: 12 },
  btn: { backgroundColor: '#00B8A9', padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 10 },
  wa: { backgroundColor: '#25D366' },
  btnText: { color: '#fff', fontWeight: '700' },
  back: { textAlign: 'center', color: '#64748B', marginTop: 24 },
});
