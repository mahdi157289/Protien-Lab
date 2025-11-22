import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { Upload, Trash2, Edit, Eye, Plus, X, Check, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useSmokey } from '../../contexts/SmokeyContext';
import OfferForm from './OfferForm';

const PhotoManagement = () => {
  const { token } = useAdminAuth();
  const { t } = useTranslation();
  const { smokeyOn } = useSmokey();
  const [loading, setLoading] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [brandName, setBrandName] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const initialMediaFiles = { 1: [], 2: [] };
  const [mediaFiles, setMediaFiles] = useState(initialMediaFiles);
  const [mediaUploadingSlot, setMediaUploadingSlot] = useState(null);

  const categories = [
    { value: 'Welcome', label: 'Welcome' },
    { value: 'Nos Marque', label: 'Nos Marque' },
    { value: 'Media', label: 'Media' }
  ];

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const PUBLIC_BASE_URL = API_BASE_URL.replace('/api', '');
  
  // Fix double /api issue
  const getApiUrl = (endpoint) => {
    const baseUrl = API_BASE_URL.endsWith('/api') ? API_BASE_URL : `${API_BASE_URL}/api`;
    return `${baseUrl}${endpoint}`;
  };

  const getPhotoUrl = (relativePath = '') => {
    if (!relativePath) return '';
    if (relativePath.startsWith('http')) return relativePath;
    return `${PUBLIC_BASE_URL}${relativePath}`;
  };

  const mediaPhotosBySlot = useMemo(() => {
    const slots = { 1: null, 2: null };
    photos.forEach((photo) => {
      if (photo.category === 'Media' && [1, 2].includes(Number(photo.mediaSlot))) {
        slots[Number(photo.mediaSlot)] = photo;
      }
    });
    return slots;
  }, [photos]);

  // Fetch all photos
  const fetchPhotos = async () => {
    setLoading(true);
    const url = getApiUrl('/admin/photos');
    console.log('🔍 Fetching photos from:', url);
    console.log('🔑 Token available:', !!token);
    console.log('🌐 API_BASE_URL:', API_BASE_URL);
    
    try {
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Photos fetched successfully:', response.data);
      console.log('📸 Photo data:', response.data.data);
      if (response.data.data.length > 0) {
        console.log('🔍 First photo details:', response.data.data[0]);
        console.log('🔗 Photo URL:', response.data.data[0].url);
        console.log('📁 Photo filename:', response.data.data[0].filename);
      }
      setPhotos(response.data.data);
    } catch (error) {
      console.error('❌ Error fetching photos:', error);
      console.error('📊 Error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url,
        method: error.config?.method
      });
      setError(`Failed to fetch photos: ${error.response?.status} ${error.response?.statusText || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Test connection
  const testConnection = async () => {
    const testUrl = getApiUrl('/admin/photos/test');
    console.log('🧪 Testing connection to:', testUrl);
    
    try {
      const response = await axios.get(testUrl, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Test successful:', response.data);
      return true;
    } catch (error) {
      console.error('❌ Test failed:', error);
      return false;
    }
  };

  useEffect(() => {
    if (token) {
      console.log('🚀 Component mounted, testing connection...');
      testConnection().then(success => {
        if (success) {
          console.log('✅ Connection test passed, fetching photos...');
          fetchPhotos();
        } else {
          console.log('❌ Connection test failed, check server');
        }
      });
    }
    let bc;
    try {
      bc = new BroadcastChannel('offers');
      bc.onmessage = (ev) => {
        if (ev?.data?.type === 'offers-updated') {
          fetchPhotos();
        }
      };
    } catch {}
    return () => { try { bc && bc.close(); } catch {} };
  }, [token]);

  // Handle file selection
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
  };

  // Handle drag and drop
  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    setSelectedFiles(files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const resetMediaSelections = () => {
    setMediaFiles({ 1: [], 2: [] });
    setMediaUploadingSlot(null);
  };

  const closeUploadModal = () => {
    setShowUploadModal(false);
    setSelectedCategory('');
    setSelectedFiles([]);
    setBrandName('');
    resetMediaSelections();
  };

  const handleMediaFileUpdate = (slot, files) => {
    const sanitizedFiles = files
      .filter(file => !file.type || file.type.startsWith('image/'))
      .slice(0, 2);
    setMediaFiles(prev => ({
      ...prev,
      [slot]: sanitizedFiles
    }));
  };

  const handleMediaFileSelect = (slot, e) => {
    handleMediaFileUpdate(slot, Array.from(e.target.files || []));
    e.target.value = '';
  };

  const handleMediaDrop = (slot, e) => {
    e.preventDefault();
    handleMediaFileUpdate(slot, Array.from(e.dataTransfer.files || []));
  };

  const handleMediaUpload = async (slot) => {
    if (mediaFiles[slot].length !== 2) {
      setError(`Media slot ${slot} requires exactly 2 photos`);
      return;
    }

    setMediaUploadingSlot(slot);
    setError('');

    const url = getApiUrl('/admin/photos');
    try {
      const formData = new FormData();
      formData.append('category', 'Media');
      formData.append('mediaSlot', slot);
      mediaFiles[slot].forEach((file, index) => {
        console.log(`📎 Adding media slot ${slot} file ${index + 1}:`, file.name, file.size, file.type);
        formData.append('photos', file);
      });

      const response = await axios.post(url, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log(`✅ Media slot ${slot} upload successful:`, response.data);
      setSuccess(`Media slot ${slot} updated successfully`);
      setMediaFiles(prev => ({ ...prev, [slot]: [] }));
      fetchPhotos();
      try {
        const bc = new BroadcastChannel('photos');
        bc.postMessage({ type: 'photos-updated' });
        bc.close();
      } catch {}
    } catch (error) {
      console.error(`❌ Media slot ${slot} upload failed:`, error);
      setError(error.response?.data?.message || `Failed to upload Media slot ${slot}`);
    } finally {
      setMediaUploadingSlot(null);
    }
  };

  // Upload photos
  const handleUpload = async () => {
    if (!selectedCategory || selectedFiles.length === 0) {
      setError(t('admin_photos_upload_error'));
      return;
    }

    // Validate brandName for Nos Marque
    if (selectedCategory === 'Nos Marque' && !brandName.trim()) {
      setError('Brand name is required for Nos Marque category');
      return;
    }

    setUploading(true);
    setError('');

    const url = getApiUrl('/admin/photos');
    console.log('📤 Uploading photos to:', url);
    console.log('📁 Selected files:', selectedFiles.length);
    console.log('🏷️ Selected category:', selectedCategory);
    console.log('🏭 Brand name:', brandName);
    console.log('🔑 Token available:', !!token);

    try {
      const formData = new FormData();
      formData.append('category', selectedCategory);
      if (selectedCategory === 'Nos Marque') {
        formData.append('brandName', brandName);
      }
      selectedFiles.forEach((file, index) => {
        console.log(`📎 Adding file ${index + 1}:`, file.name, file.size, file.type);
        formData.append('photos', file);
      });

      console.log('📦 FormData prepared, sending request...');

      const response = await axios.post(url, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log('✅ Upload successful:', response.data);
      setSuccess(t('admin_photos_upload_success'));
      closeUploadModal();
      fetchPhotos();
      try {
        const bc = new BroadcastChannel('photos');
        bc.postMessage({ type: selectedCategory === 'Welcome' ? 'welcome-updated' : 'photos-updated' });
        bc.close();
      } catch {}
    } catch (error) {
      console.error('❌ Upload failed:', error);
      console.error('📊 Upload error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url,
        method: error.config?.method
      });
      console.error('🔴 Backend error message:', error.response?.data?.message);
      setError(error.response?.data?.message || t('admin_photos_upload_error'));
    } finally {
      setUploading(false);
    }
  };

  // Delete photo
  const handleDelete = async (photoId) => {
    if (!window.confirm(t('admin_photos_delete_confirm'))) return;

    const url = getApiUrl(`/admin/photos/${photoId}`);
    console.log('🗑️ Deleting photo:', url);

    try {
      await axios.delete(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Photo deleted successfully');
      setSuccess(t('admin_photos_delete_success'));
      fetchPhotos();
    } catch (error) {
      console.error('❌ Delete failed:', error);
      setError(t('admin_photos_delete_error'));
    }
  };

  // Update photo
  const handleUpdate = async () => {
    if (!editingPhoto) return;

    // Validate brandName for Nos Marque
    if (editingPhoto.category === 'Nos Marque' && !editingPhoto.brandName?.trim()) {
      setError('Brand name is required for Nos Marque category');
      return;
    }

    const url = getApiUrl(`/admin/photos/${editingPhoto._id}`);
    console.log('✏️ Updating photo:', url);

    try {
      await axios.put(url, {
        category: editingPhoto.category,
        brandName: editingPhoto.brandName,
        isActive: editingPhoto.isActive
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Photo updated successfully');
      setSuccess(t('admin_photos_update_success'));
      setShowEditModal(false);
      setEditingPhoto(null);
      fetchPhotos();
    } catch (error) {
      console.error('❌ Update failed:', error);
      setError(error.response?.data?.message || t('admin_photos_update_error'));
    }
  };

  // Clear messages
  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  // Handle offer form submission
  const handleOfferSubmit = async (offerData) => {
    setUploading(true);
    setError('');

    try {
      if (editingPhoto) {
        // Handle editing existing offer
        const url = getApiUrl(`/admin/photos/${editingPhoto._id}`);
        const response = await axios.put(url, {
          category: 'Best Offers',
          offerData: JSON.stringify(offerData.offerData)
        }, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        setSuccess(t('admin_photos_update_success'));
        setShowOfferForm(false);
        setEditingPhoto(null);
        setSelectedCategory('');
        fetchPhotos();
      } else {
        // Handle creating new offer
        const formData = new FormData();
        formData.append('category', 'Best Offers');
        formData.append('offerData', JSON.stringify(offerData.offerData));
        
        // Add main photo
        if (offerData.mainPhoto) {
          formData.append('photos', offerData.mainPhoto);
        }
        
        // Add additional photo
        if (offerData.additionalPhoto) {
          formData.append('photos', offerData.additionalPhoto);
        }

        const url = getApiUrl('/admin/photos');
        const response = await axios.post(url, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });

        setSuccess(t('admin_photos_upload_success'));
        setShowOfferForm(false);
        setSelectedCategory('');
        fetchPhotos();
      }
    } catch (error) {
      console.error('❌ Offer operation failed:', error);
      setError(editingPhoto ? t('admin_photos_update_error') : t('admin_photos_upload_error'));
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(clearMessages, 5000);
    return () => clearTimeout(timer);
  }, [error, success]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 font-source-sans">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className={`text-3xl font-bold ${smokeyOn ? 'text-white' : 'text-black'}`}>{t('admin_photos_management_title')}</h1>
          <div className="flex gap-2">
          <button
            onClick={() => {
              setSelectedCategory('');
              setSelectedFiles([]);
              setBrandName('');
              resetMediaSelections();
              setShowUploadModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-dark rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus size={20} />
              {t('admin_photos_upload_photos')}
          </button>
          </div>
        </div>

        {/* Messages */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center gap-2"
            >
              <AlertCircle size={20} />
              {error}
            </motion.div>
          )}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg flex items-center gap-2"
            >
              <Check size={20} />
              {success}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Photos Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {photos.map((photo) => (
            <motion.div
              key={photo._id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-dark rounded-lg overflow-hidden shadow-lg"
            >
              <div className="relative">
                <img
                  src={getPhotoUrl(photo.url)}
                  alt={photo.filename}
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    console.error('❌ Image failed to load:', photo.url);
                    console.error('🔗 Full URL:', getPhotoUrl(photo.url));
                    e.target.style.display = 'none';
                  }}
                  onLoad={() => {
                    console.log('✅ Image loaded successfully:', photo.url);
                  }}
                />
                <div className="absolute top-2 right-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    photo.isActive ? 'bg-green-500' : 'bg-red-500'
                  }`}>
                    {photo.isActive ? t('admin_photos_active') : t('admin_photos_inactive')}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-accent mb-2">{photo.category}</h3>
                
                {/* Show brand name for Nos Marque */}
                {photo.category === 'Nos Marque' && photo.brandName && (
                  <div className="mb-2">
                    <p className="text-sm text-primary font-medium">🏭 {photo.brandName}</p>
                  </div>
                )}
                
                <p className="text-sm text-gray-400 mb-3">{photo.filename}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingPhoto(photo);
                      setShowEditModal(true);
                    }}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                  >
                    <Edit size={16} />
                    {t('admin_photos_edit')}
                  </button>
                  <button
                    onClick={() => handleDelete(photo._id)}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                  >
                    <Trash2 size={16} />
                    {t('admin_photos_delete')}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {photos.length === 0 && (
          <div className="text-center py-12">
            <Upload size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-400">{t('admin_photos_no_photos')}</p>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-dark p-6 rounded-lg w-full max-w-md mx-4"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-accent">{t('admin_photos_upload_photos')}</h2>
                <button
                  onClick={closeUploadModal}
                  className="text-gray-400 hover:text-white"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-accent mb-2">
                    {t('admin_photos_category')}
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => {
                      const value = e.target.value;
                      setSelectedCategory(value);
                      if (value !== 'Nos Marque') {
                        setBrandName('');
                      }
                      setSelectedFiles([]);
                      if (value !== 'Media') {
                        resetMediaSelections();
                      }
                    }}
                    className="w-full p-3 bg-secondary border border-gray-600 rounded-lg text-accent focus:outline-none focus:border-primary"
                  >
                    <option value="">{t('admin_photos_select_category')}</option>
                    {categories.map(category => (
                      <option key={category.value} value={category.value}>{category.label}</option>
                    ))}
                  </select>
                </div>

                {/* Brand Name input - only show for Nos Marque */}
                {selectedCategory === 'Nos Marque' && (
                  <div>
                    <label className="block text-sm font-medium text-accent mb-2">
                      Brand Name *
                    </label>
                    <input
                      type="text"
                      value={brandName}
                      onChange={(e) => setBrandName(e.target.value)}
                      placeholder="Enter brand name"
                      className="w-full p-3 bg-secondary border border-gray-600 rounded-lg text-accent focus:outline-none focus:border-primary"
                    />
                  </div>
                )}

                {selectedCategory === 'Media' && (
                  <div className="space-y-4">
                    <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-3">
                      <p className="text-sm text-blue-300">
                        Media category has two rectangles. Each rectangle must contain exactly 2 photos to enable the sliding effect.
                      </p>
                    </div>

                    <div className="flex flex-col gap-4 md:flex-row">
                      {[1, 2].map((slot) => (
                        <div key={slot} className="flex-1 bg-secondary/40 border border-gray-700 rounded-lg p-4 space-y-4">
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <div>
                              <p className="text-accent font-semibold">Rectangle {slot}</p>
                              <p className="text-xs text-gray-400">Exactly 2 photos required</p>
                            </div>
                            {mediaPhotosBySlot[slot] && (
                              <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-300">
                                Current slides ready
                              </span>
                            )}
                          </div>

                          <div
                            onDrop={(e) => handleMediaDrop(slot, e)}
                            onDragOver={handleDragOver}
                            className="border-2 border-dashed border-gray-600 rounded-lg p-4 text-center hover:border-primary transition-colors"
                          >
                            <input
                              type="file"
                              multiple
                              accept="image/*"
                              onChange={(e) => handleMediaFileSelect(slot, e)}
                              className="hidden"
                              id={`media-slot-${slot}`}
                            />
                            <label htmlFor={`media-slot-${slot}`} className="cursor-pointer flex flex-col items-center">
                              <Upload size={32} className="text-gray-400 mb-2" />
                              <p className="text-gray-400">
                                {mediaFiles[slot].length > 0
                                  ? `${mediaFiles[slot].length} file(s) selected`
                                  : 'Click or drop exactly 2 images'}
                              </p>
                            </label>
                          </div>

                          {mediaFiles[slot].length > 0 && (
                            <div className="text-left">
                              <p className="text-xs text-gray-400 mb-1">Pending upload:</p>
                              <ul className="text-sm text-accent space-y-1">
                                {mediaFiles[slot].map((file, index) => (
                                  <li key={`${slot}-file-${index}`} className="flex items-center gap-2">
                                    <span className="text-primary">•</span> {file.name}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {mediaPhotosBySlot[slot]?.slides?.length > 0 && (
                            <div>
                              <p className="text-xs text-gray-400 mb-2">Current slides:</p>
                              <div className="grid grid-cols-2 gap-3">
                                {mediaPhotosBySlot[slot].slides.map((slide, index) => (
                                  <div key={`${mediaPhotosBySlot[slot]._id}-slide-${index}`} className="relative h-20 rounded-lg overflow-hidden">
                                    <img
                                      src={getPhotoUrl(slide.url)}
                                      alt={slide.filename || `Slide ${index + 1}`}
                                      className="w-full h-full object-cover"
                                    />
                                    <span className="absolute bottom-1 right-1 text-[10px] px-2 py-0.5 rounded bg-black/60 text-white">
                                      Slide {index + 1}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          <button
                            onClick={() => handleMediaUpload(slot)}
                            disabled={mediaUploadingSlot === slot}
                            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            {mediaUploadingSlot === slot ? 'Uploading...' : `Upload rectangle ${slot}`}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedCategory && selectedCategory !== 'Media' && (
                  <div>
                    <label className="block text-sm font-medium text-accent mb-2">
                      {t('admin_photos_photos')}
                    </label>
                    <div
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-primary transition-colors"
                    >
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                        id="photo-upload"
                      />
                      <label htmlFor="photo-upload" className="cursor-pointer">
                        <Upload size={32} className="mx-auto text-gray-400 mb-2" />
                        <p className="text-gray-400">
                          {selectedFiles.length > 0 
                            ? `${selectedFiles.length} ${t('admin_photos_files_selected')}`
                            : t('admin_photos_click_to_select')
                          }
                        </p>
                      </label>
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={closeUploadModal}
                    className="flex-1 px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    {t('admin_photos_cancel')}
                  </button>
                  {selectedCategory !== 'Media' && (
                    <button
                      onClick={handleUpload}
                      disabled={
                        uploading ||
                        !selectedCategory ||
                        selectedFiles.length === 0 ||
                        (selectedCategory === 'Nos Marque' && !brandName.trim())
                      }
                      className="flex-1 px-4 py-2 bg-primary text-dark rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {uploading ? t('admin_photos_uploading') : t('admin_photos_upload')}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {showEditModal && editingPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-dark p-6 rounded-lg w-full max-w-md mx-4"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-accent">{t('admin_photos_edit_photo')}</h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-accent mb-2">
                    {t('admin_photos_category')}
                  </label>
                  <select
                    value={editingPhoto.category}
                    onChange={(e) => {
                      setEditingPhoto({...editingPhoto, category: e.target.value});
                      if (e.target.value !== 'Nos Marque') {
                        setEditingPhoto({...editingPhoto, category: e.target.value, brandName: ''});
                      }
                    }}
                    className="w-full p-3 bg-secondary border border-gray-600 rounded-lg text-accent focus:outline-none focus:border-primary"
                  >
                    {categories.map(category => (
                      <option key={category.value} value={category.value}>{category.label}</option>
                    ))}
                  </select>
                </div>

                {/* Brand Name input - only show for Nos Marque */}
                {editingPhoto.category === 'Nos Marque' && (
                  <div>
                    <label className="block text-sm font-medium text-accent mb-2">
                      Brand Name *
                    </label>
                    <input
                      type="text"
                      value={editingPhoto.brandName || ''}
                      onChange={(e) => setEditingPhoto({...editingPhoto, brandName: e.target.value})}
                      placeholder="Enter brand name"
                      className="w-full p-3 bg-secondary border border-gray-600 rounded-lg text-accent focus:outline-none focus:border-primary"
                    />
                  </div>
                )}

                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editingPhoto.isActive}
                      onChange={(e) => setEditingPhoto({...editingPhoto, isActive: e.target.checked})}
                      className="rounded"
                    />
                    <span className="text-accent">{t('admin_photos_active')}</span>
                  </label>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    {t('admin_photos_cancel')}
                  </button>
                  <button
                    onClick={handleUpdate}
                    className="flex-1 px-4 py-2 bg-primary text-dark rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    {t('admin_photos_update')}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Offer Form Modal */}
      <AnimatePresence>
        {showOfferForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-dark p-6 rounded-lg w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto"
            >
              <OfferForm
                onSubmit={handleOfferSubmit}
                onCancel={() => {
                  setShowOfferForm(false);
                  setSelectedCategory('');
                  setEditingPhoto(null);
                }}
                isEditing={!!editingPhoto}
                initialData={editingPhoto}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PhotoManagement;

