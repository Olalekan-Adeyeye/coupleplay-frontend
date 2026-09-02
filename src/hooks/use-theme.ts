import { Colors } from '@/constants/theme';

export function useTheme() {
  return Colors;
}

export function useStatusBarStyle() {
  return 'dark' as const;
}
