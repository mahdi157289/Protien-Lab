import { useState, useEffect, memo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../config/api';
import PropTypes from 'prop-types';

const InputField = memo(({ label, name, value, onChange, isEditing, type = "text", width = "full" }) => (
  <div className={`mb-6 w-${width}`}>
    <label className="block mb-2 text-sm">
      {label}
    </label>
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

InputField.displayName = 'InputField';

InputField.propTypes = {
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func.isRequired,
  isEditing: PropTypes.bool.isRequired,
  type: PropTypes.string,
  width: PropTypes.oneOf(['full', 'half', 'quarter'])
};

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    mobileNumber: '',
    gender: '',
    weight: '',
    height: '',
    profileImage: ''
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get('/profile');
      setFormData(response.data);
      setLoading(false);
    } catch (error) {
      setError('Error fetching profile');
      setLoading(false);
      console.error('Error fetching profile:', error);
    }
  };

  const handleEdit = () => {
    setIsEditing(!isEditing);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleImageUpload = async () => {
    if (!selectedImage) return;

    const formData = new FormData();
    formData.append('profileImage', selectedImage);

    try {
      const response = await api.post('/profile/upload-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setFormData(prev => ({
        ...prev,
        profileImage: response.data.profileImage
      }));

      updateUser({
        ...user,
        profileImage: response.data.profileImage
      });

      setSelectedImage(null);
      setImagePreview(null);
    } catch (error) {
      setError('Error uploading image');
      console.error('Error uploading image:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      const response = await api.put('/profile', formData);
      setFormData(response.data);
      updateUser({
        ...user,
        ...response.data
      });

      if (selectedImage) {
        await handleImageUpload();
      }

      setIsEditing(false);
      setError('');
    } catch (error) {
      setError('Error updating profile');
      console.error('Error updating profile:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] py-16">
      <div className="max-w-4xl p-8 mx-auto rounded-3xl bg-dark">
        {error && (
          <div className="p-4 mb-4 rounded bg-primary">
            {error}
          </div>
        )}

        <div className="flex items-center justify-between mb-8">
          <h1 className="pl-8 text-3xl font-bold ">My Profile</h1>
          <button
            onClick={handleEdit}
            className="flex items-center gap-2 px-4 py-2 transition-colors rounded-lg bg-secondary hover:bg-secondary/50"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
              />
            </svg>
            {isEditing ? 'Cancel' : 'Edit'}
          </button>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="flex flex-col items-center">
            <div className="w-48 h-48 mb-4 overflow-hidden rounded-full bg-secondary">
              <img
                src={imagePreview ||
                     (formData.profileImage ? `${import.meta.env.VITE_IMAGE_URL}/${formData.profileImage}` : "/api/placeholder/192/192")}
                alt="Profile"
                className="object-cover w-full h-full"
              />
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
              <InputField
                label="First Name"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                isEditing={isEditing}
                type="text"
              />
              <InputField
                label="Email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                isEditing={isEditing}
                type="email"
              />
              <InputField
                label="Address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                isEditing={isEditing}
                type="text"
              />
              <InputField
                label="Mobile Number"
                name="mobileNumber"
                value={formData.mobileNumber}
                onChange={handleChange}
                isEditing={isEditing}
                type="tel"
              />
            </div>

            <div>
              <InputField
                label="Last Name"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                isEditing={isEditing}
                type="text"
              />
              <div className="grid grid-cols-2 gap-4">
                <InputField
                  label="Weight"
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  isEditing={isEditing}
                  type="number"
                />
                <InputField
                  label="Height"
                  name="height"
                  value={formData.height}
                  onChange={handleChange}
                  isEditing={isEditing}
                  type="number"
                />
              </div>
              <div className="mb-6">
                <label className="block mb-2 text-sm">
                  Gender
                </label>
                <select
                  name="gender"
                  value={formData.gender || ''}
                  onChange={handleChange}
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