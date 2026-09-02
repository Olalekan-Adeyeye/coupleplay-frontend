import Constants from 'expo-constants';
import { Platform } from 'react-native';

// When running in Expo Go on a physical device, "localhost" refers to the
// phone itself. The Expo dev server host (the PC's LAN IP) is the machine
// running the backend too, so derive the API host from it.

function resolveDevHost(): string | null {
  if (Platform.OS === 'web') return null;

  try {
    const hostUri = Constants.expoConfig?.hostUri ?? Constants.expoGoConfig?.debuggerHost;
    if (!hostUri) return null;
    const host = hostUri.split(':')[0];
    return host || null;
  } catch {
    return null;
  }
}

// On a physical device, "localhost"/"127.0.0.1" points at the phone, so
// treat those values as unset and fall back to the LAN host.
function isLoopback(url: string | undefined): boolean {
  if (!url) return true;
  return /^https?:\/\/(localhost|127\.0\.0\.1)([:/]|$)/i.test(url);
}

function effectiveBase(configured: string | undefined): string | null {
  if (configured && !(Platform.OS !== 'web' && isLoopback(configured))) {
    return configured;
  }
  return null;
}

export function getApiBaseUrl(): string {
  const configured = effectiveBase(process.env.EXPO_PUBLIC_API_URL);
  if (configured) return configured;

  const devHost = resolveDevHost();
  if (devHost) return `http://${devHost}:3000`;

  return 'http://localhost:3000';
}

export function getSocketBaseUrl(): string {
  const configured = effectiveBase(process.env.EXPO_PUBLIC_SOCKET_URL);
  if (configured) return configured;

  const devHost = resolveDevHost();
  if (devHost) return `http://${devHost}:3000/game`;

  return 'http://localhost:3000/game';
}
