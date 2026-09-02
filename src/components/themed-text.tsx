import { Text, type TextProps } from 'react-native';
import { useTheme } from '@/hooks/use-theme';
import { TypeScale, ThemeColor } from '@/constants/theme';

export type ThemedTextProps = TextProps & {
  type?: keyof typeof TypeScale;
  themeColor?: ThemeColor;
  align?: 'left' | 'center' | 'right';
};

export function ThemedText({ style, type = 'body', themeColor, align, ...rest }: ThemedTextProps) {
  const theme = useTheme();
  const scale = TypeScale[type];

  return (
    <Text
      style={[
        { color: theme[themeColor ?? 'text'] },
        scale,
        align ? { textAlign: align } : undefined,
        style,
      ]}
      {...rest}
    />
  );
}



