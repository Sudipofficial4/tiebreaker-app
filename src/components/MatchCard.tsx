import type { Match } from '../types';
import './MatchCard.css';

interface MatchCardProps {
  match: Match;
  onUpdate: (matchId: string, updates: Partial<Match>) => void;
}

function MatchCard({ match, onUpdate }: MatchCardProps) {
  const handleStartMatch = () => {
    onUpdate(match.id, { status: 'in-progress' });
  };

  const handleSelectWinner = (winner: string) => {
    onUpdate(match.id, { winner });
  };

  const handleFinishMatch = () => {
    if (!match.winner) {
      alert('Please select a winner first');
      return;
    }
    onUpdate(match.id, { status: 'finished' });
  };

  const handleReset = () => {
    onUpdate(match.id, { status: 'pending', winner: null });
  };

  // Bye match (automatic win)
  if (match.player2 === null) {
    return (
      <div className="match-card bye-match">
        <div className="match-header">
          <span className="match-id">{match.id}</span>
          <span className="bye-badge">BYE</span>
        </div>
        <div className="match-content">
          <div className="player winner-player">
            <span className="player-name">{match.player1}</span>
            <span className="winner-icon">👑</span>
          </div>
          <div className="match-status">Automatic Advance</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`match-card ${match.status}`}>
      <div className="match-header">
        <span className="match-id">{match.id}</span>
        <span className={`status-badge ${match.status}`}>
          {match.status === 'pending' && '⏳ Pending'}
          {match.status === 'in-progress' && '▶️ In Progress'}
          {match.status === 'finished' && '✅ Finished'}
        </span>
      </div>

      <div className="match-content">
        <div
          className={`player ${match.winner === match.player1 ? 'winner-player' : ''} ${match.status === 'in-progress' ? 'selectable' : ''
            }`}
          onClick={
            match.status === 'in-progress'
              ? () => handleSelectWinner(match.player1)
              : undefined
          }
        >
          <span className="player-name">{match.player1}</span>
          {match.winner === match.player1 && <span className="winner-icon">👑</span>}
        </div>

        <div className="vs-divider">VS</div>

        <div
          className={`player ${match.winner === match.player2 ? 'winner-player' : ''} ${match.status === 'in-progress' ? 'selectable' : ''
            }`}
          onClick={
            match.status === 'in-progress'
              ? () => handleSelectWinner(match.player2!)
              : undefined
          }
        >
          <span className="player-name">{match.player2}</span>
          {match.winner === match.player2 && <span className="winner-icon">👑</span>}
        </div>
      </div>

      <div className="match-actions">
        {match.status === 'pending' && (
          <button className="action-btn start-btn" onClick={handleStartMatch}>
            Start Match
          </button>
        )}

        {match.status === 'in-progress' && (
          <>
            <p className="instruction">Click on winner's name, then finish</p>
            <button
              className="action-btn finish-btn"
              onClick={handleFinishMatch}
              disabled={!match.winner}
            >
              Finish Match
            </button>
          </>
        )}

        {match.status === 'finished' && (
          <button className="action-btn reset-btn" onClick={handleReset}>
            Reset Match
          </button>
        )}
      </div>
    </div>
  );
}

export default MatchCard;
