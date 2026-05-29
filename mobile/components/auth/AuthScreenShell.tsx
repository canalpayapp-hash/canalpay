import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from '@canalpay/shared';

export function AuthScreenShell({ children }: { children: ReactNode }) {
  return (
    <View style={styles.root}>
      <View style={[styles.blob, styles.blobTop]} />
      <View style={[styles.blob, styles.blobBottom]} />
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
    overflow: 'hidden',
  },
  blob: {
    position: 'absolute',
    borderRadius: 9999,
  },
  blobTop: {
    width: 320,
    height: 320,
    top: -80,
    right: -80,
    backgroundColor: colors.primary,
    opacity: 0.06,
  },
  blobBottom: {
    width: 260,
    height: 260,
    bottom: -60,
    left: -60,
    backgroundColor: colors.secondaryContainer,
    opacity: 0.35,
  },
  content: {
    flex: 1,
  },
});
