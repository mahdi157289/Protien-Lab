import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from '../components/common/UserNavbar';
import AuthModal from '../components/user/AuthModal';
import Home from '../pages/Home';
import Exercises from '../pages/Exercises';
import Workout from '../pages/Workout';
import DietPlan from '../pages/DietPlan';
import Store from '../pages/Store';
import VictoryWall from '../pages/VictoryWall';
import Dashboard from '../pages/UserDashboard';
import Profile from '../components/user/Profile';
import ProtectedRoute from '../components/user/ProtectedRoute';
import Footer from '../components/common/Footer';

const UserRoutes = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authType, setAuthType] = useState('login');

  const handleAuthModal = (isOpen, type) => {
    if (type) {
      setAuthType(type);
    }
    setIsAuthModalOpen(isOpen);
  };

  return (
    <>
      <Navbar onAuthClick={handleAuthModal} />
        <Routes>
          <Route path="/" element={<Home onAuthClick={handleAuthModal} />} />
          <Route path="/exercises/*" element={<Exercises />} />
          <Route path="/workouts" element={<ProtectedRoute onAuthClick={handleAuthModal}><Workout /></ProtectedRoute>} />
          <Route path="/diet-plan" element={<ProtectedRoute onAuthClick={handleAuthModal}><DietPlan /></ProtectedRoute>} />
          <Route path="/store/*" element={<Store />} />
          <Route path="/victory-wall" element={<VictoryWall />} />
          <Route path="/dashboard" element={<ProtectedRoute onAuthClick={handleAuthModal}><Dashboard /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute onAuthClick={handleAuthModal}><Profile /></ProtectedRoute>} />
        </Routes>
      <Footer />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => handleAuthModal(false)}
        authType={authType}
      />
    </>
  );
};

export default UserRoutes;
