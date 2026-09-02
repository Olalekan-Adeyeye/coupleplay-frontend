import { RESULTS_SCREENS } from "@/features/games/registry";
import { useLocalSearchParams } from "expo-router";

export default function GameResultsDispatcher() {
  const { gameType } = useLocalSearchParams<{ gameType: string }>();
  const Screen = RESULTS_SCREENS[gameType] ?? RESULTS_SCREENS.TIC_TAC_TOE;
  return <Screen />;
}
