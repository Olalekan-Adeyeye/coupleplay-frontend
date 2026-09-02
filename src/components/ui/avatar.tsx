import { View, Image, StyleSheet, Text } from 'react-native';
import { useTheme } from '@/hooks/use-theme';

type AvatarProps = {
  uri?: string | null;
  name?: string;
  size?: number;
};

export function Avatar({ uri, name, size = 48 }: AvatarProps) {
  const theme = useTheme();
  const initials = name
    ? name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={[{ width: size, height: size, borderRadius: size / 2 }]}
      />
    );
  }

  return (
    <View
      style={[
        styles.fallback,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: theme.primary,
        },
      ]}
    >
      <Text style={[styles.initials, { fontSize: size * 0.38 }]}>
        {initials}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
