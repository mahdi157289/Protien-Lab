import { useState, useEffect, useRef } from "react";
import axios from "axios";

const MediaSection = () => {
  const [mediaSlots, setMediaSlots] = useState({ 1: [], 2: [] });
  const [loading, setLoading] = useState(true);
  const [activeSlides, setActiveSlides] = useState({ 1: 0, 2: 0 });
  const slideIntervalRef = useRef(null);

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

  // Fetch Media category photos from admin
  const fetchMediaPhotos = async () => {
    const url = getApiUrl(`/photos/category/${encodeURIComponent('Media')}`);
    
    try {
      const response = await axios.get(url);
      
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        const slots = { 1: [], 2: [] };

        response.data.data
          .filter(photo => photo.isActive !== false && [1, 2].includes(Number(photo.mediaSlot)))
          .forEach(photo => {
            const slotNumber = Number(photo.mediaSlot);
            const slideCandidates = Array.isArray(photo.slides) ? photo.slides : [];
            const normalizedSlides = slideCandidates
              .filter(slide => slide && slide.url)
              .map((slide, index) => ({
                id: `${photo._id}-${index}`,
                url: getPhotoUrl(slide.url),
                filename: slide.filename || photo.filename || `Media ${slotNumber}-${index + 1}`
              }));

            if (normalizedSlides.length === 0 && photo.url) {
              normalizedSlides.push({
                id: `${photo._id}-fallback`,
                url: getPhotoUrl(photo.url),
                filename: photo.filename || `Media ${slotNumber}`
              });
            }

            if (normalizedSlides.length > 0) {
              slots[slotNumber] = normalizedSlides.slice(0, 2);
            }
          });

        setMediaSlots(slots);
        setActiveSlides({
          1: slots[1].length ? 0 : 0,
          2: slots[2].length ? 0 : 0
        });
      } else {
        setMediaSlots({ 1: [], 2: [] });
        setActiveSlides({ 1: 0, 2: 0 });
      }
    } catch (error) {
      console.error('Error fetching media photos:', error);
      setMediaSlots({ 1: [], 2: [] });
      setActiveSlides({ 1: 0, 2: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMediaPhotos();
    
    // Listen for photo updates
    let bc;
    try {
      bc = new BroadcastChannel('photos');
      bc.onmessage = (event) => {
        if (event.data?.type === 'photos-updated') {
          fetchMediaPhotos();
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

  useEffect(() => {
    if (slideIntervalRef.current) {
      clearInterval(slideIntervalRef.current);
      slideIntervalRef.current = null;
    }

    const slotOneHasSlides = mediaSlots[1].length > 1;
    const slotTwoHasSlides = mediaSlots[2].length > 1;

    if (!slotOneHasSlides && !slotTwoHasSlides) {
      return;
    }

    slideIntervalRef.current = setInterval(() => {
      setActiveSlides((prev) => ({
        1: mediaSlots[1].length > 1 ? (prev[1] + 1) % mediaSlots[1].length : prev[1],
        2: mediaSlots[2].length > 1 ? (prev[2] + 1) % mediaSlots[2].length : prev[2],
      }));
    }, 4000);

    return () => {
      if (slideIntervalRef.current) {
        clearInterval(slideIntervalRef.current);
        slideIntervalRef.current = null;
      }
    };
  }, [mediaSlots]);

  if (loading) {
    return (
      <div className="w-full px-4 py-12">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  const hasSlides = mediaSlots[1].length > 0 || mediaSlots[2].length > 0;
  if (!hasSlides) {
    return null; // Don't display section if no photos
  }

  const renderSlot = (slotNumber) => {
    const slides = mediaSlots[slotNumber] || [];
    if (!slides.length) return null;

    return (
      <div
        key={`media-slot-${slotNumber}`}
        className="relative w-full h-[480px] overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300 cursor-pointer group"
      >
        {slides.map((slide, index) => (
          <img
            key={slide.id || `${slotNumber}-${index}`}
            src={slide.url}
            alt={slide.filename || `Media ${slotNumber}-${index + 1}`}
            className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-in-out ${
              index === activeSlides[slotNumber] ? 'opacity-100 scale-100' : 'opacity-0 scale-110'
            } group-hover:scale-105`}
            onError={(e) => {
              console.error('Failed to load media image:', slide.url);
              e.currentTarget.style.opacity = 0;
            }}
          />
        ))}

        {slides.length > 1 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
            {slides.map((_, idx) => (
              <span
                key={`indicator-${slotNumber}-${idx}`}
                className={`h-2 w-6 rounded-full transition-colors ${
                  idx === activeSlides[slotNumber] ? 'bg-white' : 'bg-white/40'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full py-12">
      <div className="w-full space-y-6">
        {[1, 2].map((slot) => renderSlot(slot))}
      </div>
    </div>
  );
};

export default MediaSection;

