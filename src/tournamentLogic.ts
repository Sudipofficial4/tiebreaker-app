import type { Match, Tournament } from './types';

/**
 * Shuffle array using Fisher-Yates algorithm
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Generate matches for a round
 * @param players - List of player names
 * @param byeHistory - Record of how many byes each player has received
 * @param roundNumber - Current round number
 * @returns Object containing matches and updated bye history
 */
export function generateMatches(
  players: string[],
  byeHistory: Record<string, number>,
  roundNumber: number
): { matches: Match[]; byeHistory: Record<string, number> } {
  if (players.length === 0) {
    return { matches: [], byeHistory };
  }

  const shuffledPlayers = shuffleArray(players);
  const matches: Match[] = [];
  const updatedByeHistory = { ...byeHistory };

  // If odd number of players, assign bye to someone who hasn't had one
  let byePlayer: string | null = null;
  if (shuffledPlayers.length % 2 === 1) {
    // Find players who haven't received a bye yet
    const eligibleForBye = shuffledPlayers.filter(
      (player) => !updatedByeHistory[player] || updatedByeHistory[player] === 0
    );

    if (eligibleForBye.length > 0) {
      // Random selection from eligible players
      byePlayer = eligibleForBye[Math.floor(Math.random() * eligibleForBye.length)];
    } else {
      // If all have received a bye, pick the one with fewest byes
      byePlayer = shuffledPlayers.reduce((min, player) =>
        (updatedByeHistory[player] || 0) < (updatedByeHistory[min] || 0) ? player : min
      );
    }

    updatedByeHistory[byePlayer] = (updatedByeHistory[byePlayer] || 0) + 1;

    // Remove bye player from the list
    const byeIndex = shuffledPlayers.indexOf(byePlayer);
    shuffledPlayers.splice(byeIndex, 1);
  }

  // Create matches from remaining players
  for (let i = 0; i < shuffledPlayers.length; i += 2) {
    matches.push({
      id: `r${roundNumber}-m${matches.length + 1}`,
      player1: shuffledPlayers[i],
      player2: shuffledPlayers[i + 1],
      winner: null,
      status: 'pending',
    });
  }

  // Add bye match if applicable
  if (byePlayer) {
    matches.push({
      id: `r${roundNumber}-bye`,
      player1: byePlayer,
      player2: null,
      winner: byePlayer,
      status: 'finished',
    });
  }

  return { matches, byeHistory: updatedByeHistory };
}

/**
 * Get winners from a completed round
 */
export function getWinners(matches: Match[]): string[] {
  return matches.filter((m) => m.status === 'finished' && m.winner).map((m) => m.winner!);
}

/**
 * Check if all matches in a round are finished
 */
export function isRoundComplete(matches: Match[]): boolean {
  return matches.every((m) => m.status === 'finished');
}

/**
 * Create initial tournament
 */
export function createTournament(gameName: string, players: string[]): Tournament {
  const byeHistory: Record<string, number> = {};
  players.forEach((player) => {
    byeHistory[player] = 0;
  });

  const { matches, byeHistory: updatedByeHistory } = generateMatches(players, byeHistory, 1);

  return {
    gameName,
    players,
    rounds: [
      {
        roundNumber: 1,
        matches,
      },
    ],
    currentRound: 1,
    byeHistory: updatedByeHistory,
    isComplete: false,
    winner: null,
  };
}

/**
 * Advance to next round
 */
export function advanceRound(tournament: Tournament): Tournament {
  const currentRoundData = tournament.rounds[tournament.currentRound - 1];

  if (!isRoundComplete(currentRoundData.matches)) {
    throw new Error('Current round is not complete');
  }

  const winners = getWinners(currentRoundData.matches);

  // Check if tournament is complete
  if (winners.length === 1) {
    return {
      ...tournament,
      isComplete: true,
      winner: winners[0],
    };
  }

  const nextRoundNumber = tournament.currentRound + 1;
  const { matches, byeHistory: updatedByeHistory } = generateMatches(
    winners,
    tournament.byeHistory,
    nextRoundNumber
  );

  return {
    ...tournament,
    rounds: [
      ...tournament.rounds,
      {
        roundNumber: nextRoundNumber,
        matches,
      },
    ],
    currentRound: nextRoundNumber,
    byeHistory: updatedByeHistory,
  };
}

/**
 * Update match status
 */
export function updateMatch(
  tournament: Tournament,
  matchId: string,
  updates: Partial<Match>
): Tournament {
  const updatedRounds = tournament.rounds.map((round) => ({
    ...round,
    matches: round.matches.map((match) =>
      match.id === matchId ? { ...match, ...updates } : match
    ),
  }));

  return {
    ...tournament,
    rounds: updatedRounds,
  };
}

/**
 * Save tournament to localStorage
 */
export function saveTournament(tournament: Tournament): void {
  localStorage.setItem('tournament', JSON.stringify(tournament));
}

/**
 * Load tournament from localStorage
 */
export function loadTournament(): Tournament | null {
  const data = localStorage.getItem('tournament');
  return data ? JSON.parse(data) : null;
}

/**
 * Clear tournament from localStorage
 */
export function clearTournament(): void {
  localStorage.removeItem('tournament');
}
