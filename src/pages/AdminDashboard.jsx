import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Menu, X, Settings, Users, Key, Image, Upload, RefreshCw, Eye, EyeOff } from 'lucide-react';

const AdminDashboard = () => {
    const location = useLocation();
    const [auth, setAuth] = useState(false);
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);



    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('questions'); // 'questions', 'participants', 'accesskey'

    // Data
    const [participants, setParticipants] = useState([]);
    const [quizWord, setQuizWord] = useState('');
    const [newWord, setNewWord] = useState('');
    const [questions, setQuestions] = useState([]);
    const [accessKey, setAccessKey] = useState('ecell2026');
    const [newAccessKey, setNewAccessKey] = useState('');
    const [selectedQuestion, setSelectedQuestion] = useState(null);
    const [showQuestionModal, setShowQuestionModal] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState(0);
    const [bannerUrl, setBannerUrl] = useState('');
    const [newBannerUrl, setNewBannerUrl] = useState('');
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

    // Initialize: Fetch access key and check auto-login
    useEffect(() => {
        const initAccess = async () => {
            try {
                const { data } = await supabase
                    .from('quizzes')
                    .select('access_key')
                    .eq('is_active', true)
                    .limit(1);

                const dbKey = (data && data.length > 0 && data[0].access_key) ? data[0].access_key : 'ecell2026';
                setAccessKey(dbKey);

                // Auto-login if key matches
                if (location.state?.key && location.state.key === dbKey) {
                    setAuth(true);
                }
            } catch (err) {
                console.error('Error init access:', err);
            }
        };

        initAccess();
    }, [location.state]);

    // New Question Form
    const [qForm, setQForm] = useState({
        question: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_answer: 'a'
    });

    useEffect(() => {
        if (auth) {
            fetchData();
        }
    }, [auth]);

    const fetchData = async () => {
        try {
            const { data: pData } = await supabase.from('participants').select('*').order('score', { ascending: false });
            if (pData) setParticipants(pData);

            // Fetch quiz without .single() to avoid 406 error
            const { data: wData, error: quizError } = await supabase.from('quizzes').select('*').eq('is_active', true);

            let activeQuizId = null;

            if (quizError) {
                console.error('Quiz fetch error:', quizError);
            } else if (wData && wData.length > 0) {
                activeQuizId = wData[0].id;
                setQuizWord(wData[0].quiz_word || '');
                setNewWord(wData[0].quiz_word || '');
                setBannerUrl(wData[0].banner_url || '');
                setNewBannerUrl(wData[0].banner_url || '');
                setAccessKey(wData[0].access_key || 'ecell2026');
            } else {
                console.log('No active quiz found');
                setQuizWord('');
                setNewWord('');
                setBannerUrl('');
                setNewBannerUrl('');
                setAccessKey('ecell2026');
            }

            // Fetch questions for the active quiz
            let qQuery = supabase.from('questions').select('*');
            if (activeQuizId) {
                qQuery = qQuery.eq('quiz_id', activeQuizId);
            }
            const { data: qData } = await qQuery;

            if (qData) setQuestions(qData);
        } catch (err) {
            console.error('FetchData error:', err);
        }
    };

    const handleLogin = (e) => {
        e.preventDefault();
        if (password === accessKey) {
            setAuth(true);
        } else {
            alert('Invalid Password');
        }
    };

    const updateWord = async () => {
        if (newWord.length !== 5) {
            alert('Word must be exactly 5 letters');
            return;
        }

        try {
            const { error } = await supabase
                .from('quizzes')
                .update({ quiz_word: newWord.toUpperCase() })
                .eq('is_active', true);

            if (error) {
                console.error('Error updating quiz word:', error);
                alert('Error updating quiz word: ' + error.message);
                return;
            }

            setQuizWord(newWord.toUpperCase());
            alert('Quiz Word Updated Successfully!');
            fetchData(); // Refresh data
        } catch (err) {
            console.error('Unexpected error:', err);
            alert('Error: ' + err.message);
        }
    };

    const saveQuestion = async () => {
        if (!qForm.question || !qForm.option_a || !qForm.option_b || !qForm.option_c || !qForm.option_d) {
            alert('Please fill in all fields');
            return;
        }

        try {
            // If editing an existing question, UPDATE it
            if (selectedQuestion && selectedQuestion.id) {
                const { error } = await supabase
                    .from('questions')
                    .update({
                        question: qForm.question,
                        option_a: qForm.option_a,
                        option_b: qForm.option_b,
                        option_c: qForm.option_c,
                        option_d: qForm.option_d,
                        correct_answer: qForm.correct_answer
                    })
                    .eq('id', selectedQuestion.id);

                if (!error) {
                    alert('Question Updated Successfully!');
                    setQForm({ question: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_answer: 'a' });
                    setShowQuestionModal(false);
                    setSelectedQuestion(null);
                    fetchData();
                } else {
                    console.error('Update error:', error);
                    alert('Error updating question: ' + error.message);
                }
                return;
            }

            // Adding a new question - find or create quiz
            let { data: quizzes, error: quizError } = await supabase.from('quizzes').select('id').eq('is_active', true);

            console.log('Quizzes found:', quizzes, 'Error:', quizError);

            if (!quizzes || quizzes.length === 0) {
                const { data: newQuiz, error: createError } = await supabase
                    .from('quizzes')
                    .insert([{ quiz_word: 'BRAND', title: 'Marketing Quiz', is_active: true }])
                    .select()
                    .single();

                if (createError) {
                    console.error('Error creating quiz:', createError);
                    alert('Error: Could not find or create a quiz. Please check Supabase connection.');
                    return;
                }
                quizzes = [newQuiz];
            }

            const quiz = quizzes[0];

            const { error } = await supabase.from('questions').insert([{ ...qForm, quiz_id: quiz.id }]);
            if (!error) {
                alert('Question Added Successfully!');
                setQForm({ question: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_answer: 'a' });
                setShowQuestionModal(false);
                fetchData();
            } else {
                console.error('Insert error:', error);
                alert('Error adding question: ' + error.message);
            }
        } catch (err) {
            console.error('Unexpected error:', err);
            alert('Unexpected error: ' + err.message);
        }
    };

    const updateAccessKey = async () => {
        if (newAccessKey.length < 4) {
            alert('Access key must be at least 4 characters');
            return;
        }

        try {
            const { error } = await supabase
                .from('quizzes')
                .update({ access_key: newAccessKey })
                .eq('is_active', true);

            if (error) {
                console.error('Error updating access key:', error);
                alert('Failed to update access key: ' + error.message);
                return;
            }

            setAccessKey(newAccessKey);
            alert('Access Key Updated! New key: ' + newAccessKey);
            setNewAccessKey('');
        } catch (err) {
            console.error('Unexpected error:', err);
            alert('Error: ' + err.message);
        }
    };

    const updateBanner = async () => {
        try {
            const { error } = await supabase
                .from('quizzes')
                .update({ banner_url: newBannerUrl })
                .eq('is_active', true);

            if (error) {
                console.error('Error updating banner:', error);
                alert('Error updating banner: ' + error.message);
                return;
            }

            setBannerUrl(newBannerUrl);
            alert('Event Banner Updated Successfully!');
        } catch (err) {
            console.error('Unexpected error:', err);
            alert('Error: ' + err.message);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('File size must be less than 5MB');
            return;
        }

        setUploading(true);

        try {
            const fileName = `banner_${Date.now()}_${file.name}`;

            // Upload to Supabase Storage
            const { data, error: uploadError } = await supabase.storage
                .from('banners')
                .upload(fileName, file);

            if (uploadError) {
                console.error('Upload error:', uploadError);
                alert('Upload failed: ' + uploadError.message);
                setUploading(false);
                return;
            }

            // Get public URL
            const { data: urlData } = supabase.storage
                .from('banners')
                .getPublicUrl(fileName);

            if (urlData && urlData.publicUrl) {
                setNewBannerUrl(urlData.publicUrl);

                // Auto-save to database
                const { error: updateError } = await supabase
                    .from('quizzes')
                    .update({ banner_url: urlData.publicUrl })
                    .eq('is_active', true);

                if (updateError) {
                    alert('Image uploaded but failed to save: ' + updateError.message);
                } else {
                    setBannerUrl(urlData.publicUrl);
                    alert('Banner uploaded and saved successfully!');
                }
            }
        } catch (err) {
            console.error('Upload error:', err);
            alert('Upload failed: ' + err.message);
        }

        setUploading(false);
    };

    const menuItems = [
        { id: 'questions', label: 'Set Questions & Quiz Word', icon: Settings },
        { id: 'participants', label: 'Participants', icon: Users },
        { id: 'banner', label: 'Event Banner', icon: Image },
        { id: 'accesskey', label: 'Provide Access Key', icon: Key },
    ];

    if (!auth) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <form onSubmit={handleLogin} className="bg-white p-8 rounded-xl shadow-lg w-96 space-y-4">
                    <h2 className="text-2xl font-bold text-black text-center">Admin Access</h2>
                    <div className="relative">
                        <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter Access Key"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="bg-gray-50 border-gray-300 !text-black focus:border-gold pr-10"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                    <Button type="submit" className="w-full">Login</Button>
                </form>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 text-black">
            {/* Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div className={`fixed top-0 left-0 h-full w-72 bg-white shadow-2xl z-50 transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gold">Admin Menu</h2>
                    <button onClick={() => setSidebarOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                        <X size={24} />
                    </button>
                </div>
                <nav className="p-4 space-y-2">
                    {menuItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => {
                                setActiveTab(item.id);
                                setSidebarOpen(false);
                            }}
                            className={`w-full flex items-center gap-3 p-4 rounded-lg transition-colors text-left ${activeTab === item.id ? 'bg-gold text-black font-bold' : 'hover:bg-gray-100'}`}
                        >
                            <item.icon size={20} />
                            {item.label}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Main Content */}
            <div className="p-8">
                <header className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-4">
                        {/* Hamburger Menu Button */}
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                            <Menu size={28} />
                        </button>
                        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                    </div>
                    <Button variant="outline" onClick={() => setAuth(false)} className="text-black border-black hover:bg-black hover:text-white">Logout</Button>
                </header>

                {/* Tab Content */}
                {activeTab === 'questions' && (
                    <div className="flex gap-6">
                        {/* Left Column - Quiz Settings & Question Grid */}
                        <div className="space-y-6 flex-shrink-0" style={{ width: '550px' }}>
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                                <h3 className="text-lg font-bold mb-4">Quiz Settings</h3>
                                <div className="flex gap-4 items-center">
                                    <div className="flex-1">
                                        <label className="text-sm text-gray-500">Current Secret Word (5 Letters)</label>
                                        <input
                                            type="text"
                                            value={newWord}
                                            onChange={(e) => setNewWord(e.target.value)}
                                            maxLength={5}
                                            className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg text-black font-mono text-xl tracking-widest uppercase focus:outline-none focus:border-gold"
                                        />
                                    </div>
                                    <Button onClick={updateWord} className="mt-5">Update</Button>
                                </div>
                            </div>


                            {/* Questions Grid - 10 Cards, 4 per row */}
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                                <h3 className="text-lg font-bold mb-4">Questions ({questions.length}/10)</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {[...Array(10)].map((_, i) => {
                                        const q = questions[i];
                                        return (
                                            <div
                                                key={i}
                                                onClick={() => {
                                                    setSelectedSlot(i);
                                                    if (q) {
                                                        setSelectedQuestion(q);
                                                        setQForm({
                                                            question: q.question,
                                                            option_a: q.option_a,
                                                            option_b: q.option_b,
                                                            option_c: q.option_c,
                                                            option_d: q.option_d,
                                                            correct_answer: q.correct_answer
                                                        });
                                                    } else {
                                                        setSelectedQuestion(null);
                                                        setQForm({ question: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_answer: 'a' });
                                                    }
                                                    setShowQuestionModal(true);
                                                }}
                                                className={`p-4 rounded-xl border-2 cursor-pointer transition-all hover:scale-105 ${showQuestionModal && selectedSlot === i
                                                    ? 'border-gold bg-gold/20 shadow-lg ring-2 ring-gold'
                                                    : q
                                                        ? 'bg-gold/10 border-gold hover:shadow-lg'
                                                        : 'bg-gray-100 border-gray-300 border-dashed hover:border-gold'
                                                    }`}
                                            >
                                                <div className="text-center">
                                                    <span className="text-2xl font-bold text-gold">Q{i + 1}</span>
                                                    {q ? (
                                                        <p className="text-xs text-gray-500 mt-2 line-clamp-2">{q.question}</p>
                                                    ) : (
                                                        <p className="text-xs text-gray-400 mt-2">Click to Add</p>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Question Edit Form (Inline) */}
                        <div className="flex-1 min-w-[400px]">
                            {showQuestionModal ? (
                                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 sticky top-8">
                                    <div className="flex justify-between items-start mb-4">
                                        <h3 className="text-xl font-bold text-black">
                                            Question {selectedSlot + 1} {selectedQuestion ? '(Edit)' : '(Add New)'}
                                        </h3>
                                        <button onClick={() => setShowQuestionModal(false)} className="text-gray-500 hover:text-black text-2xl">&times;</button>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-sm font-medium text-gray-600 block mb-1">Question</label>
                                            <textarea
                                                placeholder="Enter the question..."
                                                value={qForm.question}
                                                onChange={e => setQForm({ ...qForm, question: e.target.value })}
                                                className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg text-black resize-none focus:outline-none focus:border-gold"
                                                rows={3}
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 gap-3">
                                            {[
                                                { key: 'option_a', label: 'Option A' },
                                                { key: 'option_b', label: 'Option B' },
                                                { key: 'option_c', label: 'Option C' },
                                                { key: 'option_d', label: 'Option D' },
                                            ].map(opt => (
                                                <div key={opt.key} className={`p-3 rounded-lg border-2 ${qForm.correct_answer === opt.key.split('_')[1] ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}>
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="radio"
                                                            name="correct"
                                                            checked={qForm.correct_answer === opt.key.split('_')[1]}
                                                            onChange={() => setQForm({ ...qForm, correct_answer: opt.key.split('_')[1] })}
                                                            className="w-4 h-4 accent-green-600"
                                                        />
                                                        <input
                                                            type="text"
                                                            placeholder={opt.label}
                                                            value={qForm[opt.key]}
                                                            onChange={e => setQForm({ ...qForm, [opt.key]: e.target.value })}
                                                            className="flex-1 p-2 bg-white text-black border border-gray-300 rounded-lg focus:outline-none focus:border-gold"
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <p className="text-sm text-gray-500">Select the radio button next to the correct answer</p>

                                        <Button onClick={saveQuestion} className="w-full">
                                            {selectedQuestion ? 'Update Question' : 'Add Question'}
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-gray-100 rounded-2xl p-8 border-2 border-dashed border-gray-300 flex items-center justify-center min-h-[400px]">
                                    <div className="text-center text-gray-400">
                                        <p className="text-lg font-medium">Select a Question</p>
                                        <p className="text-sm">Click on any question card to view or edit</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'participants' && (
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 w-full">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold">Participants ({participants.length})</h3>
                            <Button variant="outline" onClick={fetchData} className="flex items-center gap-2 hover:bg-gray-100 text-black border-gray-300">
                                <RefreshCw size={16} /> Refresh List
                            </Button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="border-b border-gray-200 text-gray-500 bg-gray-50">
                                    <tr>
                                        <th className="p-3">Name</th>
                                        <th className="p-3">Score</th>
                                        <th className="p-3">Questions Solved</th>
                                        <th className="p-3">Wrong Attempts</th>
                                        <th className="p-3">Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {participants.map((p) => (
                                        <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="p-3 font-medium">{p.name}</td>
                                            <td className="p-3 font-bold text-black">{p.score || 0}</td>
                                            <td className="p-3 text-gold font-bold">{p.questions_solved || 0} / {questions.length > 0 ? questions.length : '?'}</td>
                                            <td className="p-3 text-red-500 font-medium">{p.wrong_attempts || 0}</td>
                                            <td className="p-3 text-sm text-gray-500">{new Date(p.created_at).toLocaleDateString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'banner' && (
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 max-w-2xl">
                        <h3 className="text-lg font-bold mb-4">Event Banner</h3>
                        <p className="text-sm text-gray-500 mb-4">
                            Upload a banner image that will be displayed at the top of the Quiz page.
                        </p>

                        <div className="space-y-4">
                            {/* File Upload Button */}
                            <div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileUpload}
                                    accept="image/*"
                                    className="hidden"
                                />
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={uploading}
                                    className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-gold hover:bg-gold/5 transition-colors flex items-center justify-center gap-3 text-gray-600 hover:text-gold"
                                >
                                    <Upload size={24} />
                                    <span className="font-medium">
                                        {uploading ? 'Uploading...' : 'Click to Upload Banner Image'}
                                    </span>
                                </button>
                                <p className="text-xs text-gray-400 mt-2 text-center">Supports JPG, PNG, GIF (Max 5MB)</p>
                            </div>

                            <div className="flex items-center gap-2">
                                <div className="flex-1 h-px bg-gray-200"></div>
                                <span className="text-xs text-gray-400">OR</span>
                                <div className="flex-1 h-px bg-gray-200"></div>
                            </div>

                            {/* URL Input */}
                            <div>
                                <label className="text-sm font-medium text-gray-600 block mb-1">Banner Image URL</label>
                                <input
                                    type="text"
                                    placeholder="https://example.com/banner.jpg"
                                    value={newBannerUrl}
                                    onChange={(e) => setNewBannerUrl(e.target.value)}
                                    className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg text-black focus:outline-none focus:border-gold"
                                />
                            </div>

                            {/* Banner Preview */}
                            {newBannerUrl && (
                                <div className="border-2 border-gold/30 rounded-lg p-4 bg-gold/5">
                                    <p className="text-sm text-gray-500 mb-2">Preview:</p>
                                    <img
                                        src={newBannerUrl}
                                        alt="Banner Preview"
                                        className="max-w-full h-auto rounded-lg shadow-md"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                        }}
                                    />
                                </div>
                            )}

                            <Button onClick={updateBanner} className="w-full">Save Banner URL</Button>
                        </div>
                    </div>
                )}

                {activeTab === 'accesskey' && (
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 max-w-md">
                        <h3 className="text-lg font-bold mb-4">Manage Access Key</h3>
                        <p className="text-sm text-gray-500 mb-4">
                            Current Access Key: <span className="font-mono font-bold text-black">{accessKey}</span>
                        </p>
                        <div className="space-y-4">
                            <Input
                                type="text"
                                placeholder="Enter new access key"
                                value={newAccessKey}
                                onChange={(e) => setNewAccessKey(e.target.value)}
                                className="bg-gray-50 border-gray-300 text-black"
                            />
                            <Button onClick={updateAccessKey} className="w-full">Update Access Key</Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
