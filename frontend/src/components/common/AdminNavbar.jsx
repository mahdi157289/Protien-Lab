import { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { NavLink, useNavigate } from 'react-router-dom';
import { UserCircle, LogOut, Settings } from 'lucide-react';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import logo from '../../assets/images/common/Protein-Lab.png';
import { useTranslation } from 'react-i18next';
import { LiaLanguageSolid } from "react-icons/lia"; // Add this import

const AdminNavbar = ({ onAuthClick }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false);
  const { admin, logout } = useAdminAuth();
  const [logoutConfirm, setLogoutConfirm] = useState(false);
  const navigate = useNavigate();
  const { t, i18n } = useTranslation(); // Add this to get i18n instance

  const adminMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (adminMenuRef.current && !adminMenuRef.current.contains(event.target)) {
        setIsAdminMenuOpen(false);
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

  const handleLogout = async () => {
    setLogoutConfirm(false);
    try {
      logout();
      navigate('/admin/login');
      closeMenu();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === "en" ? "fr" : "en");
  };

  const navItems = [
    { label: t('admin_dashboard'), path: '/admin/dashboard' },
    { label: t('admin_exercises'), path: '/admin/exercises' },
    { label: t('admin_diet_plan'), path: '/admin/diet-plan' },
    { label: t('admin_victory_wall'), path: '/admin/victory-wall' },
    { label: t('admin_store'), path: '/admin/store' },
    { label: t('admin_users'), path: '/admin/users' },
    { label: t('admin_feedback'), path: '/admin/feedback' },
  ];

  return (
    <nav style={{ background: "linear-gradient(60deg, rgba(88, 88, 88, 1) 80%, rgba(255, 250, 252, 1) 100%)" }} className="fixed top-0 z-40 w-full px-6 py-4 bg-dark bg-opacity-95">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center h-16">
            <NavLink to="/admin/dashboard" className="h-full">
              <img 
                src={logo} 
                alt="Protein Lab Admin" 
                className="h-full object-contain" 
                style={{ maxWidth: '200px' }}
              />
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
                      : 'text-primary after:absolute after:bottom-[-5px] after:left-0 after:w-full after:h-[1px] after:bg-primary after:transform after:scale-x-0 after:origin-left after:transition-transform after:duration-300 '
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

          {/* Admin Menu */}
          <div className="hidden md:block">
            {admin ? (
              <div className="flex items-center gap-4">
                <div className="relative" ref={adminMenuRef}>
                  <button
                    onClick={() => setIsAdminMenuOpen(!isAdminMenuOpen)}
                    className="flex items-center justify-center w-10 h-10 transition-colors rounded-full bg-secondary text-accent "
                  >
                    <UserCircle className="w-10 h-10" />
                  </button>
                  {isAdminMenuOpen && (
                    <div className="absolute right-0 w-48 px-5 py-5 mt-6 space-y-4 rounded-xl bg-dark">
                      <button
                        onClick={() => {
                          navigate('/admin/profile');
                          setIsAdminMenuOpen(false);
                        }}
                        className="flex items-center w-full gap-4 text-lg text-left transition-colors text-accent "
                      >
                        <Settings className="w-6 h-6" />
                        {t('admin_settings')}
                      </button>
                      <hr className="border-t border-accent" />
                      <button
                        onClick={() => {
                          setLogoutConfirm(true);
                          setIsAdminMenuOpen(false);
                        }}
                        className="flex items-center w-full gap-4 text-lg text-left transition-colors text-accent "
                      >
                        <LogOut className="w-6 h-6" />
                        {t('admin_logout')}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <button
                onClick={onAuthClick}
                className="bg-secondary text-primary border border-primary px-6 py-1.5 rounded-lg hover:bg-primary hover:text-accent transition-all text-base md:text-lg"
              >
                {t('admin_login')}
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
                  `text-accent hover:bg-green-600 transition-all duration-500 relative ${
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
            {admin ? (
              <>
                <button
                  onClick={() => navigate('/admin/profile')}
                  className="text-left transition-all duration-500 text-accent hover:bg-green-600"
                >
                  {t('admin_settings')}
                </button>
                <button
                  onClick={() => setLogoutConfirm(true)}
                  className="text-left transition-all duration-500 text-accent hover:bg-green-600"
                >
                  {t('admin_logout')}
                </button>
              </>
            ) : (
              <button
                onClick={onAuthClick}
                className="bg-secondary text-primary border border-primary px-6 py-1.5 rounded hover:bg-primary hover:text-accent transition-all"
              >
                {t('admin_login')}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {logoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80">
          <div className="p-6 text-center text-white shadow-lg rounded-2xl bg-dark">
            <h2 className="mb-3 text-2xl font-bold">{t('admin_logout_title')}</h2>
            <p className="mb-4">{t('admin_logout_confirm')}</p>
            <div className="flex justify-center gap-10">
              <button
                onClick={() => setLogoutConfirm(false)}
                className="px-8 py-2 transition border rounded-lg text-primary bg-secondary hover:bg-dark border-primary"
              >
                {t('admin_cancel')}
              </button>
              <button
                onClick={handleLogout}
                className="px-8 py-2 transition border rounded-lg border-primary bg-primary hover:bg-green-700"
              >
                {t('admin_logout')}
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

AdminNavbar.propTypes = {
  onAuthClick: PropTypes.func,
};

export default AdminNavbar;