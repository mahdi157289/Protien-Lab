import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AuthProvider } from './contexts/AuthContext';
import { AdminAuthProvider } from './contexts/AdminAuthContext';
import { SmokeyProvider, useSmokey } from './contexts/SmokeyContext';
import AdminRoutes from './routes/AdminRoutes';
import UserRoutes from './routes/UserRoutes';
import FloatingActions from './components/common/FloatingActions';
import SmokeyBackground from './components/ui/SmokeyBackground';
import PlatformLoader from './components/common/PlatformLoader';
import { getCachedData } from './utils/apiCache';
import api from './config/api.jsx';
import axios from 'axios';

function AppContent() {
  const { smokeyOn } = useSmokey();
  
  return (
    <div style={{ position: 'relative', zIndex: 1 }}>
      {/* Show smokey background when enabled */}
      {smokeyOn && <SmokeyBackground backdropBlurAmount="xl" color="#40EE45" />}
      <main className="pt-[129px]" style={{ fontFamily: "'Orbitron', sans-serif", color: smokeyOn ? 'white' : 'black', position: 'relative', zIndex: 1 }} >
        <Routes>
          <Route path="/*" element={<UserRoutes />} />
          <Route path="/admin/*" element={<AdminRoutes />} />
        </Routes>
      </main>
      <FloatingActions />
    </div>
  );
}

import ScrollToTop from './components/common/ScrollToTop';

function App() {
  const [isPlatformLoading, setIsPlatformLoading] = useState(true);
  const [showOverlay, setShowOverlay] = useState(false);
  const animationCompleteRef = useRef(null);

  useEffect(() => {
    // Create a promise that resolves when animation completes
    let resolveAnimation;
    const animationPromise = new Promise((resolve) => {
      resolveAnimation = resolve;
    });
    animationCompleteRef.current = { promise: animationPromise, resolve: resolveAnimation };

    const initializePlatform = async () => {
      // Wait for fonts to load (but don't block if it takes too long - max 1s)
      const fontPromise = document.fonts.ready;
      const fontTimeout = new Promise(resolve => setTimeout(resolve, 1000));
      const fontReady = Promise.race([fontPromise, fontTimeout]);
      
      // Wait for i18n to initialize
      const i18nReady = new Promise(resolve => setTimeout(resolve, 100));
      
      // User requested an extra 1 second fixed delay
      const extraDelay = new Promise(resolve => setTimeout(resolve, 1000));
      
      // Secretly pre-fetch critical data to the cache
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const getApiUrl = (endpoint) => {
        if (import.meta.env.MODE === 'development') return `/api${endpoint}`;
        const baseUrl = API_BASE_URL.endsWith('/api') ? API_BASE_URL : `${API_BASE_URL}/api`;
        return `${baseUrl}${endpoint}`;
      };

      try {
        getCachedData('/users/products?limit=12', () => api.get('/users/products?limit=12'), 30000);
        const bestOffersUrl = getApiUrl('/photos/category/Best Offers');
        getCachedData(bestOffersUrl, () => axios.get(bestOffersUrl), 30000);
        const nosPackUrl = getApiUrl(`/photos/category/${encodeURIComponent('Nos Pack')}`);
        getCachedData(nosPackUrl, () => axios.get(nosPackUrl), 30000);
        const allProductsUrl = getApiUrl('/users/products?limit=500');
        getCachedData(allProductsUrl, () => axios.get(allProductsUrl), 30000);
        const brandsUrl = getApiUrl(`/photos/category/${encodeURIComponent('Nos Marque')}`);
        getCachedData(brandsUrl, () => axios.get(brandsUrl), 30000);
        const welcomeUrl = getApiUrl('/photos/category/Welcome');
        getCachedData(welcomeUrl, () => axios.get(welcomeUrl), 30000);
      } catch (err) {
        console.error('Preload failed', err);
      }

      // Wait for resources, delay, and animation
      await Promise.all([
        fontReady,
        i18nReady,
        extraDelay,
        animationPromise // Wait for animation to complete
      ]);
      
      setIsPlatformLoading(false);
    };

    initializePlatform();
  }, []);

  const handleAnimationComplete = () => {
    if (animationCompleteRef.current?.resolve) {
      animationCompleteRef.current.resolve();
    }
  };

  // After loader hides, keep a short black overlay to avoid any flash before skeletons mount
  useEffect(() => {
    if (!isPlatformLoading) {
      setShowOverlay(true);
      const timer = setTimeout(() => setShowOverlay(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isPlatformLoading]);

  return (
    <Router>
      <ScrollToTop />
      <AnimatePresence mode="wait">
        {isPlatformLoading ? (
          <PlatformLoader key="loader" onAnimationComplete={handleAnimationComplete} />
        ) : (
          <motion.div
            key="platform"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          >
            <AuthProvider>
              <AdminAuthProvider>
                <SmokeyProvider>
                  <AppContent />
                </SmokeyProvider>
              </AdminAuthProvider>
            </AuthProvider>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Fade-out overlay to mask any intermediate blank state */}
      <AnimatePresence>
        {showOverlay && (
          <motion.div
            key="post-loader-overlay"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed inset-0 bg-black pointer-events-none z-[9998]"
          />
        )}
      </AnimatePresence>
    </Router>
  );
}

export default App;
