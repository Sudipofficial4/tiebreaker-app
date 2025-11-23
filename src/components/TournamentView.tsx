import { useEffect } from 'react';
import {
  advanceRound,
  isRoundComplete,
  saveTournament,
  updateMatch,
} from '../tournamentLogic';
import type { Tournament } from '../types';
import MatchCard from './MatchCard';
import './TournamentView.css';

interface TournamentViewProps {
  tournament: Tournament;
  onUpdate: (tournament: Tournament) => void;
  onReset: () => void;
}

function TournamentView({ tournament, onUpdate, onReset }: TournamentViewProps) {
  const currentRoundData = tournament.rounds[tournament.currentRound - 1];
  const roundComplete = isRoundComplete(currentRoundData.matches);

  // Auto-save on every update
  useEffect(() => {
    saveTournament(tournament);
  }, [tournament]);

  const handleMatchUpdate = (matchId: string, updates: Partial<typeof currentRoundData.matches[0]>) => {
    const updatedTournament = updateMatch(tournament, matchId, updates);
    onUpdate(updatedTournament);
  };

  const handleAdvanceRound = () => {
    try {
      const updatedTournament = advanceRound(tournament);
      onUpdate(updatedTournament);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to advance round');
    }
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(tournament, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${tournament.gameName.replace(/\s+/g, '_')}_tournament.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  if (tournament.isComplete) {
    return (
      <div className="tournament-complete">
        <div className="winner-card">
          <h2>🏆 Tournament Complete! 🏆</h2>
          <div className="winner-announcement">
            <p className="winner-label">Winner:</p>
            <p className="winner-name">{tournament.winner}</p>
          </div>
          <div className="tournament-stats">
            <div className="stat">
              <span className="stat-label">Game:</span>
              <span className="stat-value">{tournament.gameName}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Total Players:</span>
              <span className="stat-value">{tournament.players.length}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Rounds Played:</span>
              <span className="stat-value">{tournament.rounds.length}</span>
            </div>
          </div>
          <div className="action-buttons">
            <button className="export-btn" onClick={handleExport}>
              Export Tournament Data
            </button>
            <button className="reset-btn" onClick={onReset}>
              Start New Tournament
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="tournament-view">
      <div className="tournament-header">
        <div className="tournament-info">
          <h2>{tournament.gameName}</h2>
          <p className="round-info">
            Round {tournament.currentRound} of {tournament.rounds.length}
            {roundComplete && !tournament.isComplete && ' - Ready to advance!'}
          </p>
        </div>
        <div className="header-actions">
          <button className="utility-btn" onClick={handlePrint}>
            🖨️ Print
          </button>
          <button className="utility-btn" onClick={handleExport}>
            💾 Export
          </button>
          <button className="utility-btn reset" onClick={onReset}>
            🔄 Reset
          </button>
        </div>
      </div>

      <div className="matches-grid">
        {currentRoundData.matches.map((match) => (
          <MatchCard key={match.id} match={match} onUpdate={handleMatchUpdate} />
        ))}
      </div>

      {roundComplete && !tournament.isComplete && (
        <div className="advance-section">
          <button className="advance-btn" onClick={handleAdvanceRound}>
            Advance to Next Round →
          </button>
        </div>
      )}

      <div className="tournament-progress">
        <h3>Tournament Progress</h3>
        <div className="rounds-summary">
          {tournament.rounds.map((round) => (
            <div
              key={round.roundNumber}
              className={`round-summary ${round.roundNumber === tournament.currentRound ? 'current' : ''
                }`}
            >
              <span className="round-label">Round {round.roundNumber}</span>
              <span className="matches-count">{round.matches.length} matches</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default TournamentView;
