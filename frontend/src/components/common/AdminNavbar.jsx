import { useState, useRef, useEffect } from 'react'; // Add useRef and useEffect
import PropTypes from 'prop-types';
import { NavLink, useNavigate } from 'react-router-dom';
import { UserCircle, LogOut, Settings } from 'lucide-react';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import logo from '../../assets/images/common/Protein-Lab.png';

const AdminNavbar = ({ onAuthClick }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false); // State for admin menu visibility
  const { admin, logout } = useAdminAuth();
  const [logoutConfirm, setLogoutConfirm] = useState(false);
  const navigate = useNavigate();

  // Ref for the admin menu dropdown
  const adminMenuRef = useRef(null);

  // Close admin menu when clicking outside
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
      navigate('/admin/login'); // Redirect to admin login page
      closeMenu();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const navItems = [
    { label: 'Dashboard', path: '/admin/dashboard' },
    { label: 'Exercises', path: '/admin/exercises' },
    { label: 'Diet Plan', path: '/admin/diet-plan' },
    { label: 'Victory Wall', path: '/admin/victory-wall' },
    { label: 'Store', path: '/admin/store' },
    { label: 'Users', path: '/admin/users' },
    { label: 'Feedback', path: '/admin/feedback' },
  ];

  return (
    <nav style={{ background: "linear-gradient(60deg, rgba(88, 88, 88, 1) 80%, rgba(255, 250, 252, 1) 100%)" }} className="fixed top-0 z-40 w-full px-6 py-4 bg-dark bg-opacity-95">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <NavLink to="/admin/dashboard" className="h-8">
              <img src={logo} alt="Protein Lab Admin" className=" max-h-[100px]" />
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
          </div>

          {/* Admin Menu */}
          <div className="hidden md:block">
            {admin ? (
              <div className="flex items-center gap-4">
                <div className="relative" ref={adminMenuRef}>
                  <button
                    onClick={() => setIsAdminMenuOpen(!isAdminMenuOpen)} // Toggle admin menu on click
                    className="flex items-center justify-center w-10 h-10 transition-colors rounded-full bg-secondary text-accent "
                  >
                    <UserCircle className="w-10 h-10" />
                  </button>
                  {/* Admin Menu Dropdown */}
                  {isAdminMenuOpen && (
                    <div className="absolute right-0 w-48 px-5 py-5 mt-6 space-y-4 rounded-xl bg-dark">
                      <button
                        onClick={() => {
                          navigate('/admin/profile');
                          setIsAdminMenuOpen(false); // Close menu after navigation
                        }}
                        className="flex items-center w-full gap-4 text-lg text-left transition-colors text-accent "
                      >
                        <Settings className="w-6 h-6" />
                        Settings
                      </button>
                      <hr className="border-t border-accent" />
                      <button
                        onClick={() => {
                          setLogoutConfirm(true);
                          setIsAdminMenuOpen(false); // Close menu after clicking logout
                        }}
                        className="flex items-center w-full gap-4 text-lg text-left transition-colors text-accent "
                      >
                        <LogOut className="w-6 h-6" />
                        Logout
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
                Login
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
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
            {admin ? (
              <>
                <button
                  onClick={() => navigate('/admin/profile')}
                  className="text-left transition-all duration-500 text-accent hover:bg-green-600"
                >
                  Settings
                </button>
                <button
                  onClick={() => setLogoutConfirm(true)}
                  className="text-left transition-all duration-500 text-accent hover:bg-green-600"
                >
                  Logout
                </button>
              </>
            ) : (
              <button
                onClick={onAuthClick}
                className="bg-secondary text-primary border border-primary px-6 py-1.5 rounded hover:bg-primary hover:text-accent transition-all"
              >
                Login
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {logoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80">
          <div className="p-6 text-center text-white shadow-lg rounded-2xl bg-dark">
            <h2 className="mb-3 text-2xl font-bold">Log Out</h2>
            <p className="mb-4">Are you sure you want to log out of your account?</p>
            <div className="flex justify-center gap-10">
              <button
                onClick={() => setLogoutConfirm(false)}
                className="px-8 py-2 transition border rounded-lg text-primary bg-secondary hover:bg-dark border-primary"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="px-8 py-2 transition border rounded-lg border-primary bg-primary hover:bg-green-700"
              >
                Log Out
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