import { View, Text } from "react-native";

interface StatRowProps {
  label: string;
  mine: string;
  theirs: string;
  myColor?: string;
  theirColor?: string;
}

export function StatRow({
  label,
  mine,
  theirs,
  myColor = "text-primary",
  theirColor = "text-accent",
}: StatRowProps) {
  return (
    <View className="flex-row items-center py-2.5">
      <Text className={`w-14 font-display-bold text-[17px] ${myColor}`}>
        {mine}
      </Text>
      <Text className="flex-1 text-center font-ui-medium text-[14px] text-ink">
        {label}
      </Text>
      <Text className={`w-14 text-right font-display-bold text-[17px] ${theirColor}`}>
        {theirs}
      </Text>
    </View>
  );
}
