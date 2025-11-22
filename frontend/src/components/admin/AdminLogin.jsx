import { useState } from 'react';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const AdminLogin = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAdminAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setIsSubmitting(true);

    try {
      if (!form.email || !form.password) {
        throw new Error(t('admin_login_required_fields'));
      }

      if (!form.email.includes('@')) {
        throw new Error(t('admin_login_invalid_email'));
      }

      await login(form.email, form.password);
      setSuccess(true);
      
      // Redirect after successful login
      setTimeout(() => {
        navigate('/admin/dashboard');
      }, 1000);
    } catch (error) {
      setError(error.response?.data?.message || error.message || t('admin_login_failed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
      <div className="w-full max-w-md p-6 space-y-4 rounded-lg shadow-md bg-[#1C1C1C]">
        {/* Custom Error Alert */}
        {error && (
          <div className="p-3 mb-4 text-sm #40ee45 border border-green-500 rounded-lg bg-green-500/10" role="alert">
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <span className="font-source-sans">{error}</span>
            </div>
          </div>
        )}

        {/* Custom Success Alert */}
        {success && (
          <div className="p-3 mb-4 text-sm text-green-500 border border-green-500 rounded-lg bg-green-500/10" role="alert">
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
              <span className="font-source-sans">{t('admin_login_success')}</span>
            </div>
          </div>
        )}

        <h2 className="text-2xl font-bold text-center text-[#FFFCF9] font-orbitron">
          {t('admin_login_title')}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block mb-1 text-sm font-medium text-[#FFFCF9] font-source-sans">
              {t('admin_login_email')}
            </label>
            <input
              type="email"
              id="email"
              placeholder={t('admin_login_email_placeholder')}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-4 py-2 text-sm border rounded-lg shadow-sm focus:ring-2 focus:ring-[#40ee45] focus:outline-none bg-[#29292A] text-[#FFFCF9] border-[#FFFCF9] font-source-sans"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label htmlFor="password" className="block mb-1 text-sm font-medium text-[#FFFCF9] font-source-sans">
              {t('admin_login_password')}
            </label>
            <input
              type="password"
              id="password"
              placeholder={t('admin_login_password_placeholder')}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full px-4 py-2 text-sm border rounded-lg shadow-sm focus:ring-2 focus:ring-[#40ee45] focus:outline-none bg-[#29292A] text-[#FFFCF9] border-[#FFFCF9] font-source-sans"
              disabled={isSubmitting}
            />
          </div>

          <button
            type="submit"
            className="w-full px-4 py-2 font-medium text-[#FFFCF9] rounded-lg bg-[#40ee45] hover:bg-[#40ee45]/90 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none transition-colors font-source-sans"
            disabled={isSubmitting}
          >
            {isSubmitting ? t('admin_login_logging_in') : t('admin_login_button')}
          </button>
        </form>

        <p className="mt-4 text-sm text-center text-[#FFFCF9] font-source-sans">
          {t('admin_login_no_account')}{' '}
          <button
            onClick={() => navigate('/admin/register')}
            className="text-[#40ee45] hover:underline disabled:opacity-50 transition-colors font-source-sans"
            disabled={isSubmitting}
          >
            {t('admin_login_register')}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;