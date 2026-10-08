import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';

import { Colors, Fonts, Radius, ShadowSoft } from '@/constants/theme';

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
}

export default function PrimaryButton({
  label,
  onPress,
  loading,
  disabled,
}: PrimaryButtonProps): React.JSX.Element {
  const blocked = disabled === true || loading === true;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { opacity: disabled === true && !loading ? 0.5 : 1 },
      ]}
      onPress={onPress}
      disabled={blocked}
      activeOpacity={0.85}>
      {loading ? (
        <>
          <ActivityIndicator color={Colors.onPrimary} />
          <Text style={styles.label}>Memproses...</Text>
        </>
      ) : (
        <>
          <Text style={styles.label}>{label}</Text>
          <MaterialIcons
            name="arrow-forward"
            size={18}
            color={Colors.onPrimary}
          />
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingVertical: 16,
    ...ShadowSoft,
  },
  label: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 14,
    letterSpacing: 0.5,
    color: Colors.onPrimary,
  },
});