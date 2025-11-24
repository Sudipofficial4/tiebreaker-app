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
  id: string; // UUID from Supabase
  gameName: string;
  players: string[];
  rounds: Round[];
  currentRound: number;
  byeHistory: Record<string, number>; // playerName -> count of byes received
  isComplete: boolean;
  winner: string | null;
  adminId: string; // UUID from auth
  createdAt?: string;
  updatedAt?: string;
}

// Database types (Supabase schema)
export interface DbTournament {
  id: string;
  game_name: string;
  admin_id: string;
  is_complete: boolean;
  winner: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbPlayer {
  id: string;
  tournament_id: string;
  name: string;
  bye_count: number;
  created_at: string;
}

export interface DbRound {
  id: string;
  tournament_id: string;
  round_number: number;
  created_at: string;
}

export interface DbMatch {
  id: string;
  round_id: string;
  tournament_id: string;
  player1_name: string;
  player2_name: string | null;
  winner: string | null;
  status: MatchStatus;
  created_at: string;
  updated_at: string;
}
