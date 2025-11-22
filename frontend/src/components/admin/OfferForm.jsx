import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Upload, X, DollarSign, Percent, Tag, Hash, FileText, Image } from 'lucide-react';
import axios from 'axios';
import { useAdminAuth } from '../../contexts/AdminAuthContext';

const OfferForm = ({ onSubmit, onCancel, isEditing = false, initialData = null }) => {
  const { t } = useTranslation();
  const { token } = useAdminAuth();
  const [formData, setFormData] = useState({
    name: initialData?.offerData?.name || '',
    oldPrice: initialData?.offerData?.oldPrice || '',
    newPrice: initialData?.offerData?.newPrice || '',
    brand: initialData?.offerData?.brand || '',
    reference: initialData?.offerData?.reference || '',
    description: initialData?.offerData?.description || '',
    bigDescription: initialData?.offerData?.bigDescription || '',
    stock: initialData?.offerData?.stock ?? '',
    displaySection: initialData?.offerData?.displaySection || 'Best Offers'
  });

  const [mainPhoto, setMainPhoto] = useState(null);
  const [additionalPhoto, setAdditionalPhoto] = useState(null);
  const [mainPhotoPreview, setMainPhotoPreview] = useState(initialData?.url ? initialData.url : null);
  const [additionalPhotoPreview, setAdditionalPhotoPreview] = useState(
    initialData?.offerData?.additionalPhotos?.[0]?.url || null
  );
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableBrands, setAvailableBrands] = useState([]);
  const [loadingBrands, setLoadingBrands] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handlePhotoChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      if (type === 'main') {
        setMainPhoto(file);
        const reader = new FileReader();
        reader.onload = (e) => setMainPhotoPreview(e.target.result);
        reader.readAsDataURL(file);
      } else {
        setAdditionalPhoto(file);
        const reader = new FileReader();
        reader.onload = (e) => setAdditionalPhotoPreview(e.target.result);
        reader.readAsDataURL(file);
      }
    }
  };

  const removePhoto = (type) => {
    if (type === 'main') {
      setMainPhoto(null);
      setMainPhotoPreview(null);
    } else {
      setAdditionalPhoto(null);
      setAdditionalPhotoPreview(null);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Required field validation
    if (!formData.name.trim()) newErrors.name = t('admin_offers_all_fields_required');
    if (!formData.oldPrice) newErrors.oldPrice = t('admin_offers_all_fields_required');
    if (!formData.newPrice) newErrors.newPrice = t('admin_offers_all_fields_required');
    if (!formData.brand.trim()) newErrors.brand = t('admin_offers_all_fields_required');
    if (!formData.reference.trim()) newErrors.reference = t('admin_offers_all_fields_required');
    if (!formData.description.trim()) newErrors.description = t('admin_offers_all_fields_required');
    if (formData.stock === '' || Number(formData.stock) < 0) newErrors.stock = t('admin_offers_stock_required');

    // Price validation
    if (formData.oldPrice && formData.newPrice) {
      if (parseFloat(formData.oldPrice) <= parseFloat(formData.newPrice)) {
        newErrors.price = t('admin_offers_price_validation');
      }
    }

    // Photo validation
    if (!isEditing) {
      if (!mainPhoto) newErrors.mainPhoto = t('admin_offers_photos_required');
      if (!additionalPhoto) newErrors.additionalPhoto = t('admin_offers_photos_required');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const offerData = {
        ...formData,
        oldPrice: parseFloat(formData.oldPrice),
        newPrice: parseFloat(formData.newPrice),
        stock: Number(formData.stock),
        displaySection: formData.displaySection
      };

      await onSubmit({
        offerData,
        mainPhoto,
        additionalPhoto,
        mainPhotoPreview,
        additionalPhotoPreview
      });
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateSavings = () => {
    if (formData.oldPrice && formData.newPrice) {
      const oldPrice = parseFloat(formData.oldPrice);
      const newPrice = parseFloat(formData.newPrice);
      if (oldPrice > newPrice) {
        const savings = oldPrice - newPrice;
        const percentage = ((savings / oldPrice) * 100).toFixed(1);
        return { savings, percentage };
      }
    }
    return { savings: 0, percentage: 0 };
  };

  const { savings, percentage } = calculateSavings();

  // Fetch brands from "Nos Marque" photos using admin endpoint
  useEffect(() => {
    const fetchBrands = async () => {
      setLoadingBrands(true);
      try {
        if (!token) {
          console.error('No admin token available');
          setAvailableBrands([]);
          return;
        }
        
        const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        // Fetch all photos with high limit to get all brands
        const adminApiUrl = `${API_BASE_URL}/admin/photos?category=${encodeURIComponent('Nos Marque')}&isActive=true&limit=1000`;
        
        const response = await axios.get(adminApiUrl, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (response.data.success && response.data.data) {
          // Extract unique brand names from photos created by admin
          const brands = [...new Set(
            response.data.data
              .filter(photo => photo.brandName && photo.isActive && photo.category === 'Nos Marque')
              .map(photo => photo.brandName)
              .filter(Boolean)
          )].sort();
          
          // If editing and current brand is not in list, add it
          const currentBrand = initialData?.offerData?.brand || formData.brand;
          if (isEditing && currentBrand && !brands.includes(currentBrand)) {
            brands.push(currentBrand);
            brands.sort();
          }
          
          setAvailableBrands(brands);
        }
      } catch (error) {
        console.error('Error fetching brands:', error);
        // Fallback to empty array if error
        setAvailableBrands([]);
      } finally {
        setLoadingBrands(false);
      }
    };

    fetchBrands();

    // Listen for photo updates
    let bc;
    try {
      bc = new BroadcastChannel('photos');
      bc.onmessage = (event) => {
        if (event.data?.type === 'photos-updated') {
          fetchBrands();
        }
      };
    } catch (error) {
      console.error('BroadcastChannel not supported:', error);
    }

    return () => {
      if (bc) {
        bc.close();
      }
    };
  }, [isEditing, initialData?.offerData?.brand, token]);

  return (
    <div className="space-y-6 p-6 rounded-2xl bg-gradient-to-br from-dark via-dark to-dark/95 backdrop-blur-xl shadow-2xl border border-primary/20 relative overflow-hidden font-source-sans">
      {/* Decorative glow effect */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-accent/5 rounded-full blur-2xl"></div>

      {/* Form Header */}
      <div className="flex items-center justify-between relative z-10 mb-6 pb-4 border-b border-primary/20">
        <h2 className="text-2xl font-bold tracking-wide" style={{ fontFamily: "'Orbitron', sans-serif" }}>
          <span className="bg-gradient-to-r from-accent via-white to-accent bg-clip-text text-transparent">
            {isEditing ? t('admin_photos_edit_photo') : t('admin_offers_form_title')}
          </span>
        </h2>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-primary transition-colors p-2 rounded-lg hover:bg-primary/10"
        >
          <X size={24} />
        </button>
      </div>

      {/* Savings Display */}
      {savings > 0 && (
        <div className="relative z-10 mb-6 p-4 rounded-xl bg-gradient-to-br from-green-500/20 to-green-600/10 backdrop-blur-sm border border-green-500/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign size={20} className="text-green-400" />
              <span className="text-green-400 font-semibold">
                {t('admin_offers_savings')}: TD. {savings.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Percent size={20} className="text-green-400" />
              <span className="text-green-400 font-semibold">
                {t('admin_offers_discount_percentage')}: {percentage}%
              </span>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Offer Name */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-green-400 mb-2">
              <Tag size={14} className="inline mr-2" />
              {t('admin_offers_name')}
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder={t('admin_offers_name_placeholder')}
              className={`w-full px-4 py-3 rounded-xl placeholder-accent/50 bg-secondary/50 backdrop-blur-sm text-accent border focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-300 ${
                errors.name ? 'border-red-500' : 'border-accent/20 focus:border-primary'
              }`}
            />
            {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
          </div>

          {/* Brand */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-green-400 mb-2">
              <Tag size={14} className="inline mr-2" />
              {t('admin_offers_brand')}
            </label>
            {loadingBrands ? (
              <div className="w-full px-4 py-3 rounded-xl bg-secondary/50 backdrop-blur-sm border border-accent/20 text-green-300/70 text-center">
                Loading brands...
              </div>
            ) : availableBrands.length > 0 ? (
              <select
                name="brand"
                value={formData.brand}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 rounded-xl bg-secondary/50 backdrop-blur-sm text-accent border focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-300 cursor-pointer ${
                  errors.brand ? 'border-red-500' : 'border-accent/20 focus:border-primary'
                }`}
              >
                <option value="">{t('admin_offers_brand_placeholder')}</option>
                {availableBrands.map((brand, index) => (
                  <option key={index} value={brand}>
                    {brand}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleInputChange}
                placeholder={t('admin_offers_brand_placeholder')}
                className={`w-full px-4 py-3 rounded-xl placeholder-accent/50 bg-secondary/50 backdrop-blur-sm text-accent border focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-300 ${
                  errors.brand ? 'border-red-500' : 'border-accent/20 focus:border-primary'
                }`}
              />
            )}
            {errors.brand && <p className="text-red-400 text-sm mt-1">{errors.brand}</p>}
            {availableBrands.length === 0 && !loadingBrands && (
              <p className="text-green-300/70 text-xs mt-1">
                No brands found. Add brands in Photo Management (Nos Marque category) first.
              </p>
            )}
          </div>
        </div>

        {/* Inventory & Display Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Stock */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-green-400 mb-2">
              {t('admin_offers_stock')}
            </label>
            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleInputChange}
              placeholder={t('admin_offers_stock_placeholder')}
              min="0"
              className={`w-full px-4 py-3 rounded-xl placeholder-accent/50 bg-secondary/50 backdrop-blur-sm text-accent border focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-300 ${
                errors.stock ? 'border-red-500' : 'border-accent/20 focus:border-primary'
              }`}
            />
            {errors.stock && <p className="text-red-400 text-sm mt-1">{errors.stock}</p>}
          </div>

          {/* Display Section */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-green-400 mb-2">
              {t('admin_offers_display_section')}
            </label>
            <select
              name="displaySection"
              value={formData.displaySection}
              onChange={handleInputChange}
              className="w-full px-4 py-3 rounded-xl bg-secondary/50 backdrop-blur-sm text-accent border border-accent/20 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 cursor-pointer"
            >
              <option value="Best Offers">{t('admin_offers_display_best_offers')}</option>
              <option value="Nos Pack">{t('admin_offers_display_nos_pack')}</option>
            </select>
          </div>
        </div>

        {/* Price Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Old Price */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-green-400 mb-2">
              <DollarSign size={14} className="inline mr-2" />
              {t('admin_offers_old_price')}
            </label>
            <input
              type="number"
              name="oldPrice"
              value={formData.oldPrice}
              onChange={handleInputChange}
              placeholder={t('admin_offers_old_price_placeholder')}
              min="0"
              step="0.01"
              className={`w-full px-4 py-3 rounded-xl placeholder-accent/50 bg-secondary/50 backdrop-blur-sm text-accent border focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-300 ${
                errors.oldPrice || errors.price ? 'border-red-500' : 'border-accent/20 focus:border-primary'
              }`}
            />
            {(errors.oldPrice || errors.price) && (
              <p className="text-red-400 text-sm mt-1">{errors.oldPrice || errors.price}</p>
            )}
          </div>

          {/* New Price */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-green-400 mb-2">
              <DollarSign size={14} className="inline mr-2" />
              {t('admin_offers_new_price')}
            </label>
            <input
              type="number"
              name="newPrice"
              value={formData.newPrice}
              onChange={handleInputChange}
              placeholder={t('admin_offers_new_price_placeholder')}
              min="0"
              step="0.01"
              className={`w-full px-4 py-3 rounded-xl placeholder-accent/50 bg-secondary/50 backdrop-blur-sm text-accent border focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-300 ${
                errors.newPrice ? 'border-red-500' : 'border-accent/20 focus:border-primary'
              }`}
            />
            {errors.newPrice && <p className="text-red-400 text-sm mt-1">{errors.newPrice}</p>}
          </div>
        </div>

        {/* Reference */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-green-400 mb-2">
            <Hash size={14} className="inline mr-2" />
            {t('admin_offers_reference')}
          </label>
          <input
            type="text"
            name="reference"
            value={formData.reference}
            onChange={handleInputChange}
            placeholder={t('admin_offers_reference_placeholder')}
            className={`w-full px-4 py-3 rounded-xl placeholder-accent/50 bg-secondary/50 backdrop-blur-sm text-accent border focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-300 ${
              errors.reference ? 'border-red-500' : 'border-accent/20 focus:border-primary'
            }`}
          />
          {errors.reference && <p className="text-red-400 text-sm mt-1">{errors.reference}</p>}
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-green-400 mb-2">
            <FileText size={14} className="inline mr-2" />
            {t('admin_offers_description')}
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder={t('admin_offers_description_placeholder')}
            rows={4}
            className={`w-full px-4 py-3 rounded-xl placeholder-accent/50 bg-secondary/50 backdrop-blur-sm text-accent border focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-300 resize-none ${
              errors.description ? 'border-red-500' : 'border-accent/20 focus:border-primary'
            }`}
          />
          {errors.description && <p className="text-red-400 text-sm mt-1">{errors.description}</p>}
        </div>

        {/* Big Description */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-green-400 mb-2">
            <FileText size={14} className="inline mr-2" />
            {t('admin_offers_big_description')}
          </label>
          <textarea
            name="bigDescription"
            value={formData.bigDescription}
            onChange={handleInputChange}
            placeholder={t('admin_offers_big_description_placeholder')}
            rows={6}
            className="w-full px-4 py-3 rounded-xl placeholder-accent/50 bg-secondary/50 backdrop-blur-sm text-accent border border-accent/20 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 resize-none"
          />
          <p className="text-green-300/70 text-xs mt-1">{t('admin_offers_big_description_note')}</p>
        </div>

        {/* Photo Upload Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Main Photo */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-green-400 mb-2">
              <Image size={14} className="inline mr-2" />
              {t('admin_offers_main_photo')}
            </label>
            <div className="border-2 border-dashed border-accent/30 rounded-xl p-6 text-center hover:border-primary transition-all duration-300 bg-secondary/20 backdrop-blur-sm">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handlePhotoChange(e, 'main')}
                className="hidden"
                id="main-photo-upload"
              />
              <label htmlFor="main-photo-upload" className="cursor-pointer">
                {mainPhotoPreview ? (
                  <div className="relative">
                    <img
                      src={mainPhotoPreview}
                      alt="Main photo preview"
                      className="w-full h-32 object-cover rounded-lg mb-2"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto('main')}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div>
                    <Upload size={32} className="mx-auto text-green-400 mb-2" />
                    <p className="text-green-300/70">{t('admin_photos_click_to_select')}</p>
                  </div>
                )}
              </label>
            </div>
            {errors.mainPhoto && <p className="text-red-400 text-sm mt-1">{errors.mainPhoto}</p>}
          </div>

          {/* Additional Photo */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-green-400 mb-2">
              <Image size={14} className="inline mr-2" />
              {t('admin_offers_additional_photo')}
            </label>
            <div className="border-2 border-dashed border-accent/30 rounded-xl p-6 text-center hover:border-primary transition-all duration-300 bg-secondary/20 backdrop-blur-sm">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handlePhotoChange(e, 'additional')}
                className="hidden"
                id="additional-photo-upload"
              />
              <label htmlFor="additional-photo-upload" className="cursor-pointer">
                {additionalPhotoPreview ? (
                  <div className="relative">
                    <img
                      src={additionalPhotoPreview}
                      alt="Additional photo preview"
                      className="w-full h-32 object-cover rounded-lg mb-2"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto('additional')}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div>
                    <Upload size={32} className="mx-auto text-green-400 mb-2" />
                    <p className="text-green-300/70">{t('admin_photos_click_to_select')}</p>
                  </div>
                )}
              </label>
            </div>
            {errors.additionalPhoto && <p className="text-red-400 text-sm mt-1">{errors.additionalPhoto}</p>}
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-3 border-2 border-accent/30 text-accent/70 rounded-xl hover:text-accent hover:border-primary/50 hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-300"
          >
            {t('admin_photos_cancel')}
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-primary to-green-600 text-dark font-bold hover:from-green-600 hover:to-primary focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-300 shadow-lg hover:shadow-primary/30 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            style={{ fontFamily: "'Orbitron', sans-serif" }}
          >
            {isSubmitting ? t('admin_photos_uploading') : t('admin_photos_upload')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default OfferForm;

