import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import AuthModal from './components/AuthModal';
import Home from './pages/Home';
import Exercises from './pages/Exercises';
import Workout from './pages/Workout';
import DietPlan from './pages/DietPlan';
import Store from './pages/Store';
<<<<<<< Updated upstream
import VictoryWall from './pages/VictoryWall'; 
import Footer from './components/common/Footer';
=======
import VictoryWall from './pages/VictoryWall';
import Dashboard from './pages/UserDashboard';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Profile from './components/Profile';
>>>>>>> Stashed changes

function App() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authType, setAuthType] = useState('login');

  const handleAuthModal = (isOpen, type) => {
    if (type) {
      setAuthType(type); // Only update authType if a type is provided
    }
    setIsAuthModalOpen(isOpen);
  };

  return (
    <Router>
      <AuthProvider>
      <div>
        <Navbar onAuthClick={handleAuthModal} />
        <main className="pt-[73px]">
          <Routes>
            <Route path="/" element={<Home onAuthClick={handleAuthModal} />} />
            <Route path="/exercises" element={<Exercises />} />
            <Route path="/workouts" element={<Workout />} />
            <Route path="/diet-plan" element={<DietPlan />} />
            <Route path="/store/*" element={<Store />} />
            <Route path="/victory-wall" element={<VictoryWall />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          </Routes>
        </main>

        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => handleAuthModal(false)}
          authType={authType}
        />
      </div>
<<<<<<< Updated upstream
      <Footer />
=======
      </AuthProvider>
>>>>>>> Stashed changes
    </Router>
  );
}

export default App;