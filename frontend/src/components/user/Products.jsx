import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import SectionDivider from "../common/SectionDivider";

// Brand images are now fetched from admin-uploaded photos (category: "Nos Marque")
// No static fallback images - only admin-uploaded brands are displayed

const Products = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [brandImages, setBrandImages] = useState([]); // Start with empty array, not fallback
  const [loading, setLoading] = useState(true);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  
  // For API calls, use the proxy (no base URL needed in dev)
  const getApiUrl = (endpoint) => {
    // In development, Vite proxy handles /api requests
    if (import.meta.env.MODE === 'development') {
      return `/api${endpoint}`; // Vite proxy will handle this
    }
    // In production, use full URL
    const baseUrl = API_BASE_URL.endsWith('/api') ? API_BASE_URL : `${API_BASE_URL}/api`;
    const fullUrl = `${baseUrl}${endpoint}`;
    return fullUrl;
  };

  // Get photo URL - always use full backend URL for images
  const getPhotoUrl = (photoUrl) => {
    // Remove /api from API_BASE_URL for static file serving
    const baseUrl = API_BASE_URL.replace('/api', '');
    return `${baseUrl}${photoUrl}`;
  };

  // Fetch "Nos Marque" photos from admin
  const fetchBrandPhotos = async () => {
    const url = getApiUrl(`/photos/category/${encodeURIComponent('Nos Marque')}`);
    console.log('🔍 Fetching brand photos from:', url);
    
    try {
      const response = await axios.get(url);
      console.log('✅ API Response:', response.data);
      
      if (response.data && response.data.success && response.data.data && Array.isArray(response.data.data)) {
        console.log('📦 Raw API data:', response.data.data);
        console.log('📦 Total photos received:', response.data.data.length);
        
        // Log each photo to see what we have
        response.data.data.forEach((photo, idx) => {
          console.log(`Photo ${idx + 1}:`, {
            id: photo._id,
            category: photo.category,
            brandName: photo.brandName,
            isActive: photo.isActive,
            url: photo.url,
            hasOfferData: !!photo.offerData
          });
        });
        
        // Filter photos - accept all "Nos Marque" category photos (very permissive for debugging)
        const validBrandPhotos = response.data.data.filter(photo => {
          // First check: is it the right category?
          if (photo.category !== 'Nos Marque') {
            console.log(`❌ Photo ${photo._id} filtered: wrong category (${photo.category})`);
            return false;
          }
          
          // Check if it has brandName
          if (!photo.brandName) {
            console.log(`⚠️ Photo ${photo._id} has no brandName but keeping it for now`);
            // Keep it anyway for debugging - we'll use filename as fallback
          }
          
          // Check if active
          if (photo.isActive === false) {
            console.log(`❌ Photo ${photo._id} filtered: not active`);
            return false;
          }
          
          console.log(`✅ Photo ${photo._id} passed filter:`, {
            category: photo.category,
            brandName: photo.brandName || 'MISSING',
            isActive: photo.isActive
          });
          
          return true; // Accept all "Nos Marque" photos that are not explicitly inactive
        });
        
        console.log('📸 Valid brand photos after filtering:', validBrandPhotos.length);
        
        if (validBrandPhotos.length > 0) {
          // Convert admin photos to brand format
          const adminBrands = validBrandPhotos.map((photo) => {
            const fullUrl = getPhotoUrl(photo.url);
            const displayName = photo.brandName || photo.filename || 'Brand';
            console.log('🖼️ Brand photo:', displayName, '-> URL:', fullUrl);
            
            return {
              src: fullUrl,
              alt: displayName,
              id: photo._id,
              brandName: photo.brandName || displayName
            };
          });
          
          console.log('✅ Setting brand images:', adminBrands.length);
          setBrandImages(adminBrands);
        } else {
          console.warn('⚠️ No valid brand photos found after filtering');
          console.warn('💡 Make sure photos have: category="Nos Marque", brandName exists, and isActive=true');
          setBrandImages([]); // Keep empty instead of fallback
        }
      } else {
        console.warn('⚠️ Invalid API response structure:', response.data);
        setBrandImages([]); // Keep empty instead of fallback
      }
    } catch (error) {
      console.error('❌ Error fetching brand photos:', error);
      console.error('Error details:', error.response?.data || error.message);
      setBrandImages([]); // Keep empty instead of fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrandPhotos();
    
    // Listen for photo updates
    let bc;
    try {
      bc = new BroadcastChannel('photos');
      bc.onmessage = (event) => {
        if (event.data?.type === 'photos-updated') {
          fetchBrandPhotos();
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
  }, []);

  // Duplicate the array multiple times for seamless infinite scroll
  // Only duplicate if we have brand images from admin
  const duplicates = brandImages.length > 0 ? 4 : 0; // Create 4 sets for smooth endless effect
  const images = brandImages.length > 0 
    ? Array(duplicates).fill(brandImages).flat().map((brand, idx) => ({
        ...brand,
        uniqueKey: brand.id ? `${brand.id}-${idx}` : `brand-${idx}`
      }))
    : []; // Empty array if no brands

  return (
    <div className="w-full px-4 py-12 overflow-hidden relative">
      <h1 className="mb-4 text-4xl font-bold text-center md:text-5xl">
        <span>{t("our") + " "}</span>
        <span className="text-primary">{t("brands")}</span>
      </h1>
      <SectionDivider />

      {/* Smooth Horizontal Brand Scroll */}
      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : brandImages.length === 0 ? (
        <div className="flex items-center justify-center h-32">
          <p className="text-gray-400 text-center">
            {t('no_brands_available') || 'No brands available. Admin can add brands in Photo Management.'}
          </p>
        </div>
      ) : (        <div className="relative w-full overflow-hidden">
          <motion.div
            className="flex gap-12"
            style={{ width: `${images.length * 220}px` }}
            initial={{ x: 0 }}
            animate={{ x: `-${brandImages.length * 220}px` }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            {images.map((brand, idx) => (
              <div 
                key={brand.uniqueKey} 
                onClick={() => {
                  if (brand.brandName) {
                    navigate(`/store?brand=${encodeURIComponent(brand.brandName)}`);
                  }
                }}
                className="flex items-center justify-center min-w-[200px] h-32 bg-white rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer"
              >
                <img
                  src={brand.src}
                  alt={brand.brandName || brand.alt}
                  title={brand.brandName || brand.alt}
                  className="object-contain h-24 w-auto mx-auto px-4 pointer-events-none"
                  draggable={false}
                  onError={(e) => {
                    console.error('Failed to load brand image:', brand.src);
                    // Show a placeholder for failed images
                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlPC90ZXh0Pjwvc3ZnPg==';
                  }}
                />
              </div>
            ))}
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Products;


