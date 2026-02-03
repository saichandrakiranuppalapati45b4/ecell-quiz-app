import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/Button';
import { Trophy, ArrowLeft, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

const LeaderboardPage = () => {
    const navigate = useNavigate();
    const [participants, setParticipants] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchLeaderboard = useCallback(async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('participants')
                .select('name, score, created_at')
                .order('score', { ascending: false })
                .order('created_at', { ascending: true })
                .limit(50);

            if (error) throw error;
            if (data) setParticipants(data);
        } catch (err) {
            console.error('Error fetching leaderboard:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchLeaderboard();
    }, [fetchLeaderboard]);

    return (
        <div className="min-h-screen bg-black text-white p-4 md:p-8">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <Button variant="ghost" onClick={() => navigate('/')} className="text-gray-400 hover:text-white pl-0 hover:bg-transparent">
                        <ArrowLeft size={20} className="mr-2" /> Back
                    </Button>
                    <h1 className="text-3xl font-bold text-gold flex items-center gap-3">
                        <Trophy className="text-gold" size={32} /> Leaderboard
                    </h1>
                    <Button
                        variant="ghost"
                        onClick={fetchLeaderboard}
                        className="text-gold hover:text-white hover:bg-white/10 p-2 rounded-full transition-all"
                        title="Refresh List"
                    >
                        <RefreshCw size={24} className={loading ? "animate-spin" : ""} />
                    </Button>
                </div>

                {/* List */}
                <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden backdrop-blur-sm shadow-xl">
                    <table className="w-full text-left">
                        <thead className="bg-black/40 text-gray-400 text-sm uppercase tracking-wider">
                            <tr>
                                <th className="p-4 pl-6">Rank</th>
                                <th className="p-4">Name</th>
                                <th className="p-4 text-right pr-6">Score</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr><td colSpan="3" className="p-12 text-center text-gray-400 animate-pulse">Loading champions...</td></tr>
                            ) : participants.length === 0 ? (
                                <tr><td colSpan="3" className="p-12 text-center text-gray-400">No participants yet. Be the first!</td></tr>
                            ) : (
                                participants.map((p, idx) => (
                                    <tr key={idx} className="hover:bg-white/5 transition-colors group">
                                        <td className="p-4 pl-6 font-mono">
                                            {idx < 3 ? (
                                                <span className={`flex items-center justify-center w-8 h-8 rounded-full font-bold ${idx === 0 ? 'bg-gold text-black shadow-lg shadow-gold/20' :
                                                    idx === 1 ? 'bg-gray-300 text-black' :
                                                        'bg-amber-700 text-white'
                                                    }`}>
                                                    {idx + 1}
                                                </span>
                                            ) : (
                                                <span className="text-gray-500 w-8 inline-block text-center">#{idx + 1}</span>
                                            )}
                                        </td>
                                        <td className="p-4 font-medium text-lg group-hover:text-gold transition-colors">{p.name}</td>
                                        <td className="p-4 text-right pr-6 text-gold font-bold text-xl">{p.score}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default LeaderboardPage;
