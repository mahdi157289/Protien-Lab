import { motion, AnimatePresence } from "framer-motion";
import PropTypes from "prop-types";
import homeImage1 from "../../assets/images/home/home_image.jpg";
import homeImage2 from "../../assets/images/home/workout.png";
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useTranslation, Trans } from 'react-i18next';

const WelcomeScreen = ({ onAuthClick }) => {
  const [bgImage, setBgImage] = useState(homeImage1);
  const [welcomeImages, setWelcomeImages] = useState([homeImage1, homeImage2]);
  const { t } = useTranslation();

  const fetchWelcome = useCallback(async () => {
      try {
        const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const getApiUrl = (endpoint) => {
          if (import.meta.env.MODE === 'development') return `/api${endpoint}`;
          const baseUrl = API_BASE_URL.endsWith('/api') ? API_BASE_URL : `${API_BASE_URL}/api`;
          return `${baseUrl}${endpoint}`;
        };
        const getPhotoUrl = (photoUrl) => {
          const baseUrl = API_BASE_URL.replace('/api','');
          return `${baseUrl}${photoUrl}`;
        };

        const res = await axios.get(getApiUrl('/photos/category/Welcome'));
        if (res.data?.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
          const activePhotos = res.data.data.filter(p => p.isActive !== false).slice(0, 2);
          if (activePhotos.length > 0) {
            const imgs = activePhotos.map(p => getPhotoUrl(p.url));
            const list = imgs.length === 1 ? [imgs[0], imgs[0]] : imgs;
            setWelcomeImages(list);
            setBgImage(list[0]);
          }
        }
      } catch (error) {
        console.error('Error fetching welcome photos:', error);
        // Keep default images
      }
  }, []);

  useEffect(() => {
    fetchWelcome();
    let bc;
    try {
      bc = new BroadcastChannel('photos');
      bc.onmessage = (ev) => {
        if (ev?.data?.type === 'welcome-updated' || ev?.data?.type === 'photos-updated') {
          fetchWelcome();
        }
      };
    } catch {}
    return () => { try { bc && bc.close(); } catch {} };
  }, [fetchWelcome]);

  useEffect(() => {
    if (welcomeImages.length >= 2) {
      const interval = setInterval(() => {
        setBgImage((prev) => (prev === welcomeImages[0] ? welcomeImages[1] : welcomeImages[0]));
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [welcomeImages]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, ease: "easeOut" }}
      className="relative h-screen"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={bgImage}
          className="absolute inset-0 bg-center bg-no-repeat bg-cover"
          style={{ backgroundImage: `url(${bgImage})` }}
          initial={{ opacity: 0, scale: 1.02 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0.0, scale: 1.02 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
        >
          <div className="absolute inset-0 bg-black/50"></div>
        </motion.div>
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
        className="relative flex flex-col items-center justify-center h-[calc(100vh-72px)] px-4 text-white"
      >
               
      </motion.div>
    </motion.div>
  );
};

WelcomeScreen.propTypes = {
  onAuthClick: PropTypes.func.isRequired,
};

export default WelcomeScreen;