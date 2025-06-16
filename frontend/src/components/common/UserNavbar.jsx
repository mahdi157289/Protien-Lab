import { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { NavLink, useNavigate } from 'react-router-dom';
import { UserCircle, LogOut, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import logo from '../../assets/images/common/Protein-Lab.png';
import { useTranslation } from 'react-i18next';
import { LiaLanguageSolid } from "react-icons/lia"; // Add this import

const UserNavbar = ({ onAuthClick }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const [logoutConfirm, setLogoutConfirm] = useState(false);
  const [imageError, setImageError] = useState(false);
  const navigate = useNavigate();
  const { t, i18n } = useTranslation(); // Add i18n here

  const userMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
        { label: t('user_dashboard'), path: '/dashboard' },
        { label: t('user_exercises'), path: '/exercises' },
        { label: t('user_workouts'), path: '/workouts' },
        { label: t('user_diet_plan'), path: '/diet-plan' },
        { label: t('user_store'), path: '/store' },
        { label: t('user_victory_wall'), path: '/victory-wall' },
      ]
    : [
        { label: t('user_home'), path: '/' },
        { label: t('user_exercises'), path: '/exercises' },
        { label: t('user_workouts'), path: '/workouts' },
        { label: t('user_diet_plan'), path: '/diet-plan' },
        { label: t('user_store'), path: '/store' },
        { label: t('user_victory_wall'), path: '/victory-wall' },
      ];

  const shouldShowImage = user?.profileImage && !imageError;

  return (
    <nav style={{ background: "linear-gradient(60deg, rgba(88, 88, 88, 1) 80%, rgba(255, 250, 252, 1) 100%)" }} className="fixed top-0 z-40 w-full px-6 py-1">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-between">
          {/* Extra large logo */}
          <div className="flex items-center">
            <NavLink to="/" className="flex items-center h-20">
              <img src={logo} alt="Protein Lab" className="h-full max-h-[100px]" />
            </NavLink>
          </div>

          {/* Desktop Navigation */}
          <div className="items-center hidden space-x-2 md:space-x-6 lg:space-x-12 md:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.label}
                style={{ fontFamily: "'Orbitron', sans-serif" }} 
                to={item.path}
                className={({ isActive }) =>
                  `text-accent transition-all duration-500 relative text-base md:text-lg ${
                    isActive
                      ? ' text-accent after:absolute after:bottom-[-5px] after:left-0 after:w-full after:h-[1px] after:bg-primary after:transform after:scale-x-100 after:origin-left after:transition-transform after:duration-300'
                      : ' text-primary after:absolute after:bottom-[-5px] after:left-0 after:w-full after:h-[1px] after:bg-primary after:transform after:scale-x-0 after:origin-left after:transition-transform after:duration-300'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
            {/* Language Toggle Desktop */}
            <button
              onClick={toggleLanguage}
              className="flex items-center justify-center p-2 ml-2 text-xl rounded-full hover:bg-secondary transition"
              title={i18n.language === "en" ? "Français" : "English"}
              aria-label="Toggle language"
            >
              <LiaLanguageSolid />
              <span className="ml-1 text-sm font-semibold uppercase">{i18n.language === "en" ? "EN" : "FR"}</span>
            </button>
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
                    <div className="absolute right-0 w-48 px-5 py-5 mt-6 space-y-4 rounded-xl bg-dark">
                      <button
                        onClick={() => {
                          navigate('/profile');
                          setIsUserMenuOpen(false);
                        }}
                        className="flex items-center w-full gap-4 text-lg text-left transition-colors text-accent"
                      >
                        <User className="w-6 h-6" />
                        {t('user_profile')}
                      </button>
                      <hr className="border-t border-accent" />
                      <button
                        onClick={() => {
                          setLogoutConfirm(true);
                          setIsUserMenuOpen(false);
                        }}
                        className="flex items-center w-full gap-4 text-lg text-left transition-colors text-accent "
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
                className="bg-secondary text-primary border border-primary px-6 py-1.5 rounded-lg hover:bg-primary hover:text-accent transition-all text-base md:text-lg"
              >
                {t('user_login')}
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            {/* Language Toggle Mobile */}
            <button
              onClick={toggleLanguage}
              className="flex items-center justify-center p-2 text-xl rounded-full hover:bg-secondary transition"
              title={i18n.language === "en" ? "Français" : "English"}
              aria-label="Toggle language"
            >
              <LiaLanguageSolid />
              <span className="ml-1 text-sm font-semibold uppercase">{i18n.language === "en" ? "EN" : "FR"}</span>
            </button>
            <button onClick={toggleMenu} className="transition-colors text-accent ">
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
                  `text-accent  transition-all duration-500 relative ${
                    isActive
                      ? 'text-primary after:absolute after:bottom-0 after:left-0 after:w-full after:h-[1px] after:bg-primary after:transform after:scale-x-100 after:origin-left after:transition-transform after:duration-300'
                      : 'after:absolute after:bottom-0 after:left-0 after:w-full after:h-[1px] after:bg-primary after:transform after:scale-x-0 after:origin-left after:transition-transform after:duration-300 hover:after:scale-x-100'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
            {/* Language Toggle in Mobile Menu */}
            <button
              onClick={toggleLanguage}
              className="flex items-center justify-start p-2 text-xl rounded-full hover:bg-secondary transition"
              title={i18n.language === "en" ? "Français" : "English"}
              aria-label="Toggle language"
            >
              <LiaLanguageSolid />
              <span className="ml-2 text-sm font-semibold uppercase">{i18n.language === "en" ? "EN" : "FR"}</span>
            </button>
            {user ? (
              <>
                <button
                  onClick={() => navigate('/profile')}
                  className="text-left transition-all duration-500 text-accent "
                >
                  {t('user_profile')}
                </button>
                <button
                  onClick={() => setLogoutConfirm(true)}
                  className="text-left transition-all duration-500 text-accent "
                >
                  {t('user_logout')}
                </button>
              </>
            ) : (
              <button
                onClick={handleAuthClick}
                className="bg-secondary text-primary border border-primary px-6 py-1.5 rounded hover:bg-primary hover:text-accent transition-all"
              >
                {t('user_login')}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {logoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80">
          <div className="p-6 text-center text-white shadow-lg rounded-2xl bg-dark">
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
  );
};

UserNavbar.propTypes = {
  onAuthClick: PropTypes.func.isRequired,
};

export default UserNavbar;