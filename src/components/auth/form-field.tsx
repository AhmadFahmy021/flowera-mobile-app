import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React, {useState} from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';

interface FormFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  icon: React.ComponentProps<typeof MaterialIcons>['name'];
  secureTextEntry?: boolean;
  error?: string;
  match?: boolean;
  autoCapitalize?: 'none' | 'words' | 'sentences';
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
}

export default function FormField({
  label,
  value,
  onChangeText,
  placeholder,
  icon,
  secureTextEntry,
  error,
  match,
  autoCapitalize,
  keyboardType,
}: FormFieldProps): React.JSX.Element {
  const [hidden, setHidden] = useState(true);
  const isPassword = secureTextEntry === true;

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>

      <View style={styles.inputWrapper}>
        <MaterialIcons
          name={icon}
          size={20}
          color={Colors.outline}
          style={styles.leftIcon}
        />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={Colors.outline}
          style={styles.input}
          secureTextEntry={isPassword && hidden}
          autoCapitalize={autoCapitalize}
          keyboardType={keyboardType}
          autoCorrect={false}
        />

        {match ? (
          <MaterialIcons
            name="check-circle"
            size={18}
            color={Colors.secondary}
            style={styles.matchIcon}
          />
        ) : null}

        {isPassword ? (
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setHidden((v) => !v)}
            hitSlop={Spacing.one}
            activeOpacity={0.7}>
            <MaterialIcons
              name={hidden ? 'visibility' : 'visibility-off'}
              size={20}
              color={Colors.outline}
            />
          </TouchableOpacity>
        ) : null}
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: Spacing.half + 2,
  },
  label: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 13,
    color: Colors.onSurface,
  },
  inputWrapper: {
    position: 'relative',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    borderRadius: Radius.md,
  },
  leftIcon: {
    position: 'absolute',
    left: Spacing.three,
    zIndex: 1,
  },
  input: {
    fontFamily: Fonts.body,
    fontSize: 14,
    color: Colors.onSurface,
    paddingLeft: 44,
    paddingRight: 44,
    paddingVertical: 14,
  },
  eyeButton: {
    position: 'absolute',
    right: Spacing.three,
    zIndex: 1,
  },
  matchIcon: {
    position: 'absolute',
    right: 44,
    zIndex: 1,
  },
  error: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: Colors.error,
  },
});