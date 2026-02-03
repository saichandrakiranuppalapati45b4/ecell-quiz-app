import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase'; // Updated path
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Loader2 } from 'lucide-react'; // Need to import spinner or use text

const LandingPage = () => {
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleStart = async (e) => {
        e.preventDefault();
        if (!name.trim()) return;

        setLoading(true);
        try {
            // 1. Save to Supabase
            const { data, error } = await supabase
                .from('participants')
                .insert([{ name: name.trim() }])
                .select()
                .single();

            if (error) throw error;

            // 2. Save participant ID/Name to local storage for persistence
            sessionStorage.setItem('participant_id', data.id);
            sessionStorage.setItem('participant_name', data.name);

            // 3. Navigate
            navigate('/quiz');
        } catch (err) {
            console.error('Error starting quiz:', err);
            alert('Failed to start. Please check your connection.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* ECELL Logo - Top Left (Click for Admin Access) */}
            <img
                src="/ecell-logo.png"
                alt="ECELL Logo"
                className="absolute top-4 left-4 w-12 h-12 md:w-16 md:h-16 object-contain z-20 cursor-pointer hover:scale-110 transition-transform"
                onClick={async () => {
                    const enteredKey = prompt('Enter Admin Access Key:');
                    if (enteredKey === null) return;

                    try {
                        // Fetch without .single() to safely handle potential multiple rows
                        const { data, error } = await supabase
                            .from('quizzes')
                            .select('access_key')
                            .eq('is_active', true)
                            .limit(1);

                        if (error) throw error;

                        let correctKey = 'ecell2026'; // Default
                        if (data && data.length > 0 && data[0].access_key) {
                            correctKey = data[0].access_key;
                        }

                        if (enteredKey === correctKey) {
                            navigate('/admin', { state: { key: enteredKey } });
                        } else {
                            alert('Invalid Access Key');
                        }
                    } catch (err) {
                        console.error('Error verifying key:', err);
                        // Fallback: If DB check fails, still accept the default key hardcoded
                        if (enteredKey === 'ecell2026') navigate('/admin', { state: { key: 'ecell2026' } });
                        else alert('Verification failed: ' + err.message);
                    }
                }}
            />

            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-gold/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-gold/5 rounded-full blur-[100px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="z-10 text-center max-w-md w-full space-y-8"
            >
                <div className="space-y-2">
                    <h1 className="text-5xl md:text-6xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-br from-[#D4AF37] via-[#FFD700] to-[#AA8C2C] drop-shadow-[0_2px_10px_rgba(212,175,55,0.3)]">
                        ECELL
                    </h1>
                    <h2 className="text-2xl md:text-3xl font-light tracking-[0.2em] text-white">
                        MARKETING QUIZ
                    </h2>
                </div>

                <form onSubmit={handleStart} className="space-y-6 mt-12 backdrop-blur-md p-8 rounded-2xl border border-white/10 shadow-2xl bg-black/40">
                    <div className="space-y-2 text-left">
                        <label className="text-gold text-sm font-semibold tracking-wide uppercase ml-1">Participant Name</label>
                        <Input
                            placeholder="Enter your full name..."
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            disabled={loading}
                            autoFocus
                        />
                    </div>

                    <Button
                        type="submit"
                        className="w-full text-lg py-4 shadow-[0_0_20px_rgba(212,175,55,0.4)]"
                        disabled={loading}
                    >
                        {loading ? <span className="flex items-center justify-center gap-2">Connecting...</span> : 'START CHALLENGE'}
                    </Button>
                </form>

                <p className="text-gray-500 text-sm mt-8">
                    Powered by ECELL Intelligence
                </p>
            </motion.div>
        </div>
    );
};

export default LandingPage;
