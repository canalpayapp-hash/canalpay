import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '@canalpay/shared';

export function BancaribeAlliance() {
  return (
    <View style={styles.wrap}>
      <Text style={styles.line}>
        <Text style={styles.muted}>en alianza con </Text>
        <Text style={styles.brand}>BANCARIBE</Text>
        <Text style={styles.rocket}>  🚀</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    marginTop: spacing.lg,
    paddingTop: spacing.md,
  },
  line: {
    textAlign: 'center',
  },
  muted: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.onSurfaceVariant,
    letterSpacing: 0.3,
  },
  brand: {
    fontSize: 12,
    fontWeight: '800',
    fontStyle: 'italic',
    color: colors.onBackground,
  },
  rocket: {
    fontSize: 12,
  },
});
