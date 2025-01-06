import { useState } from 'react';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import logo from '../assets/images/common/bodysync.svg';

const Navbar = ({ onAuthClick }) => {
  const [isOpen, setIsOpen] = useState(false);

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

  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'Exercises', path: '/exercises' },
    { label: 'Workouts', path: '/workouts' },
    { label: 'Diet Plan', path: '/diet-plan' },
    { label: 'Store', path: '/store' },
    { label: 'Victory Wall', path: '/victory-wall' },
  ];

  return (
    <nav className="fixed top-0 z-40 w-full px-6 py-4 bg-dark bg-opacity-95">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <NavLink to="/" className="h-8">
              <img src={logo} alt="BodySync" className="h-full" />
            </NavLink>
          </div>

          {/* Desktop Navigation */}
          <div className="items-center hidden space-x-2 md:space-x-6 lg:space-x-12 md:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.label}
                to={item.path}
                className={({ isActive }) =>
                  `text-accent transition-all duration-500 relative text-base md:text-lg
                    ${isActive
                      ? 'text-primary after:absolute after:bottom-[-5px] after:left-0 after:w-full after:h-[1px] after:bg-primary after:transform after:scale-x-100 after:origin-left after:transition-transform after:duration-300'
                      : 'text-accent after:absolute after:bottom-[-5px] after:left-0 after:w-full after:h-[1px] after:bg-primary after:transform after:scale-x-0 after:origin-left after:transition-transform after:duration-300 hover:text-primary'
                    }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>

          {/* Login Button */}
          <div className="hidden md:block">
            <button
              onClick={handleAuthClick}
              className="bg-secondary text-primary border border-primary px-6 py-1.5 rounded-lg hover:bg-primary hover:text-accent transition-all text-base md:text-lg"
            >
              Login
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button onClick={toggleMenu} className="transition-colors text-accent hover:text-primary">
              {isOpen ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div
          className={`mt-4 md:hidden transition-all duration-500 ${isOpen ? 'opacity-100 max-h-[500px] overflow-visible' : 'opacity-0 max-h-0 overflow-hidden'}`}
        >
          <div className="flex flex-col space-y-4">
            {navItems.map((item) => (
              <NavLink
                key={item.label}
                to={item.path}
                onClick={closeMenu}
                className={({ isActive }) =>
                  `text-accent hover:text-primary transition-all duration-500 relative
                  ${isActive
                    ? 'text-primary after:absolute after:bottom-0 after:left-0 after:w-full after:h-[1px] after:bg-primary after:transform after:scale-x-100 after:origin-left after:transition-transform after:duration-300' 
                    : 'after:absolute after:bottom-0 after:left-0 after:w-full after:h-[1px] after:bg-primary after:transform after:scale-x-0 after:origin-left after:transition-transform after:duration-300 hover:after:scale-x-100'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
            <button
              onClick={handleAuthClick}
              className="bg-secondary text-primary border border-primary px-6 py-1.5 rounded hover:bg-primary hover:text-accent transition-all"
            >
              Login
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

Navbar.propTypes = {
  onAuthClick: PropTypes.func.isRequired,
};

export default Navbar;