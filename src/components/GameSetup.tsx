import { useState } from 'react';
import './GameSetup.css';

interface GameSetupProps {
  onStart: (gameName: string, players: string[]) => void;
}

function GameSetup({ onStart }: GameSetupProps) {
  const [gameName, setGameName] = useState('');
  const [playerInput, setPlayerInput] = useState('');
  const [players, setPlayers] = useState<string[]>([]);
  const [error, setError] = useState('');

  const handleAddPlayer = () => {
    const trimmed = playerInput.trim();
    if (!trimmed) {
      setError('Player name cannot be empty');
      return;
    }
    if (players.includes(trimmed)) {
      setError('Player name already exists');
      return;
    }
    setPlayers([...players, trimmed]);
    setPlayerInput('');
    setError('');
  };

  const handleBulkAdd = () => {
    const lines = playerInput
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    const duplicates: string[] = [];
    const newPlayers: string[] = [];

    lines.forEach((name) => {
      if (players.includes(name) || newPlayers.includes(name)) {
        duplicates.push(name);
      } else {
        newPlayers.push(name);
      }
    });

    if (duplicates.length > 0) {
      setError(`Duplicate players: ${duplicates.join(', ')}`);
      return;
    }

    setPlayers([...players, ...newPlayers]);
    setPlayerInput('');
    setError('');
  };

  const handleRemovePlayer = (playerToRemove: string) => {
    setPlayers(players.filter((p) => p !== playerToRemove));
  };

  const handleStart = () => {
    if (!gameName.trim()) {
      setError('Please enter a game name');
      return;
    }
    if (players.length < 2) {
      setError('At least 2 players are required');
      return;
    }
    onStart(gameName.trim(), players);
  };

  return (
    <div className="game-setup">
      <div className="setup-card">
        <h2>Setup Tournament</h2>

        <div className="form-group">
          <label htmlFor="game-name">Game Name</label>
          <input
            id="game-name"
            type="text"
            placeholder="e.g., Chess, FIFA 24, Poker..."
            value={gameName}
            onChange={(e) => setGameName(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="player-input">Add Players</label>
          <textarea
            id="player-input"
            rows={5}
            placeholder="Enter player names (one per line for bulk add, or single name)"
            value={playerInput}
            onChange={(e) => setPlayerInput(e.target.value)}
          />
          <div className="button-group">
            <button type="button" onClick={handleAddPlayer} disabled={!playerInput.trim()}>
              Add Single Player
            </button>
            <button type="button" onClick={handleBulkAdd} disabled={!playerInput.trim()}>
              Bulk Add (Paste Multiple)
            </button>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="players-list">
          <h3>Players ({players.length})</h3>
          {players.length === 0 ? (
            <p className="empty-state">No players added yet</p>
          ) : (
            <ul>
              {players.map((player) => (
                <li key={player}>
                  <span>{player}</span>
                  <button
                    type="button"
                    className="remove-btn"
                    onClick={() => handleRemovePlayer(player)}
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <button
          type="button"
          className="start-btn"
          onClick={handleStart}
          disabled={players.length < 2 || !gameName.trim()}
        >
          Start Tournament
        </button>
      </div>
    </div>
  );
}

export default GameSetup;
