import { useState, useEffect, memo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { User } from 'lucide-react';
import api from '../../config/api';
import PropTypes from 'prop-types';

const InputField = memo(({ label, name, value, onChange, isEditing, type = "text" }) => (
  <div className="mb-6">
    <label className="block mb-2 text-sm">{label}</label>
    <input
      type={type}
      name={name}
      value={value || ''}
      onChange={onChange}
      disabled={!isEditing}
      className="w-full p-2 border rounded bg-secondary border-accent/50 focus:outline-none focus:border-accent"
    />
  </div>
));

InputField.propTypes = {
  label: PropTypes.string, // Label is optional
  name: PropTypes.string, // Name is required
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]), // Value can be a string or number
  onChange: PropTypes.func, // onChange must be a function
  isEditing: PropTypes.bool.isRequired, // isEditing must be a boolean
  type: PropTypes.string, // Type is optional and defaults to "text"
};

InputField.displayName = 'InputField';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [imageError, setImageError] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', address: '', 
    mobileNumber: '', gender: '', weight: '', height: '', profileImage: ''
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/profile');
        setFormData(response.data);
      } catch (err) {
        setError('Error fetching profile');
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    setImageError(false);
  }, [imagePreview, formData.profileImage]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
      setImageError(false);
    }
  };

  const handleImageUpload = async () => {
    if (!selectedImage) return;
    try {
      const formData = new FormData();
      formData.append('profileImage', selectedImage);
      const response = await api.post('/profile/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setFormData(prev => ({ ...prev, profileImage: response.data.profileImage }));
      updateUser({ ...user, profileImage: response.data.profileImage });
      setSelectedImage(null);
      setImagePreview(null);
    } catch (err) {
      setError('Error uploading image');
      console.error('Error uploading image:', err);
    }
  };

  const handleSubmit = async () => {
    try {
      const response = await api.put('/profile', formData);
      setFormData(response.data);
      updateUser({ ...user, ...response.data });
      if (selectedImage) await handleImageUpload();
      setIsEditing(false);
      setError('');
    } catch (err) {
      setError('Error updating profile');
      console.error('Error updating profile:', err);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  const shouldShowImage = (imagePreview || formData.profileImage) && !imageError;

  return (
    <div className="min-h-[calc(100vh-4rem)] py-16">
      <div className="max-w-4xl p-8 mx-auto rounded-3xl bg-dark">
        {error && <div className="p-4 mb-4 rounded bg-primary">{error}</div>}

        <div className="flex items-center justify-between mb-8">
          <h1 className="pl-8 text-3xl font-bold">My Profile</h1>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-2 px-4 py-2 transition-colors rounded-lg bg-secondary hover:bg-secondary/50"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            {isEditing ? 'Cancel' : 'Edit'}
          </button>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center w-48 h-48 mb-4 overflow-hidden rounded-full bg-secondary">
              {shouldShowImage ? (
                <img
                  src={imagePreview || `${import.meta.env.VITE_IMAGE_URL}/${formData.profileImage}`}
                  alt="Profile"
                  className="object-cover w-full h-full"
                  onError={() => setImageError(true)}
                />
              ) : (
                <User size={96} className="text-accent" />
              )}
            </div>
            {isEditing && (
              <div className="mt-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="profile-image-input"
                />
                <label
                  htmlFor="profile-image-input"
                  className="px-4 py-2 transition-colors rounded-lg cursor-pointer bg-secondary hover:bg-secondary/50"
                >
                  Choose Image
                </label>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-6 md:col-span-2 md:grid-cols-2">
            <div>
              <InputField label="First Name" name="firstName" value={formData.firstName} onChange={e => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))} isEditing={isEditing} />
              <InputField label="Email" name="email" value={formData.email} onChange={e => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))} isEditing={isEditing} type="email" />
              <InputField label="Address" name="address" value={formData.address} onChange={e => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))} isEditing={isEditing} />
              <InputField label="Mobile Number" name="mobileNumber" value={formData.mobileNumber} onChange={e => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))} isEditing={isEditing} type="tel" />
            </div>

            <div>
              <InputField label="Last Name" name="lastName" value={formData.lastName} onChange={e => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))} isEditing={isEditing} />
              <div className="grid grid-cols-2 gap-4">
                <InputField label="Weight" name="weight" value={formData.weight} onChange={e => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))} isEditing={isEditing} type="number" />
                <InputField label="Height" name="height" value={formData.height} onChange={e => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))} isEditing={isEditing} type="number" />
              </div>
              <div className="mb-6">
                <label className="block mb-2 text-sm">Gender</label>
                <select
                  name="gender"
                  value={formData.gender || ''}
                  onChange={e => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                  disabled={!isEditing}
                  className="w-full p-2 border rounded border-accent/50 bg-secondary focus:outline-none focus:border-accent"
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {isEditing && (
          <div className="flex justify-end mt-8">
            <button
              onClick={handleSubmit}
              className="px-4 py-2 transition-colors border rounded-lg bg-primary hover:bg-red-600 hover:border-primary"
            >
              Save Changes
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;