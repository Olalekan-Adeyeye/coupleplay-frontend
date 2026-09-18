import { ComponentType } from "react";
import TicTacToePlayScreen from "./tic-tac-toe/tic-tac-toe-play";
import TicTacToeResultsScreen from "./tic-tac-toe/tic-tac-toe-results";
import SpeedBattlePlayScreen from "./speed-battle/speed-battle-play";
import SpeedBattleResultsScreen from "./speed-battle/speed-battle-results";
import NumberHuntPlayScreen from "./number-hunt/number-hunt-play";
import NumberHuntResultsScreen from "./number-hunt/number-hunt-results";

export const PLAY_SCREENS: Record<string, ComponentType<any>> = {
  TIC_TAC_TOE: TicTacToePlayScreen,
  SPEED_BATTLE: SpeedBattlePlayScreen,
  NUMBER_HUNT: NumberHuntPlayScreen,
};

export const RESULTS_SCREENS: Record<string, ComponentType<any>> = {
  TIC_TAC_TOE: TicTacToeResultsScreen,
  SPEED_BATTLE: SpeedBattleResultsScreen,
  NUMBER_HUNT: NumberHuntResultsScreen,
};

/** Games with real play + results screens. Everything else is "Soon". */
export function isGameImplemented(gameId: string): boolean {
  return gameId in PLAY_SCREENS && gameId in RESULTS_SCREENS;
}
