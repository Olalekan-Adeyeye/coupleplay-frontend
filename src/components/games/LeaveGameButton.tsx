import { Pressable, Text } from "react-native";

interface LeaveGameButtonProps {
  onPress: () => void;
}

export function LeaveGameButton({ onPress }: LeaveGameButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={10}
      accessibilityRole="button"
      accessibilityLabel="Leave game"
      className="items-center py-1 active:opacity-70"
    >
      <Text className="font-ui-semibold text-[14px] text-red-500">
        Leave Game
      </Text>
    </Pressable>
  );
}
