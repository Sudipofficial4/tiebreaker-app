import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { updateMatch } from '../lib/supabaseService';
import type { DbMatch } from '../types';
import '../styles/Dashboards.css';

interface RunningMatchesProps {
  tournamentId: string;
}

export default function RunningMatches({ tournamentId }: RunningMatchesProps) {
  const [matches, setMatches] = useState<DbMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedWinner, setSelectedWinner] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchMatches();

    // Subscribe to real-time updates
    const subscription = supabase
      .from('matches')
      .on('*', () => {
        fetchMatches();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [tournamentId]);

  const fetchMatches = async () => {
    try {
      const { data, error: err } = await supabase
        .from('matches')
        .select('*')
        .eq('tournament_id', tournamentId)
        .eq('status', 'in-progress');

      if (err) throw err;
      setMatches(data || []);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFinishMatch = async (matchId: string) => {
    const winner = selectedWinner[matchId];
    if (!winner) {
      alert('Please select a winner');
      return;
    }

    try {
      await updateMatch(matchId, 'finished', winner);
      setSelectedWinner((prev) => {
        const updated = { ...prev };
        delete updated[matchId];
        return updated;
      });
      await fetchMatches();
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) return <div className="loading">Loading matches...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="dashboard-container">
      <h2>🔴 Running Matches</h2>
      {matches.length === 0 ? (
        <p className="empty-state">No matches currently running</p>
      ) : (
        <div className="matches-grid">
          {matches.map((match) => (
            <div key={match.id} className="match-card">
              <div className="match-header">
                <span className="status-badge running">In Progress</span>
              </div>
              <div className="match-body">
                <div className="player">
                  <span className="player-name">{match.player1_name}</span>
                </div>
                {match.player2_name ? (
                  <>
                    <div className="vs">VS</div>
                    <div className="player">
                      <span className="player-name">{match.player2_name}</span>
                    </div>
                  </>
                ) : (
                  <div className="bye-label">BYE</div>
                )}
              </div>
              <div className="match-footer">
                {match.player2_name && (
                  <>
                    <div className="winner-selector">
                      <select
                        value={selectedWinner[match.id] || ''}
                        onChange={(e) =>
                          setSelectedWinner((prev) => ({
                            ...prev,
                            [match.id]: e.target.value,
                          }))
                        }
                        className="winner-select"
                      >
                        <option value="">Select Winner</option>
                        <option value={match.player1_name}>{match.player1_name}</option>
                        <option value={match.player2_name}>{match.player2_name}</option>
                      </select>
                    </div>
                    <button
                      onClick={() => handleFinishMatch(match.id)}
                      className="btn-finish"
                      disabled={!selectedWinner[match.id]}
                    >
                      Finish
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
