import rawGames from "./games.json";

export type GameIconName =
  | "tic_tac_toe"
  | "draw_guess"
  | "speed_battle"
  | "memory_match"
  | "would_you_rather";

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
  steps: GameStep[];
  stats: GameStats;
};

export const GAMES = rawGames as Game[];

export const GAME_IMAGES: Partial<Record<GameIconName, number>> = {
  tic_tac_toe: require("@/assets/images/tic_tac_toe.png"),
  draw_guess: require("@/assets/images/draw_guess.png"),
  speed_battle: require("@/assets/images/speed_battle.png"),
  memory_match: require("@/assets/images/memory_match.png"),
  would_you_rather: require("@/assets/images/would_you_rather.png"),
};

export function getGame(id: string | undefined): Game | undefined {
  return GAMES.find((g) => g.id === id);
}
