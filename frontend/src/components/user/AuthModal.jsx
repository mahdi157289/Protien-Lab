import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { UserIcon, EnvelopeIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import signUpImage from '../../assets/images/common/signup.jpg'
import signInImage from '../../assets/images/common/signin.jpg'
import  {useAuth} from '../../contexts/AuthContext'
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const formVariants = {
  initial: { x: -20, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: 20, opacity: 0 }
};

const sideContentVariants = {
  initial: { x: 20, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: -20, opacity: 0 }
};

const AuthModal = ({ isOpen, onClose, authType }) => {
  const [isSignUp, setIsSignUp] = useState(authType === 'signup');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, signup } = useAuth();
  const { t } = useTranslation();

  useEffect(() => {
    setIsSignUp(authType === 'signup');
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
    });
    setError('');
  }, [authType]);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

  const validateForm = () => {
    if (isSignUp) {
      if (!formData.firstName || !formData.lastName) {
        setError(t('auth_error_name_required'));
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setError(t('auth_error_password_match'));
        return false;
      }
    }
    if (!formData.email) {
      setError(t('auth_error_email_required'));
      return false;
    }
    if (!formData.password) {
      setError(t('auth_error_password_required'));
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      let response;
      if (isSignUp) {
        response = await signup({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword
        });

        if (response.success) {
          // auto-login then close and emit success
          const loginResp = await login(formData.email, formData.password);
          if (loginResp.success) {
            onClose();
            try { window.dispatchEvent(new Event('auth-success')); } catch {}
          } else {
            setIsSignUp(false);
            setError(t('auth_success_signup'));
          }
        } else {
          setError(response.error);
        }
      } else {
        response = await login(formData.email, formData.password);

        if (response.success) {
          onClose();
          try { window.dispatchEvent(new Event('auth-success')); } catch {}
        } else {
          setError(response.error);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || t('auth_error_generic'));
    } finally {
      setLoading(false);
    }
  };

  const StatusMessage = () => (
    error && (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-2 mb-4 text-sm text-center rounded ${
          error.includes(t('auth_success_signup')) 
            ? 'text-green-500 bg-green-100'
            : '#40ee45 bg-red-100'
        }`}
      >
        {error}
      </motion.div>
    )
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black bg-opacity-70"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="relative flex flex-col w-full max-w-lg sm:max-w-xl md:max-w-4xl min-h-[500px] max-h-screen overflow-hidden bg-secondary rounded-[40px] md:flex-row"
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.5}}
          >
            {/* Close Button */}
            <motion.button
              onClick={onClose}
              className="absolute text-3xl text-accent right-6 top-6 hover:text-primary"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </motion.button>

            {/* Left Section */}
            <div className={`transition-all duration-500 ease-in-out w-full md:w-1/2 p-8 flex items-center justify-center ${isSignUp ? 'order-1' : 'order-2'} max-h-full overflow-y-auto`}>
              <AnimatePresence mode="wait">
                {isSignUp ? (
                  <motion.div
                    key="signup"
                    className="w-full max-w-sm"
                    variants={formVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={{ duration: 0.5 }}
                  >
                    <h2 className="mb-6 text-2xl font-bold text-center lg:text-3xl text-accent">{t('auth_signup_title')}</h2>
                    <form onSubmit={handleSubmit} className="space-y-2 sm:space-y-4">
                    <StatusMessage />
                      <div className="grid grid-cols-1 gap-2 sm:gap-4 sm:grid-cols-2">
                        <div className="relative">
                          <UserIcon className="absolute w-5 h-5 transform -translate-y-1/2 left-3 top-1/2 text-accent" />
                          <input
                            type="text"
                            id="firstName"
                            name="firstName"
                            placeholder={t('auth_first_name')}
                            value={formData.firstName}
                            onChange={handleInputChange}
                            className="w-full p-2 pl-10 border rounded outline-none sm:p-3 text-accent bg-secondary border-accent/50 focus:border-accent sm:pl-[calc(2rem+8px)]"
                          />
                        </div>
                        <div className="relative">
                          <UserIcon className="absolute w-5 h-5 transform -translate-y-1/2 left-3 top-1/2 text-accent" />
                          <input
                            type="text"
                            id="lastName"
                            name="lastName"
                            placeholder={t('auth_last_name')}
                            value={formData.lastName}
                            onChange={handleInputChange}
                            className="w-full p-2 pl-10 border rounded outline-none sm:p-3 text-accent bg-secondary border-accent/50 focus:border-accent sm:pl-[calc(2rem+8px)]"
                          />
                        </div>
                      </div>
                      <div className="relative">
                        <EnvelopeIcon className="absolute w-5 h-5 transform -translate-y-1/2 left-3 top-1/2 text-accent" />
                        <input
                          type="email"
                          id="email"
                          name="email"
                          placeholder={t('auth_email')}
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full p-2 pl-10 border rounded outline-none sm:p-3 text-accent bg-secondary border-accent/50 focus:border-accent sm:pl-[calc(2rem+8px)]"
                        />
                      </div>
                      <div className="relative">
                        <LockClosedIcon className="absolute w-5 h-5 transform -translate-y-1/2 left-3 top-1/2 text-accent" />
                        <input
                          type="password"
                          id="password"
                          name="password"
                          placeholder={t('auth_password')}
                          value={formData.password}
                          onChange={handleInputChange}
                          className="w-full p-2 pl-10 border rounded outline-none sm:p-3 text-accent bg-secondary border-accent/50 focus:border-accent sm:pl-[calc(2rem+8px)]"
                        />
                      </div>
                      <div className="relative">
                        <LockClosedIcon className="absolute w-5 h-5 transform -translate-y-1/2 left-3 top-1/2 text-accent" />
                        <input
                          type="password"
                          id="confirm-password"
                          name="confirmPassword"
                          placeholder={t('auth_confirm_password')}
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          className="w-full p-2 pl-10 border rounded outline-none sm:p-3 text-accent bg-secondary border-accent/50 focus:border-accent sm:pl-[calc(2rem+8px)]"
                        />
                      </div>
                      <motion.button
                        type="submit"
                        className="block px-8 py-3 mx-auto text-base transition duration-500 text-accent rounded-xl bg-primary hover:bg-green-600 md:text-lg"
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {t('auth_signup_btn')}
                      </motion.button>
                    </form>
                  </motion.div>
                ) : (
                  <motion.div
                    key="signin"
                    className="w-full max-w-sm"
                    variants={formVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={{ duration: 0.5 }}
                  >
                    <h2 className="mb-6 text-2xl font-bold text-center lg:text-3xl text-accent">{t('auth_signin_title')}</h2>
                    <form onSubmit={handleSubmit} className="space-y-2 sm:space-y-4">
                    <StatusMessage />
                      <div className="relative">
                        <EnvelopeIcon className="absolute w-5 h-5 transform -translate-y-1/2 left-3 top-1/2 text-accent" />
                        <input
                          type="email"
                          id="email"
                          name="email"
                          placeholder={t('auth_email')}
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full p-2 sm:pl-[calc(2rem+8px)] pl-10 border rounded outline-none sm:p-3 text-accent bg-secondary border-accent/50 focus:border-accent"
                        />
                      </div>
                      <div className="relative">
                        <LockClosedIcon className="absolute w-5 h-5 transform -translate-y-1/2 left-3 top-1/2 text-accent" />
                        <input
                          type="password"
                          id="password"
                          name="password"
                          placeholder={t('auth_password')}
                          value={formData.password}
                          onChange={handleInputChange}
                          className="w-full p-2 pl-10 border rounded outline-none sm:p-3 text-accent bg-secondary border-accent/50 focus:border-accent sm:pl-[calc(2rem+8px)]"
                        />
                      </div>
                      <motion.button
                        type="submit"
                        disabled={loading}
                        className={`block px-8 py-3 mx-auto text-base transition duration-500 text-accent rounded-xl bg-primary ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-green-600'} md:text-lg`}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {loading ? t('auth_signing_in') : t('auth_signin_btn')}
                      </motion.button>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Right Section */}
            <div className={`transition-all duration-500 ease-in-out w-full md:w-1/2 ${isSignUp ? 'order-2' : 'order-1'}`}>
              <div
                className="h-full bg-center bg-cover rounded-[40px]"
                style={{ backgroundImage: `url(${isSignUp ? signUpImage : signInImage})` }}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={isSignUp ? 'signup-side' : 'signin-side'}
                    className="flex flex-col items-center justify-center h-full p-6 text-accent bg-black bg-opacity-50 rounded-[40px] space-y-4 sm:space-y-6"
                    variants={sideContentVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={{ duration: 0.5 }}
                  >
                    {isSignUp ? (
                      <>
                        <h3 className="text-2xl font-bold text-center sm:text-3xl md:text-3xl lg:text-4xl">{t('auth_join_title')}</h3>
                        <p className="text-sm text-center sm:text-base md:text-lg lg:text-lg">{t('auth_join_subtitle')}</p>
                        <div className="mt-6 text-center">
                          <motion.button
                            onClick={() => setIsSignUp(!isSignUp)}
                            className="w-full px-8 py-3 text-base transition duration-500 rounded-xl text-primary bg-secondary border-primary hover:bg-primary hover:text-accent md:text-lg"
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            {t('auth_signin_btn')}
                          </motion.button>
                        </div>
                      </>
                    ) : (
                      <>
                        <h3 className="text-2xl font-bold text-center sm:text-3xl md:text-3xl lg:text-4xl">{t('auth_welcome_back')}</h3>
                        <p className="text-sm text-center sm:text-base md:text-lg lg:text-lg">{t('auth_welcome_subtitle')}</p>
                        <div className="mt-6 text-center">
                          <motion.button
                            onClick={() => setIsSignUp(!isSignUp)}
                            className="w-full px-8 py-3 text-base transition duration-500 rounded-xl text-primary bg-secondary border-primary hover:bg-primary hover:text-accent md:text-lg"
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            {t('auth_signup_btn')}
                          </motion.button>
                        </div>
                      </>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

AuthModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  authType: PropTypes.oneOf(['login', 'signup']).isRequired,
};

export default AuthModal;