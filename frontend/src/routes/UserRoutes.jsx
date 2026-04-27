import { useState, Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from '../components/common/UserNavbar';
import AuthModal from '../components/user/AuthModal';
import ProtectedRoute from '../components/user/ProtectedRoute';
import Footer from '../components/common/Footer';

// Lazy load routes for code splitting
const Home = lazy(() => import('../pages/Home'));
const Workout = lazy(() => import('../pages/Workout'));
const DietPlan = lazy(() => import('../pages/DietPlan'));
const Store = lazy(() => import('../pages/Store'));
const Dashboard = lazy(() => import('../pages/UserDashboard'));
const Profile = lazy(() => import('../components/user/Profile'));

// Loading component
const RouteLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
);

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
      <Suspense fallback={<RouteLoader />}>
        <Routes>
          <Route path="/" element={<Home onAuthClick={handleAuthModal} />} />
          <Route path="/workouts" element={<ProtectedRoute onAuthClick={handleAuthModal}><Workout /></ProtectedRoute>} />
          <Route path="/diet-plan" element={<ProtectedRoute onAuthClick={handleAuthModal}><DietPlan /></ProtectedRoute>} />
          <Route path="/store/*" element={<Store />} />
          <Route path="/dashboard" element={<ProtectedRoute onAuthClick={handleAuthModal}><Dashboard /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute onAuthClick={handleAuthModal}><Profile /></ProtectedRoute>} />
        </Routes>
      </Suspense>
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
