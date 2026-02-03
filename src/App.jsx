import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import QuizPage from './pages/QuizPage';
import ResultPage from './pages/ResultPage';
import AdminDashboard from './pages/AdminDashboard';
import LeaderboardPage from './pages/LeaderboardPage';
import { SpeedInsights } from "@vercel/speed-insights/react";

function App() {
  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-gold selection:text-black">
      <SpeedInsights />
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/quiz" element={<QuizPage />} />
          <Route path="/result" element={<ResultPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
