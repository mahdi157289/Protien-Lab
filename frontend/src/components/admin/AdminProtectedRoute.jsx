import PropTypes from 'prop-types';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const AdminProtectedRoute = ({ children }) => {
  const { admin, loading } = useAdminAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 rounded-full border-primary border-t-transparent animate-spin"></div>
      </div>
    );
  }

  if (admin) {
    return children;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-4 text-accent">
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
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
          </div>

          <h2 className="mb-4 text-2xl font-bold text-accent">{t('admin_protected_access_required')}</h2>
          <p className="mb-6 text-accent/80">
            {t('admin_protected_access_message')}
          </p>

          <div className="space-y-3">
            <button
              className="w-full px-4 py-2 transition-colors duration-200 rounded-md bg-primary hover:bg-primary/70 text-accent"
              onClick={() => navigate('/admin/register')}
            >
              {t('admin_protected_register')}
            </button>
            <button
              className="w-full px-4 py-2 transition-colors duration-200 rounded-md bg-secondary hover:bg-secondary/60 text-accent"
              onClick={() => window.history.back()}
            >
              {t('admin_protected_go_back')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

AdminProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AdminProtectedRoute;