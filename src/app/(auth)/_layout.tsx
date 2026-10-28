import { Stack } from 'expo-router';
import { usePalette } from '@/hooks/usePalette';

export default function AuthLayout() {
  const paper = usePalette().paper;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: paper },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
      <Stack.Screen name="forgot" />
    </Stack>
  );
}
