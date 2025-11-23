export type MatchStatus = 'pending' | 'in-progress' | 'finished';

export interface Match {
  id: string;
  player1: string;
  player2: string | null; // null indicates a bye
  winner: string | null;
  status: MatchStatus;
}

export interface Round {
  roundNumber: number;
  matches: Match[];
}

export interface Tournament {
  gameName: string;
  players: string[];
  rounds: Round[];
  currentRound: number;
  byeHistory: Record<string, number>; // playerName -> count of byes received
  isComplete: boolean;
  winner: string | null;
}
