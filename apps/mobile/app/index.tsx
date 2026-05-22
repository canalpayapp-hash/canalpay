import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { colors } from '@canalpay/shared';

export default function Index() {
  const { loading, session, canMobile, gate } = useAuth();

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.teal} />
      </View>
    );
  }

  if (!session) return <Redirect href="/login" />;
  if (!canMobile) return <Redirect href="/sin-acceso" />;
  if (gate === 'inactive') return <Redirect href="/cuenta-inactiva" />;
  if (gate !== 'ok') return <Redirect href="/perfil-incompleto" />;

  return <Redirect href="/home" />;
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
});
