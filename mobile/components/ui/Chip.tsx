import { TouchableOpacity, Text, StyleSheet, ScrollView } from 'react-native';
import { colors, radius } from '@canalpay/shared';

export function ChipRow({
  options,
  value,
  onChange,
}: {
  options: { id: string; label: string }[];
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {options.map((opt) => {
        const active = opt.id === value;
        return (
          <TouchableOpacity
            key={opt.id}
            style={[styles.chip, active && styles.chipActive]}
            onPress={() => onChange(opt.id)}
          >
            <Text style={[styles.text, active && styles.textActive]}>{opt.label}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { gap: 8, paddingVertical: 4 },
  chip: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceContainerHigh,
  },
  chipActive: { backgroundColor: colors.primary },
  text: { fontSize: 12, fontWeight: '600', color: colors.onSurfaceVariant },
  textActive: { color: colors.onPrimary },
});
