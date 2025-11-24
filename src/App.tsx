import { useState } from 'react';
import './App.css';
import Login from './components/Login';
import GameSetup from './components/GameSetup';
import TournamentView from './components/TournamentView';
import RunningMatches from './components/RunningMatches';
import CompletedMatches from './components/CompletedMatches';
import { useAuth } from './context/AuthContext';
import { clearTournament, createTournament, loadTournament } from './tournamentLogic';
import type { Tournament } from './types';

function App() {
  const { user, loading: authLoading, signOut } = useAuth();
  const [tournament, setTournament] = useState<Tournament | null>(() => loadTournament());
  const [showDashboards, setShowDashboards] = useState(false);

  const handleStartTournament = (gameName: string, players: string[]) => {
    const newTournament = createTournament(gameName, players);
    setTournament(newTournament);
  };

  const handleReset = () => {
    clearTournament();
    setTournament(null);
    setShowDashboards(false);
  };

  if (authLoading) {
    return <div className="loading-screen">Loading...</div>;
  }

  if (!user) {
    return <Login onSuccess={() => {}} />;
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>🏆 Tie-Sheet Generator</h1>
        <p>Multi-Round Tournament Management</p>
        <div className="header-actions">
          <span className="user-email">{user.email}</span>
          <button onClick={signOut} className="btn-logout">
            Sign Out
          </button>
        </div>
      </header>

      <main className="app-main">
        {!tournament ? (
          <GameSetup onStart={handleStartTournament} />
        ) : (
          <>
            <div className="tournament-controls">
              <button
                onClick={() => setShowDashboards(!showDashboards)}
                className="btn-dashboards"
              >
                {showDashboards ? 'Hide Dashboards' : 'Show Live Dashboards'}
              </button>
              <button onClick={handleReset} className="btn-reset">
                Reset Tournament
              </button>
            </div>

            {showDashboards && tournament.id && (
              <div className="dashboards-section">
                <RunningMatches tournamentId={tournament.id} />
                <CompletedMatches tournamentId={tournament.id} />
              </div>
            )}

            <TournamentView tournament={tournament} onUpdate={setTournament} onReset={handleReset} />
          </>
        )}
      </main>

      <footer className="app-footer">
        <p>© 2025 Tie-Sheet Generator | Built for any game, any number of players</p>
      </footer>
    </div>
  );
}

export default App;
