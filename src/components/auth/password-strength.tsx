/**
 * PasswordStrength — meter kekuatan password (register only).
 * Port `getPasswordStrength` dari register/page.tsx web: 4 segmen + label.
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';

function getPasswordStrength(
  password: string,
): { level: number; label: string; color: string } {
  if (password.length === 0) return { level: 0, label: '', color: '' };

  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { level: 1, label: 'Lemah', color: Colors.error };
  if (score === 2) return { level: 2, label: 'Cukup', color: Colors.tertiary };
  if (score === 3) return { level: 3, label: 'Kuat', color: Colors.secondary };
  return { level: 4, label: 'Sangat Kuat', color: Colors.secondary };
}

export default function PasswordStrength({
  password,
}: {
  password: string;
}): React.JSX.Element | null {
  if (password.length === 0) return null;

  const strength = getPasswordStrength(password);

  return (
    <View style={styles.wrapper}>
      <View style={styles.segments}>
        {[1, 2, 3, 4].map((i) => (
          <View
            key={i}
            style={[
              styles.segment,
              i <= strength.level
                ? { backgroundColor: strength.color }
                : { backgroundColor: Colors.outlineVariant },
            ]}
          />
        ))}
      </View>
      <Text style={[styles.label, { color: strength.color }]}>
        {strength.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: Spacing.half + 2,
  },
  segments: {
    flexDirection: 'row',
    gap: 4,
  },
  segment: {
    height: 4,
    flex: 1,
    borderRadius: Radius.full,
  },
  label: {
    fontFamily: Fonts.bodyMedium,
    fontSize: 11,
  },
});
