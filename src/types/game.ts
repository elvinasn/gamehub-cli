import { GameType } from "./game-type";

export interface Game {
  id: string;
  title: string;
  gameType: GameType;
}
