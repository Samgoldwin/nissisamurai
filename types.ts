export enum PlayerType {
  PLAYER = 'PLAYER', // Bottom side, Blue
  AI = 'AI',         // Top side, Red (Acts as Player 2 in PvP)
}

export enum PieceType {
  SAMURAI = 'SAMURAI',
  PROTECTOR = 'PROTECTOR',
}

export type GameMode = 'PVE' | 'PVP';

export interface Position {
  row: number;
  col: number;
}

export interface Piece {
  id: string;
  type: PieceType;
  owner: PlayerType;
  position: Position;
  isPromoted: boolean; // Only for Protector
}

export interface GameConfig {
  gridSize: number;
  timeLimitMinutes: number;
}

export interface Move {
  from: Position;
  to: Position;
}

export interface Scoring {
  playerScore: number;
  aiScore: number;
  winner: PlayerType | 'DRAW' | null;
  reason: string;
}