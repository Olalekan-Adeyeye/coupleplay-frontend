import { Pressable, StyleSheet, View } from 'react-native';
import { ThemedText } from '../themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Radius, Space, Shadows } from '@/constants/theme';

type ButtonProps = {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  icon?: string;
};

export function Button({ title, onPress, variant = 'primary', size = 'md', disabled, icon }: ButtonProps) {
  const theme = useTheme();

  const height = size === 'sm' ? 40 : size === 'md' ? 52 : 60;
  const px = size === 'sm' ? 16 : size === 'md' ? 24 : 32;

  const bg =
    variant === 'primary'
      ? theme.primary
      : variant === 'secondary'
        ? theme.backgroundAlt
        : 'transparent';

  const borderColor = variant === 'outline' ? theme.primary : 'transparent';
  const textColor = variant === 'primary' ? '#FFFFFF' : variant === 'outline' ? theme.primary : theme.text;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        {
          height,
          paddingHorizontal: px,
          backgroundColor: bg,
          borderWidth: variant === 'outline' ? 1.5 : 0,
          borderColor,
          opacity: pressed ? 0.85 : disabled ? 0.4 : 1,
          borderRadius: Radius.md,
        },
        variant === 'primary' && Shadows.sm,
      ]}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: Space.sm }}>
        {icon && <ThemedText style={{ fontSize: 18 }}>{icon}</ThemedText>}
        <ThemedText
          type={size === 'sm' ? 'bodySmall' : 'body'}
          style={{ color: textColor, fontWeight: '700', textAlign: 'center', flex: icon ? 0 : 1 }}
        >
          {title}
        </ThemedText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
});
