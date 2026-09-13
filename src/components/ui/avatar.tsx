import { Image } from 'expo-image';
import { PeepAvatar } from '@/components/peeps/PeepAvatar';

type AvatarProps = {
  uri?: string | null;
  /** Stored avatar value (PeepId) or legacy gender string. */
  avatar?: string | null;
  name?: string;
  size?: number;
};

/**
 * Avatar — photo if uploaded, otherwise STRICTLY Open Peeps.
 * Legacy gender/null values resolve deterministically via PeepAvatar.
 */
export function Avatar({ uri, avatar, name, size = 48 }: AvatarProps) {
  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={[{ width: size, height: size, borderRadius: size / 2 }]}
      />
    );
  }

  return <PeepAvatar peep={avatar} seed={name} name={name} size={size} />;
}
