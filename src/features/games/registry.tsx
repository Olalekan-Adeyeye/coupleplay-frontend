import { ComponentType } from "react";
import TicTacToePlayScreen from "./tic-tac-toe/tic-tac-toe-play";
import TicTacToeResultsScreen from "./tic-tac-toe/tic-tac-toe-results";
import SpeedBattlePlayScreen from "./speed-battle/speed-battle-play";
import SpeedBattleResultsScreen from "./speed-battle/speed-battle-results";

export const PLAY_SCREENS: Record<string, ComponentType<any>> = {
  TIC_TAC_TOE: TicTacToePlayScreen,
  SPEED_BATTLE: SpeedBattlePlayScreen,
};

export const RESULTS_SCREENS: Record<string, ComponentType<any>> = {
  TIC_TAC_TOE: TicTacToeResultsScreen,
  SPEED_BATTLE: SpeedBattleResultsScreen,
};
