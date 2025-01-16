import PropTypes from 'prop-types';
import { useAuth } from '../../contexts/AuthContext';

const ProtectedRoute = ({ children, onAuthClick }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-secondary">
        <div className="w-16 h-16 border-4 rounded-full border-primary border-t-transparent animate-spin"></div>
      </div>
    );
  }

  if (user) {
    return children;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-4 bg-secondary text-accent">
      <div className="max-w-md mx-auto text-center">
        <div className="p-8 rounded-lg shadow-md bg-dark">
          <div className="flex justify-center mb-6">
            <div className="p-3 rounded-full bg-primary/20">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-8 h-8 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
          </div>

          <h2 className="mb-4 text-2xl font-bold text-accent">Authentication Required</h2>
          <p className="mb-6 text-accent/80">
            This page requires you to be logged in. Please sign in or create an account to access this content.
          </p>

          <div className="space-y-3">
            <button
              className="w-full px-4 py-2 transition-colors duration-200 rounded-md bg-primary hover:bg-primary/70 text-accent"
              onClick={() => onAuthClick(true, 'login')}
            >
              Sign In
            </button>
            <button
              className="w-full px-4 py-2 transition-colors duration-200 rounded-md bg-secondary hover:bg-secondary/60 text-accent"
              onClick={() => window.history.back()}
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  onAuthClick: PropTypes.func.isRequired,
};

export default ProtectedRoute;