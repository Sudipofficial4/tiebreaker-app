import { supabase } from './supabase';
import type { Tournament, DbMatch } from '../types';

/**
 * Create a new tournament in Supabase
 */
export async function createTournamentInDb(
    gameName: string,
    players: string[],
    adminId: string
): Promise<string> {
    const { data, error } = await supabase
        .from('tournaments')
        .insert({
            game_name: gameName,
            admin_id: adminId,
            is_complete: false,
            winner: null,
        })
        .select()
        .single();

    if (error) throw error;
    const tournamentId = data.id;

    // Insert players
    const playerRecords = players.map((name) => ({
        tournament_id: tournamentId,
        name,
        bye_count: 0,
    }));

    const { error: playersError } = await supabase.from('players').insert(playerRecords);
    if (playersError) throw playersError;

    return tournamentId;
}

/**
 * Fetch tournament with all data (players, rounds, matches)
 */
export async function fetchTournament(tournamentId: string): Promise<Tournament | null> {
    // Fetch tournament
    const { data: tournamentData, error: tournamentError } = await supabase
        .from('tournaments')
        .select('*')
        .eq('id', tournamentId)
        .single();

    if (tournamentError) throw tournamentError;
    if (!tournamentData) return null;

    // Fetch players
    const { data: playersData, error: playersError } = await supabase
        .from('players')
        .select('*')
        .eq('tournament_id', tournamentId);

    if (playersError) throw playersError;

    // Fetch rounds with matches
    const { data: roundsData, error: roundsError } = await supabase
        .from('rounds')
        .select('*, matches(*)')
        .eq('tournament_id', tournamentId)
        .order('round_number', { ascending: true });

    if (roundsError) throw roundsError;

    // Build bye history
    const byeHistory: Record<string, number> = {};
    (playersData || []).forEach((p) => {
        byeHistory[p.name] = p.bye_count;
    });

    // Map to Tournament type
    const tournament: Tournament = {
        id: tournamentData.id,
        gameName: tournamentData.game_name,
        adminId: tournamentData.admin_id,
        players: (playersData || []).map((p) => p.name),
        byeHistory,
        isComplete: tournamentData.is_complete,
        winner: tournamentData.winner,
        currentRound: (roundsData || []).length,
        rounds: (roundsData || []).map((r) => ({
            roundNumber: r.round_number,
            matches: (r.matches || []).map((m: DbMatch) => ({
                id: m.id,
                player1: m.player1_name,
                player2: m.player2_name,
                winner: m.winner,
                status: m.status,
            })),
        })),
        createdAt: tournamentData.created_at,
        updatedAt: tournamentData.updated_at,
    };

    return tournament;
}

/**
 * Fetch all tournaments for a user
 */
export async function fetchUserTournaments(adminId: string): Promise<Tournament[]> {
    const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .eq('admin_id', adminId)
        .order('created_at', { ascending: false });

    if (error) throw error;

    return Promise.all(
        (data || []).map(async (t) => {
            const tournament = await fetchTournament(t.id);
            return tournament!;
        })
    );
}

/**
 * Create a new round with matches
 */
export async function createRound(
    tournamentId: string,
    roundNumber: number,
    matches: any[]
): Promise<void> {
    // Create round
    const { data: roundData, error: roundError } = await supabase
        .from('rounds')
        .insert({
            tournament_id: tournamentId,
            round_number: roundNumber,
        })
        .select()
        .single();

    if (roundError) throw roundError;

    // Create matches
    const matchRecords = matches.map((m) => ({
        round_id: roundData.id,
        tournament_id: tournamentId,
        player1_name: m.player1,
        player2_name: m.player2,
        winner: m.winner,
        status: m.status,
    }));

    const { error: matchError } = await supabase.from('matches').insert(matchRecords);
    if (matchError) throw matchError;
}

/**
 * Update match status and winner
 */
export async function updateMatch(
    matchId: string,
    status: string,
    winner: string | null
): Promise<void> {
    const { error } = await supabase
        .from('matches')
        .update({
            status,
            winner,
            updated_at: new Date().toISOString(),
        })
        .eq('id', matchId);

    if (error) throw error;
}

/**
 * Update tournament completion status
 */
export async function completeTournament(tournamentId: string, winner: string): Promise<void> {
    const { error } = await supabase
        .from('tournaments')
        .update({
            is_complete: true,
            winner,
            updated_at: new Date().toISOString(),
        })
        .eq('id', tournamentId);

    if (error) throw error;
}

/**
 * Get running matches (status = 'in-progress')
 */
export async function getRunningMatches(tournamentId: string): Promise<DbMatch[]> {
    const { data, error } = await supabase
        .from('matches')
        .select('*')
        .eq('tournament_id', tournamentId)
        .eq('status', 'in-progress')
        .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
}

/**
 * Get completed matches (status = 'finished')
 */
export async function getCompletedMatches(tournamentId: string): Promise<DbMatch[]> {
    const { data, error } = await supabase
        .from('matches')
        .select('*')
        .eq('tournament_id', tournamentId)
        .eq('status', 'finished')
        .order('updated_at', { ascending: false });

    if (error) throw error;
    return data || [];
}

/**
 * Subscribe to match updates for a tournament
 */
export function subscribeToMatches(
    tournamentId: string,
    callback: (matches: DbMatch[]) => void
) {
    const channel = supabase
        .channel(`matches-${tournamentId}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'matches' }, async () => {
            const matches = await supabase
                .from('matches')
                .select('*')
                .eq('tournament_id', tournamentId);
            if (!matches.error) callback(matches.data || []);
        })
        .subscribe();
    
    return channel;
}
