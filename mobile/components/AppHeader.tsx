import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@canalpay/shared';

export function AppHeader({
  title = 'CanalPay',
  showBack,
  right,
}: {
  title?: string;
  showBack?: boolean;
  right?: React.ReactNode;
}) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.bar, { paddingTop: insets.top }]}>
      <View style={styles.row}>
        {showBack ? (
          <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn} hitSlop={8}>
            <Ionicons name="arrow-back" size={24} color={colors.primary} />
          </TouchableOpacity>
        ) : (
          <View style={styles.iconPlaceholder} />
        )}
        <Text style={styles.title}>{title}</Text>
      </View>
      <View style={styles.right}>{right ?? <View style={styles.iconPlaceholder} />}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.outlineVariant,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  title: { fontSize: 20, fontWeight: '700', color: colors.primary },
  iconBtn: { padding: 4 },
  iconPlaceholder: { width: 32 },
  right: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});
