import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Loader2 } from 'lucide-react'; // If installed, otherwise I should use text. I'll use text to be safe or install lucide. I installed lucide-react.

const FALLBACK_QUESTIONS = [
    { id: 1, question: "What is the primary goal of Content Marketing?", option_a: "Direct Sales", option_b: "Brand Awareness & Trust", option_c: "Quick Profits", option_d: "Internal Communication", correct_answer: "b" },
    { id: 2, question: "What does SEO stand for?", option_a: "Search Engine Optimization", option_b: "Site External Offer", option_c: "Social Engagement Online", option_d: "Sales Executive Officer", correct_answer: "a" },
    { id: 3, question: "Which platform is best for B2B marketing?", option_a: "TikTok", option_b: "Snapchat", option_c: "LinkedIn", option_d: "Pinterest", correct_answer: "c" },
    { id: 4, question: "What represents the 'P' in the 4Ps of Marketing?", option_a: "People", option_b: "Process", option_c: "Price", option_d: "Purpose", correct_answer: "c" }, // Actually Product, Price, Place, Promotion. 'Price' is one.
    { id: 5, question: "What is distinct about a 'target audience'?", option_a: "Everyone on earth", option_b: "Specific group consumers", option_c: "Employees only", option_d: "Investors", correct_answer: "b" },
    // Need 10 total...
    { id: 6, question: "What is a 'Call to Action' (CTA)?", option_a: "A phone call", option_b: "Prompt to take step", option_c: "Legal warning", option_d: "Meeting invite", correct_answer: "b" },
    { id: 7, question: "ROI stands for?", option_a: "Return On Investment", option_b: "Risk Of Inflation", option_c: "Rate Of Interest", option_d: "Run On Internet", correct_answer: "a" },
    { id: 8, question: "What is 'Churn Rate'?", option_a: "Butter making speed", option_b: "Customer attrition rate", option_c: "Website loading speed", option_d: "Employee hiring rate", correct_answer: "b" },
    { id: 9, question: "Which is a paid media channel?", option_a: "Company Blog", option_b: "Google Ads", option_c: "Organic Facebook Post", option_d: "Word of Mouth", correct_answer: "b" },
    { id: 10, question: "What is 'Viral Marketing'?", option_a: "Spreading a virus", option_b: "High speed internet usage", option_c: "Rapid organic sharing", option_d: "Email spamming", correct_answer: "c" },
];

const QuizPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [questions, setQuestions] = useState([]);
    const [currentQIndex, setCurrentQIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [correctCount, setCorrectCount] = useState(0);
    // Quiz Word
    const [quizWord, setQuizWord] = useState('BRAND'); // Default fallback
    const [revealedChars, setRevealedChars] = useState(0); // number of chars to show

    // Answer feedback states
    const [selectedAnswer, setSelectedAnswer] = useState(null); // The answer user clicked
    const [showFeedback, setShowFeedback] = useState(false); // Whether to show correct/wrong colors
    const [isCorrectAnswer, setIsCorrectAnswer] = useState(false); // Whether user's answer was correct
    const [wrongAttempts, setWrongAttempts] = useState(0); // Track wrong attempts per question
    const [totalWrongAttempts, setTotalWrongAttempts] = useState(0); // Track total wrong attempts across quiz
    const [isQuizCompleted, setIsQuizCompleted] = useState(false); // State for final animation
    const [bannerUrl, setBannerUrl] = useState(''); // Event banner URL

    useEffect(() => {
        const initQuiz = async () => {
            const participantId = sessionStorage.getItem('participant_id');
            if (!participantId) {
                navigate('/'); // Redirect if no name
                return;
            }

            setLoading(true);
            try {
                // 1. Fetch Active Quiz Word and Banner (without .single() to avoid 406 error)
                const { data: quizData } = await supabase
                    .from('quizzes')
                    .select('quiz_word, banner_url')
                    .eq('is_active', true);

                if (quizData && quizData.length > 0) {
                    if (quizData[0].quiz_word && quizData[0].quiz_word.length === 5) {
                        setQuizWord(quizData[0].quiz_word.toUpperCase());
                    }
                    if (quizData[0].banner_url) {
                        setBannerUrl(quizData[0].banner_url);
                    }
                }

                // 2. Fetch Questions
                const { data: qData, error } = await supabase
                    .from('questions')
                    .select('*')
                    .limit(10);

                if (qData && qData.length >= 5) {
                    setQuestions(qData);
                } else {
                    setQuestions(FALLBACK_QUESTIONS);
                }

            } catch (err) {
                console.error("Quiz load error:", err);
                setQuestions(FALLBACK_QUESTIONS);
            } finally {
                setLoading(false);
            }
        };

        initQuiz();
    }, [navigate]);

    const handleAnswer = (selectedOptionKey) => { // 'a', 'b', 'c', 'd'
        if (showFeedback) return; // Prevent clicking while showing feedback

        const currentQ = questions[currentQIndex];
        const isCorrect = selectedOptionKey === currentQ.correct_answer;

        setSelectedAnswer(selectedOptionKey);
        setShowFeedback(true);
        setIsCorrectAnswer(isCorrect);

        if (isCorrect) {
            const newCorrect = correctCount + 1;
            setCorrectCount(newCorrect);
            setScore(s => s + 10); // +10 for Correct

            // Reveal logic: Every 2 correct answers (2, 4, 6, 8, 10) -> Reveal 1 letter
            if (newCorrect % 2 === 0) {
                setRevealedChars(prev => Math.min(prev + 1, 5));
            }

            // Move to next question after delay
            setTimeout(() => {
                setSelectedAnswer(null);
                setShowFeedback(false);
                setWrongAttempts(0); // Reset for next question

                if (currentQIndex < questions.length - 1) {
                    setCurrentQIndex(prev => prev + 1);
                } else {
                    // Quiz Completed - Trigger Animation
                    setRevealedChars(5); // Ensure full reveal visually
                    setIsQuizCompleted(true);

                    // Navigate after animation delay
                    setTimeout(() => {
                        finishQuiz(score + 10, newCorrect); // Pass current score + 10
                    }, 3000);
                }
            }, 1000);
        } else {
            // Wrong answer
            setScore(s => s - 2); // -2 for Wrong (Immediate deduction)
            setWrongAttempts(prev => prev + 1);
            setTotalWrongAttempts(prev => prev + 1);

            // Reset selection after delay but stay on same question
            setTimeout(() => {
                setSelectedAnswer(null);
                setShowFeedback(false);
            }, 1000);
        }
    };

    const finishQuiz = async (finalScore, finalCorrect) => {
        // Save score and stats
        const participantId = sessionStorage.getItem('participant_id');
        if (participantId) {
            await supabase.from('participants').update({
                score: finalScore,
                questions_solved: finalCorrect,
                wrong_attempts: totalWrongAttempts
            }).eq('id', participantId);
        }
        // Navigate to result
        // Pass state
        navigate('/result', { state: { score: finalScore, correctCount: finalCorrect, total: questions.length, quizWord, revealedChars: Math.floor(finalCorrect / 2) } });
    };

    // Get button styling based on answer state
    const getButtonStyle = (optionKey) => {
        if (!showFeedback) {
            // Default state - no answer selected yet
            return 'border-white/20 hover:border-gold hover:bg-gold/10 text-white hover:text-white';
        }

        const currentQ = questions[currentQIndex];
        const isThisCorrect = optionKey === currentQ.correct_answer;
        const isThisSelected = optionKey === selectedAnswer;

        // Only show gold if user selected the CORRECT answer
        if (isThisCorrect && isCorrectAnswer) {
            return 'border-gold bg-gold/30 text-gold';
        }

        if (isThisSelected && !isThisCorrect) {
            // This is the selected wrong answer - show red
            return 'border-red-500 bg-red-500/30 text-red-400';
        }

        // Other options - keep normal styling (don't reveal the correct answer)
        return 'border-white/20 text-white';
    };

    if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-gold">Loading Quiz...</div>;

    const currentQ = questions[currentQIndex];

    return (
        <div className="min-h-screen bg-black text-white p-4 flex flex-col items-center relative overflow-hidden">
            {isQuizCompleted && <Confetti width={window.innerWidth} height={window.innerHeight} recycle={false} numberOfPieces={500} gravity={0.3} />}

            {/* Header / Word Reveal Area */}
            <motion.div
                layout
                animate={isQuizCompleted ? { y: "35vh", scale: window.innerWidth < 768 ? 1.1 : 1.5 } : { y: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 50, damping: 15 }}
                className="w-full max-w-2xl text-center mb-8 mt-4 space-y-6 z-20 relative"
            >
                <motion.h2
                    animate={isQuizCompleted ? { color: "#4ADE80", textShadow: "0 0 20px #4ADE80" } : { color: "#FFD700", textShadow: "none" }}
                    className="tracking-widest text-sm md:text-xl uppercase font-bold"
                >
                    {isQuizCompleted ? "⚠ ACCESS GRANTED ⚠" : "Decryption in Progress"}
                </motion.h2>
                <div className="flex justify-center gap-2 md:gap-4">
                    {[0, 1, 2, 3, 4].map((i) => (
                        <motion.div
                            key={i}
                            animate={i < revealedChars ? { scale: [1.2, 1], borderColor: isQuizCompleted ? '#4ADE80' : '#FFD700', backgroundColor: isQuizCompleted ? 'rgba(74, 222, 128, 0.2)' : 'rgba(255, 215, 0, 0.1)', color: isQuizCompleted ? '#4ADE80' : '#FFD700' } : {}}
                            className={`w-12 h-14 md:w-16 md:h-20 border-2 ${i < revealedChars ? 'border-gold bg-gold/10 text-gold' : 'border-white/20 bg-black-soft text-transparent'} rounded-lg flex items-center justify-center text-2xl md:text-4xl font-bold shadow-[0_0_15px_rgba(0,0,0,0.5)] transition-colors duration-500`}
                        >
                            {i < revealedChars ? quizWord[i] : '?'}
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* Question Card - Hide when completed */}
            <AnimatePresence>
                {!isQuizCompleted && (
                    <motion.div
                        key="question-card"
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0, y: 100, scale: 0.9 }}
                        transition={{ duration: 0.5 }}
                        className="w-full max-w-2xl flex-1 flex flex-col justify-center z-10"
                    >
                        <div className="text-center mb-6">
                            <span className="text-gray-400 text-sm">Question {currentQIndex + 1} of {questions.length}</span>
                            <div className="w-full h-1 bg-white/10 mt-2 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-gold"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${((currentQIndex) / questions.length) * 100}%` }}
                                />
                            </div>
                        </div>

                        <Card className="mb-8">
                            <h3 className="text-xl md:text-2xl font-bold mb-6 text-center leading-relaxed">
                                {currentQ.question}
                            </h3>

                            <div className="grid gap-3">
                                {[
                                    { key: 'a', val: currentQ.option_a },
                                    { key: 'b', val: currentQ.option_b },
                                    { key: 'c', val: currentQ.option_c },
                                    { key: 'd', val: currentQ.option_d }
                                ].map((opt) => (
                                    <motion.button
                                        key={opt.key}
                                        onClick={() => handleAnswer(opt.key)}
                                        disabled={showFeedback}
                                        animate={showFeedback && opt.key === selectedAnswer && !isCorrectAnswer ? { x: [0, -10, 10, -10, 10, 0] } : {}}
                                        transition={{ duration: 0.4 }}
                                        className={`w-full text-left py-4 px-6 rounded-lg border-2 transition-all duration-300 ${getButtonStyle(opt.key)} disabled:cursor-not-allowed`}
                                    >
                                        <span className="text-gold mr-4 uppercase font-bold">{opt.key}.</span>
                                        {opt.val}
                                    </motion.button>
                                ))}
                            </div>

                            {/* Feedback Message */}
                            {showFeedback && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`mt-4 text-center font-bold ${isCorrectAnswer ? 'text-gold' : 'text-red-400'}`}
                                >
                                    {isCorrectAnswer ? '✓ Correct! Moving to next question...' : '✗ Wrong! Try again...'}
                                </motion.div>
                            )}
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default QuizPage;

