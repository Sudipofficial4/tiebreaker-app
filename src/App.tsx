import { useState } from 'react';
import './App.css';
import GameSetup from './components/GameSetup';
import TournamentView from './components/TournamentView';
import { clearTournament, createTournament, loadTournament } from './tournamentLogic';
import type { Tournament } from './types';

function App() {
  const [tournament, setTournament] = useState<Tournament | null>(() => loadTournament());

  const handleStartTournament = (gameName: string, players: string[]) => {
    const newTournament = createTournament(gameName, players);
    setTournament(newTournament);
  };

  const handleReset = () => {
    clearTournament();
    setTournament(null);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>🏆 Tie-Sheet Generator</h1>
        <p>Multi-Round Tournament Management</p>
      </header>

      <main className="app-main">
        {!tournament ? (
          <GameSetup onStart={handleStartTournament} />
        ) : (
          <TournamentView tournament={tournament} onUpdate={setTournament} onReset={handleReset} />
        )}
      </main>

      <footer className="app-footer">
        <p>© 2025 Tie-Sheet Generator | Built for any game, any number of players</p>
      </footer>
    </div>
  );
}

export default App;
