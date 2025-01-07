import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import AuthModal from './components/AuthModal';
import Home from './pages/Home';
import Exercises from './pages/Exercises';
import Workout from './pages/Workout';
import DietPlan from './pages/DietPlan';
import Store from './pages/Store';
import VictoryWall from './pages/VictoryWall'; 

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
          </Routes>
        </main>

        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => handleAuthModal(false)}
          authType={authType}
        />
      </div>
    </Router>
  );
}

export default App;