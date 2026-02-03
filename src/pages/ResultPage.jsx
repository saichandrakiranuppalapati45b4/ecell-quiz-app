import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { motion } from 'framer-motion';
import { Home } from 'lucide-react';
import { supabase } from '../lib/supabase';

const ResultPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [bannerUrl, setBannerUrl] = useState('');

    // Default state if accessed directly
    const { score, correctCount, total, quizWord, revealedChars } = location.state || { score: 0, correctCount: 0, total: 10, quizWord: "BRAND", revealedChars: 0 };

    // Check if word is fully revealed (approximate check, assuming 5 letter word requires 5 revealed chars)
    const isWordCompleted = revealedChars >= (quizWord?.length || 5);

    useEffect(() => {
        const storedName = sessionStorage.getItem('participant_name') || 'Participant';
        setName(storedName);

        // Fetch banner URL
        const fetchBanner = async () => {
            try {
                const { data } = await supabase
                    .from('quizzes')
                    .select('banner_url')
                    .eq('is_active', true);

                if (data && data.length > 0 && data[0].banner_url) {
                    setBannerUrl(data[0].banner_url);
                }
            } catch (err) {
                console.error('Error fetching banner:', err);
            }
        };

        fetchBanner();
    }, []);

    const handleDownload = async () => {
        if (!posterRef.current) return;
        try {
            const canvas = await html2canvas(posterRef.current, {
                backgroundColor: '#000000',
                scale: 2, // High resolution
                useCORS: true
            });
            const link = document.createElement('a');
            link.download = `ECELL_Result_${name.replace(/\s+/g, '_')}.png`;
            link.href = canvas.toDataURL();
            link.click();
        } catch (err) {
            console.error('Poster generation failed', err);
        }
    };

    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
            {/* Event Banner - Only show if word is completed */}
            {bannerUrl && isWordCompleted && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 w-full max-w-2xl"
                >
                    <img
                        src={bannerUrl}
                        alt="Event Banner"
                        className="w-full h-auto rounded-xl shadow-lg"
                    />
                </motion.div>
            )}

            {/* Simple Score Display */}
            <div className="text-center mb-8 space-y-2">
                <h1 className="text-3xl font-bold text-gold">
                    {isWordCompleted ? 'Congratulations!' : 'Quiz Completed'}
                </h1>
                <p className="text-xl text-white">
                    You scored <span className="text-gold font-bold">{score}</span> points
                </p>
                <p className="text-gray-400">
                    Accuracy: {correctCount}/{total}
                </p>
            </div>

            <div className="mb-8 flex gap-4">
                <Button variant="outline" onClick={() => navigate('/')} className="flex items-center gap-2 px-8 py-3">
                    <Home size={20} /> Back to Home
                </Button>
                {/* Removed Poster Download as per request */}
            </div>
        </div>
    );
};

export default ResultPage;

