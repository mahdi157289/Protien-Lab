import { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { NavLink, useNavigate } from 'react-router-dom';
import { UserCircle, LogOut, User, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import logo from '../../assets/images/common/Protein-Lab.png';
import { useTranslation } from 'react-i18next';
import { LiaLanguageSolid } from "react-icons/lia"; // Add this import
import axios from 'axios';

const UserNavbar = ({ onAuthClick }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isStoreDropdownOpen, setIsStoreDropdownOpen] = useState(false);
  const [storeDropdownBrands, setStoreDropdownBrands] = useState([]);
  const { user, logout } = useAuth();
  const [logoutConfirm, setLogoutConfirm] = useState(false);
  const [imageError, setImageError] = useState(false);
  const navigate = useNavigate();
  const { t, i18n } = useTranslation(); // Add i18n here

  const userMenuRef = useRef(null);
  const storeDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
      if (storeDropdownRef.current && !storeDropdownRef.current.contains(event.target)) {
        setIsStoreDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch brands from "Nos Marque" photos
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const getApiUrl = (endpoint) => {
          if (import.meta.env.MODE === 'development') {
            return `/api${endpoint}`;
          }
          const baseUrl = API_BASE_URL.endsWith('/api') ? API_BASE_URL : `${API_BASE_URL}/api`;
          return `${baseUrl}${endpoint}`;
        };
        
        const url = getApiUrl(`/photos/category/${encodeURIComponent('Nos Marque')}`);
        const response = await axios.get(url);
        
        console.log('[Navbar] API Response:', response.data);
        
        if (response.data.success && response.data.data) {
          // Ensure data is an array
          const photos = Array.isArray(response.data.data) ? response.data.data : [];
          console.log('[Navbar] Processing', photos.length, 'photos');
          
          // Extract unique brand names using the SAME simple logic as admin product form
          const brands = [...new Set(
            photos
              .filter(photo => photo.brandName && photo.isActive && photo.category === 'Nos Marque')
              .map(photo => photo.brandName)
              .filter(Boolean)
          )].sort();
          
          console.log('[Navbar] Brands extracted:', brands);
          setStoreDropdownBrands(brands);
        } else {
          console.warn('[Navbar] Invalid API response:', response.data);
          setStoreDropdownBrands([]);
        }
      } catch (error) {
        console.error('[Navbar] Error fetching brands:', error);
        console.error('[Navbar] Error details:', error.response?.data || error.message);
        setStoreDropdownBrands([]);
      }
    };

    fetchBrands();

    // Listen for photo updates
    let bc;
    try {
      bc = new BroadcastChannel('photos');
      bc.onmessage = (event) => {
        if (event.data?.type === 'photos-updated') {
          fetchBrands();
        }
      };
    } catch (error) {
      console.error('BroadcastChannel not supported:', error);
    }

    return () => {
      if (bc) {
        bc.close();
      }
    };
  }, []);

  const categories = [
    'Whey',
    'Mass Gainer',
    'Isolate Whey',
    'Vitamines & Minerals',
    'Creatine',
    'Acide Amine',
    'Pre-Workout',
    'Fat Burner',
    'Testobooster',
    'Join-Flex',
    'Fish oil',
    'Carbs',
    'Snacks',
    'Shakers',
    'Accesoires',
  ];

  const handleBrandClick = (brandName) => {
    navigate(`/store?brand=${encodeURIComponent(brandName)}`);
    setIsStoreDropdownOpen(false);
  };

  const handleCategoryClick = (categoryName) => {
    navigate(`/store?category=${encodeURIComponent(categoryName)}`);
    setIsStoreDropdownOpen(false);
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  const handleAuthClick = () => {
    onAuthClick(true, 'login');
    closeMenu();
  };

  const handleLogout = async () => {
    setLogoutConfirm(false);
    try {
      await logout();
      navigate('/');
      closeMenu();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === "en" ? "fr" : "en");
  };

  const navItems = user
    ? [
        { label: t('user_home'), path: '/' },
        { label: t('user_exercises'), path: '/exercises' },
        { label: t('user_store'), path: '/store', heartbeat: true },
        { label: t('user_victory_wall'), path: '/victory-wall' },
      ]
    : [
        { label: t('user_home'), path: '/' },
        { label: t('user_exercises'), path: '/exercises' },
        { label: t('user_store'), path: '/store', heartbeat: true },
        { label: t('user_victory_wall'), path: '/victory-wall' },
      ];

  const shouldShowImage = user?.profileImage && !imageError;

  return (
    <>
      {/* Top Bar with Phone Number */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-primary/90 text-accent px-6 py-2">
        <div className="mx-auto max-w-7xl flex items-center justify-end">
          <div className="flex items-center gap-2">
            <Phone size={16} className="text-accent" />
            <span className="text-sm font-medium" style={{ fontFamily: "'Orbitron', sans-serif" }}>27524413</span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <nav style={{ background: "linear-gradient(60deg, rgba(88, 88, 88, 1) 80%, rgba(255, 250, 252, 1) 100%)" }} className="fixed top-[41px] z-40 w-full px-6 py-1">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-between">
          {/* Extra large logo */}
          <div className="flex items-center">
            <NavLink to="/" className="flex items-center h-20">
              <img src={logo} alt="Protein Lab" className="h-full max-h-[100px]" />
            </NavLink>
          </div>

          {/* Desktop Navigation */}
          <div className="items-center hidden space-x-5 md:space-x-12 lg:space-x-20 md:flex">
            {navItems.map((item) => {
              // Special handling for Store navlink with dropdown
              if (item.path === '/store') {
                return (
                  <div
                    key={item.label}
                    ref={storeDropdownRef}
                    className="relative"
                    onMouseEnter={() => setIsStoreDropdownOpen(true)}
                    onMouseLeave={() => setIsStoreDropdownOpen(false)}
                  >
                    <NavLink
                      style={{ fontFamily: "'Orbitron', sans-serif" }} 
                      to={item.path}
                      className={({ isActive }) =>
                        `text-dark transition-all duration-500 relative text-base md:text-lg hover:scale-125 transform ${
                          isActive
                            ? ' text-dark after:absolute after:bottom-[-5px] after:left-0 after:w-full after:h-[1px] after:bg-primary after:transform after:scale-x-100 after:origin-left after:transition-transform after:duration-300'
                            : ' text-primary after:absolute after:bottom-[-5px] after:left-0 after:w-full after:h-[1px] after:bg-primary after:transform after:scale-x-0 after:origin-left after:transition-transform after:duration-300'
                        }`
                      }
                    >
                      <span className={item.heartbeat ? 'heartbeat inline-block' : ''}>{item.label}</span>
                    </NavLink>
                    
                    {/* Dropdown Menu */}
                    <AnimatePresence>
                      {isStoreDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          className="absolute top-full left-1/2 transform -translate-x-1/2 mt-3 w-96 rounded-2xl shadow-2xl border-2 overflow-hidden z-50"
                          style={{ backgroundColor: '#424340', borderColor: '#424340' }}
                        >
                        <div className="flex divide-x" style={{ borderColor: '#3A3B38' }}>
                          {/* Brands Column */}
                          <div className="flex-1 relative">
                            <div className="px-5 py-3 relative z-10" style={{ backgroundColor: '#424340', borderBottom: '1px solid #3A3B38' }}>
                              <h3 className="text-xs font-bold text-green-400 uppercase tracking-widest flex items-center gap-2" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                                <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></div>
                                Brands
                              </h3>
                            </div>
                            <div className="max-h-72 overflow-y-auto custom-scrollbar">
                              {storeDropdownBrands.length === 0 ? (
                                <div className="px-5 py-4 text-sm text-green-300/70 italic">No brands available</div>
                              ) : (
                                storeDropdownBrands.map((brand, idx) => (
                                  <motion.button
                                    key={brand}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.03 }}
                                    onClick={() => handleBrandClick(brand)}
                                    className="w-full px-5 py-3 text-left text-sm text-green-400 transition-all duration-200 last:border-b-0 group relative overflow-hidden"
                                    style={{ backgroundColor: '#424340', borderBottom: '1px solid #3A3B38' }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#3A3B38'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#424340'}
                                  >
                                    <span className="relative z-10 flex items-center gap-2">
                                      <span className="w-1.5 h-1.5 rounded-full bg-green-400/0 group-hover:bg-green-400 transition-all duration-300"></span>
                                      <span className="group-hover:translate-x-1 transition-transform duration-200">{brand}</span>
                                    </span>
                                    <div className="absolute left-0 top-0 bottom-0 w-0 group-hover:w-1 bg-green-400 transition-all duration-300"></div>
                                  </motion.button>
                                ))
                              )}
                            </div>
                          </div>
                          
                          {/* Categories Column */}
                          <div className="flex-1 relative">
                            <div className="px-5 py-3 relative z-10" style={{ backgroundColor: '#424340', borderBottom: '1px solid #3A3B38' }}>
                              <h3 className="text-xs font-bold text-green-400 uppercase tracking-widest flex items-center gap-2" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                                <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></div>
                                Categories
                              </h3>
                            </div>
                            <div className="max-h-72 overflow-y-auto custom-scrollbar">
                              {categories.map((category, idx) => (
                                <motion.button
                                  key={category}
                                  initial={{ opacity: 0, x: 10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: idx * 0.03 }}
                                    onClick={() => handleCategoryClick(category)}
                                    className="w-full px-5 py-3 text-left text-sm text-green-400 transition-all duration-200 last:border-b-0 group relative overflow-hidden"
                                    style={{ backgroundColor: '#424340', borderBottom: '1px solid #3A3B38' }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#3A3B38'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#424340'}
                                  >
                                    <span className="relative z-10 flex items-center gap-2">
                                      <span className="w-1.5 h-1.5 rounded-full bg-green-400/0 group-hover:bg-green-400 transition-all duration-300"></span>
                                      <span className="group-hover:translate-x-1 transition-transform duration-200">{category}</span>
                                    </span>
                                    <div className="absolute left-0 top-0 bottom-0 w-0 group-hover:w-1 bg-green-400 transition-all duration-300"></div>
                                </motion.button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              }
              
              // Regular navlinks
              return (
              <NavLink
                key={item.label}
                style={{ fontFamily: "'Orbitron', sans-serif" }} 
                to={item.path}
                className={({ isActive }) =>
                  `text-dark transition-all duration-500 relative text-base md:text-lg hover:scale-125 transform ${
                    isActive
                      ? ' text-dark after:absolute after:bottom-[-5px] after:left-0 after:w-full after:h-[1px] after:bg-primary after:transform after:scale-x-100 after:origin-left after:transition-transform after:duration-300'
                      : ' text-primary after:absolute after:bottom-[-5px] after:left-0 after:w-full after:h-[1px] after:bg-primary after:transform after:scale-x-0 after:origin-left after:transition-transform after:duration-300'
                  }`
                }
              >
                  <span className={item.heartbeat ? 'heartbeat inline-block' : ''}>{item.label}</span>
              </NavLink>
              );
            })}
            {/* Language toggle moved to global floating actions */}
          </div>

          {/* User Menu */}
          <div className="hidden md:block">
            {user ? (
              <div className="flex items-center gap-4">
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center justify-center w-10 h-10 overflow-hidden transition-colors border-2 rounded-full bg-secondary text-primary border-secondary"
                  >
                    {shouldShowImage ? (
                      <img
                        src={`${import.meta.env.VITE_IMAGE_URL}/${user.profileImage}`}
                        alt="Profile"
                        className="object-cover w-10 h-10"
                        onError={() => setImageError(true)}
                      />
                    ) : (
                      <UserCircle className="w-10 h-10" />
                    )}
                  </button>
                  {isUserMenuOpen && (
                    <div className="absolute right-0 w-48 px-5 py-5 mt-6 space-y-4 rounded-xl bg-accent">
                      <button
                        onClick={() => {
                          navigate('/profile');
                          setIsUserMenuOpen(false);
                        }}
                        className="flex items-center w-full gap-4 text-lg text-left transition-colors text-dark"
                      >
                        <User className="w-6 h-6" />
                        {t('user_profile')}
                      </button>
                      <hr className="border-t border-dark" />
                      <button
                        onClick={() => {
                          setLogoutConfirm(true);
                          setIsUserMenuOpen(false);
                        }}
                        className="flex items-center w-full gap-4 text-lg text-left transition-colors text-dark "
                      >
                        <LogOut className="w-6 h-6" />
                        {t('user_logout')}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <button
                onClick={handleAuthClick}
                className="bg-secondary text-primary border border-primary px-6 py-1.5 rounded-lg hover:bg-primary hover:text-dark transition-all text-base md:text-lg"
              >
                {t('user_login')}
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            {/* Language toggle moved to global floating actions */}
            <button onClick={toggleMenu} className="transition-colors text-dark ">
              {isOpen ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div
          className={`mt-4 md:hidden transition-all duration-500 ${
            isOpen ? 'opacity-100 max-h-[500px] overflow-visible' : 'opacity-0 max-h-0 overflow-hidden'
          }`}
        >
          <div className="flex flex-col space-y-4">
            {navItems.map((item) => (
              <NavLink
                key={item.label}
                to={item.path}
                onClick={closeMenu}
                className={({ isActive }) =>
                  `text-dark  transition-all duration-500 relative hover:scale-125 transform ${
                    isActive
                      ? 'text-primary after:absolute after:bottom-0 after:left-0 after:w-full after:h-[1px] after:bg-primary after:transform after:scale-x-100 after:origin-left after:transition-transform after:duration-300'
                      : 'after:absolute after:bottom-0 after:left-0 after:w-full after:h-[1px] after:bg-primary after:transform after:scale-x-0 after:origin-left after:transition-transform after:duration-300 hover:after:scale-x-100'
                  }`
                }
              >
                <span className={item.heartbeat ? 'heartbeat inline-block' : ''}>{item.label}</span>
              </NavLink>
            ))}
            {/* Language toggle moved to global floating actions */}
            {user ? (
              <>
                <button
                  onClick={() => navigate('/profile')}
                  className="text-left transition-all duration-500 text-dark "
                >
                  {t('user_profile')}
                </button>
                <button
                  onClick={() => setLogoutConfirm(true)}
                  className="text-left transition-all duration-500 text-dark "
                >
                  {t('user_logout')}
                </button>
              </>
            ) : (
              <button
                onClick={handleAuthClick}
                className="bg-secondary text-primary border border-primary px-6 py-1.5 rounded hover:bg-primary hover:text-dark transition-all"
              >
                {t('user_login')}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {logoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-accent bg-opacity-80">
          <div className="p-6 text-center text-dark shadow-lg rounded-2xl bg-accent">
            <h2 className="mb-3 text-2xl font-bold">{t('user_logout_title')}</h2>
            <p className="mb-4">{t('user_logout_confirm')}</p>
            <div className="flex justify-center gap-10">
              <button
                onClick={() => setLogoutConfirm(false)}
                className="px-8 py-2 transition border rounded-lg text-primary bg-secondary hover:bg-dark border-primary"
              >
                {t('user_cancel')}
              </button>
              <button
                onClick={handleLogout}
                className="px-8 py-2 transition border rounded-lg border-primary bg-primary "
              >
                {t('user_logout')}
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
    </>
  );
};

UserNavbar.propTypes = {
  onAuthClick: PropTypes.func.isRequired,
};

export default UserNavbar;