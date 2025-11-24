import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { DbMatch } from '../types';

interface CompletedMatchesProps {
    tournamentId: string;
}

export default function CompletedMatches({ tournamentId }: CompletedMatchesProps) {
    const [matches, setMatches] = useState<DbMatch[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchMatches();

        // Subscribe to real-time updates
        const channel = supabase
            .channel('completed-matches')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'matches' }, () => {
                fetchMatches();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [tournamentId]);

    const fetchMatches = async () => {
        try {
            const { data, error: err } = await supabase
                .from('matches')
                .select('*')
                .eq('tournament_id', tournamentId)
                .eq('status', 'finished')
                .order('updated_at', { ascending: false });

            if (err) throw err;
            setMatches(data || []);
            setError(null);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="loading">Loading matches...</div>;
    if (error) return <div className="error">Error: {error}</div>;

    return (
        <div className="dashboard-container">
            <h2>✅ Completed Matches</h2>
            {matches.length === 0 ? (
                <p className="empty-state">No completed matches yet</p>
            ) : (
                <div className="matches-grid">
                    {matches.map((match) => (
                        <div key={match.id} className="match-card">
                            <div className="match-header">
                                <span className="status-badge finished">Finished</span>
                            </div>
                            <div className="match-body">
                                <div className="player">
                                    <span className="player-name">{match.player1_name}</span>
                                    {match.winner === match.player1_name && <span className="winner-badge">👑</span>}
                                </div>
                                {match.player2_name ? (
                                    <>
                                        <div className="vs">VS</div>
                                        <div className="player">
                                            <span className="player-name">{match.player2_name}</span>
                                            {match.winner === match.player2_name && (
                                                <span className="winner-badge">👑</span>
                                            )}
                                        </div>
                                    </>
                                ) : (
                                    <div className="bye-label">BYE ✓</div>
                                )}
                            </div>
                            {match.winner && (
                                <div className="match-footer">
                                    <p className="winner-info">Winner: <strong>{match.winner}</strong></p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
