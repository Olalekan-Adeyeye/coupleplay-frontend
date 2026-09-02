import { TextInput, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/use-theme';
import { Radius, Space, Shadows } from '@/constants/theme';

type InputProps = {
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoFocus?: boolean;
};

export function Input({
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
  autoFocus,
}: InputProps) {
  const theme = useTheme();

  return (
    <TextInput
      style={[
        styles.input,
        {
          backgroundColor: theme.surface,
          color: theme.text,
          borderColor: theme.surfaceBorder,
        },
        Shadows.sm,
      ]}
      placeholder={placeholder}
      placeholderTextColor={theme.textTertiary}
      value={value}
      onChangeText={onChangeText}
      secureTextEntry={secureTextEntry}
      keyboardType={keyboardType}
      autoCapitalize={autoCapitalize}
      autoFocus={autoFocus}
      selectionColor={theme.primary}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    borderRadius: Radius.md,
    paddingHorizontal: Space.md,
    paddingVertical: 14,
    fontSize: 16,
    borderWidth: 1,
    fontFamily: undefined,
    fontWeight: '500',
  },
});
