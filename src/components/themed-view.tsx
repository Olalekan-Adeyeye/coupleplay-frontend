import { View, type ViewProps } from 'react-native';
import { useTheme } from '@/hooks/use-theme';
import { ThemeColor } from '@/constants/theme';

export type ThemedViewProps = ViewProps & {
  type?: ThemeColor;
};

export function ThemedView({ style, type, ...otherProps }: ThemedViewProps) {
  const theme = useTheme();

  return <View style={[{ backgroundColor: theme[type ?? 'background'] }, style]} {...otherProps} />;
}
