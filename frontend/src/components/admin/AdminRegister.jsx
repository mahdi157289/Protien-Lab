import { useState } from 'react';
import { registerAdmin } from '../../config/adminApi';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const AdminRegister = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setIsSubmitting(true);

    try {
      // Basic validation
      if (!form.name || !form.email || !form.password) {
        throw new Error(t('admin_register_error_required'));
      }
      
      if (form.password.length < 6) {
        throw new Error(t('admin_register_error_password_length'));
      }

      if (!form.email.includes('@')) {
        throw new Error(t('admin_register_error_email'));
      }

      await registerAdmin(form);
      setSuccess(true);
      setForm({ name: '', email: '', password: '' });
      
      // Redirect after a short delay to show success message
      setTimeout(() => {
        navigate('/admin/login');
      }, 2000);
    } catch (error) {
      setError(error.response?.data?.message || error.message || t('admin_register_error_generic'));
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
              <span className="font-source-sans">{t('admin_register_success')}</span>
            </div>
          </div>
        )}

        <h2 className="text-2xl font-bold text-center text-[#FFFCF9] font-orbitron">
          {t('admin_register_title')}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block mb-1 text-sm font-medium text-[#FFFCF9] font-source-sans">
              {t('admin_register_name')}
            </label>
            <input
              type="text"
              id="name"
              placeholder={t('admin_register_name_placeholder')}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-2 text-sm border rounded-lg shadow-sm focus:ring-2 focus:ring-[#40ee45] focus:outline-none bg-[#29292A] text-[#FFFCF9] border-[#FFFCF9] font-source-sans"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label htmlFor="email" className="block mb-1 text-sm font-medium text-[#FFFCF9] font-source-sans">
              {t('admin_register_email')}
            </label>
            <input
              type="email"
              id="email"
              placeholder={t('admin_register_email_placeholder')}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-4 py-2 text-sm border rounded-lg shadow-sm focus:ring-2 focus:ring-[#40ee45] focus:outline-none bg-[#29292A] text-[#FFFCF9] border-[#FFFCF9] font-source-sans"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label htmlFor="password" className="block mb-1 text-sm font-medium text-[#FFFCF9] font-source-sans">
              {t('admin_register_password')}
            </label>
            <input
              type="password"
              id="password"
              placeholder={t('admin_register_password_placeholder')}
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
            {isSubmitting ? t('admin_register_registering') : t('admin_register_register')}
          </button>
        </form>

        <p className="mt-4 text-sm text-center text-[#FFFCF9] font-source-sans">
          {t('admin_register_already_account')}{' '}
          <button
            onClick={() => navigate('/admin/login')}
            className="text-[#40ee45] hover:underline disabled:opacity-50 transition-colors font-source-sans"
            disabled={isSubmitting}
          >
            {t('admin_register_login_here')}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AdminRegister;