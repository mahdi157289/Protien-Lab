import { motion } from 'framer-motion';
import { useState, useEffect, memo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { User } from 'lucide-react';
import api from '../../config/api';
import PropTypes from 'prop-types';
import { Loader } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const InputField = memo(({ label, name, value, onChange, isEditing, type = "text" }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
    <label className="block mb-2 text-sm text-white">{label}</label>
    <input
      type={type}
      name={name}
      value={value || ''}
      onChange={onChange}
      disabled={!isEditing}
      className="w-full p-2 border rounded bg-secondary border-accent/50 focus:outline-none focus:border-accent"
    />
  </motion.div>
));

InputField.propTypes = {
  label: PropTypes.string,
  name: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  isEditing: PropTypes.bool.isRequired,
  type: PropTypes.string,
};

InputField.displayName = 'InputField';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', address: '', mobileNumber: '', gender: '', weight: '', height: '', profileImage: ''
  });
  const { t } = useTranslation();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/profile');
        setFormData(response.data);
      } catch (err) {
        setError(t('profile_fetch_error'));
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
      <div className="min-h-[calc(100vh-4rem)] py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }} className="max-w-4xl p-8 mx-auto rounded-3xl bg-dark">
          {error && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="p-4 mb-4 rounded bg-primary">{error}</motion.div>}
          
          <motion.div className="flex items-center justify-between mb-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}>
            <h1 className="pl-8 text-3xl font-bold">{t('profile_title')}</h1>
            <motion.button
              onClick={() => setIsEditing(!isEditing)}
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2 px-4 py-2 transition-colors rounded-lg bg-secondary hover:bg-secondary/50"
            >
              {isEditing ? t('profile_cancel') : t('profile_edit')}
            </motion.button>
          </motion.div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1 }} className="flex flex-col items-center">
              <div className="flex items-center justify-center w-48 h-48 mb-4 overflow-hidden rounded-full bg-secondary">
                <User size={96} className="text-accent" />
              </div>
            </motion.div>

            <motion.div className="grid grid-cols-1 gap-6 md:col-span-2 md:grid-cols-2">
              <InputField label={t('profile_first_name')} name="firstName" value={formData.firstName} onChange={e => setFormData({ ...formData, [e.target.name]: e.target.value })} isEditing={isEditing} />
              <InputField label={t('profile_email')} name="email" value={formData.email} onChange={e => setFormData({ ...formData, [e.target.name]: e.target.value })} isEditing={false} type="email" />
              <InputField label={t('profile_address')} name="address" value={formData.address} onChange={e => setFormData({ ...formData, [e.target.name]: e.target.value })} isEditing={isEditing} />
              <InputField label={t('profile_mobile_number')} name="mobileNumber" value={formData.mobileNumber} onChange={e => setFormData({ ...formData, [e.target.name]: e.target.value })} isEditing={isEditing} type="tel" />
              <InputField label={t('profile_last_name')} name="lastName" value={formData.lastName} onChange={e => setFormData({ ...formData, [e.target.name]: e.target.value })} isEditing={isEditing} />
            </motion.div>
          </div>

          {isEditing && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="flex justify-end mt-8">
              <motion.button 
                onClick={() => setIsEditing(false)} 
                whileHover={{ scale: 1.05 }}
                className="px-4 py-2 transition-colors border rounded-lg bg-primary hover:bg-green-600 hover:border-primary"
              >
                {t('profile_save_changes')}
              </motion.button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Profile;