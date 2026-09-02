import { PLAY_SCREENS } from "@/features/games/registry";
import { useLocalSearchParams } from "expo-router";

export default function GamePlayDispatcher() {
  const { gameType } = useLocalSearchParams<{ gameType: string }>();
  const Screen = PLAY_SCREENS[gameType] ?? PLAY_SCREENS.TIC_TAC_TOE;
  return <Screen />;
}
