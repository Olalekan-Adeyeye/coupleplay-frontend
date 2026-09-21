import rawGames from "./games.json";

export type GameIconName =
  | "tic_tac_toe"
  | "speed_battle"
  | "number_hunt";

export type GameStep = {
  icon: string;
  iconColor: string;
  title: string;
};

export type GameStats = {
  gamesPlayed: number;
  perfectMatches: number;
  winRate: number;
};

export type Game = {
  id: string;
  name: string;
  tag: string;
  tagColor: string;
  desc: string;
  players: string;
  duration: string;
  rounds: number;
  accent: string;
  icon: GameIconName;
  iconName?: string;
  emoji: string;
  heroImage?: GameIconName;
  objective?: string;
  popular?: boolean;
  /** Filter modes: quick | competitive | coop | brain */
  modes: string[];
  steps: GameStep[];
  stats: GameStats;
};

export const GAMES = rawGames as Game[];

export const GAME_IMAGES: Partial<Record<GameIconName, number>> = {
  tic_tac_toe: require("@/assets/images/tic_tac_toe.png"),
  speed_battle: require("@/assets/images/speed_battle.png"),
  number_hunt: require("@/assets/images/number_hunt.png"),
};

export function getGame(id: string | undefined): Game | undefined {
  return GAMES.find((g) => g.id === id);
}
