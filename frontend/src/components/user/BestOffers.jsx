import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import axios from "axios";
import ProductPopup from "../store/ProductPopup";
import { useSmokey } from '../../contexts/SmokeyContext';
import SectionDivider from "../common/SectionDivider";
import { Percent, Tag, Calendar, Eye } from "lucide-react";

const BestOffers = () => {
  const { t } = useTranslation();
  const { smokeyOn } = useSmokey();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [focusOrder, setFocusOrder] = useState(false);

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

  const mapOfferToProduct = (offer) => ({
    _id: `offer-${offer.id}`,
    name: offer.name,
    brand: offer.brand,
    price: offer.newPrice,
    oldPrice: offer.oldPrice,
    images: [offer.mainImage, ...(offer.additionalImages || [])],
    descriptionShort: offer.description || '',
    descriptionFull: offer.bigDescription || offer.description || '',
    categories: [],
    types: [],
    isBestSeller: true,
    fastDelivery: false,
    benefits: [],
    flavors: [],
    weights: [],
    stock: 999,
  });

  // Fetch Best Offers from admin
  const fetchBestOffers = async () => {
    const url = getApiUrl('/photos/category/Best Offers');
    
    try {
      const response = await axios.get(url);
      
      if (response.data.success && response.data.data && response.data.data.length > 0) {
        // Filter out brand photos first (they have brandName but no offerData with prices)
        const validOffers = response.data.data.filter(offer => {
          // Exclude photos with brandName (these are brand photos, not offers)
          if (offer.brandName) return false;
          // Must have offerData with valid prices
          if (!offer.offerData || !offer.offerData.oldPrice || !offer.offerData.newPrice) return false;
          // Must have displaySection as Best Offers
          if (offer.offerData.displaySection !== 'Best Offers') return false;
          return true;
        });

        // Process offers data
        const processedOffers = validOffers.map((offer) => {
          const mainImageUrl = getPhotoUrl(offer.url);
          const additionalImages = offer.offerData?.additionalPhotos?.map(photo => 
            getPhotoUrl(photo.url)
          ) || [];

          return {
            id: offer._id,
            name: offer.offerData?.name || 'Special Offer',
            brand: offer.offerData?.brand || 'Brand',
            reference: offer.offerData?.reference || '',
            description: offer.offerData?.description || '',
            bigDescription: offer.offerData?.bigDescription || '',
            productId: offer.offerData?.productId || null,
            displaySection: offer.offerData?.displaySection || 'Best Offers',
            oldPrice: offer.offerData?.oldPrice || 0,
            newPrice: offer.offerData?.newPrice || 0,
            mainImage: mainImageUrl,
            additionalImages: additionalImages,
            uploadDate: offer.uploadDate,
            isActive: offer.isActive
          };
        });

        // Sort by discount percentage (highest first)
        processedOffers.sort((a, b) => {
          const discountA = ((a.oldPrice - a.newPrice) / a.oldPrice) * 100;
          const discountB = ((b.oldPrice - b.newPrice) / b.oldPrice) * 100;
          return discountB - discountA;
        });

        // Filter to ensure we only show Best Offers, not brand photos
        setOffers(processedOffers.filter(o => 
          o.displaySection === 'Best Offers' && 
          o.oldPrice > 0 && 
          o.newPrice > 0
        ));
      } else {
        setOffers([]);
      }
    } catch (error) {
      console.error('Error fetching best offers:', error);
      setOffers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBestOffers();
    let bc;
    try {
      bc = new BroadcastChannel('offers');
      bc.onmessage = (ev) => {
        if (ev?.data?.type === 'offers-updated') {
          fetchBestOffers();
        }
      };
    } catch {}
    return () => { try { bc && bc.close(); } catch {} };
  }, []);

  // Calculate discount percentage
  const calculateDiscount = (oldPrice, newPrice) => {
    if (oldPrice <= newPrice) return 0;
    return Math.round(((oldPrice - newPrice) / oldPrice) * 100);
  };

  // Calculate savings amount
  const calculateSavings = (oldPrice, newPrice) => {
    return oldPrice - newPrice;
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Handle offer click (View Details)
  const handleOfferClick = (offer) => {
    const productLike = mapOfferToProduct(offer);
    setSelectedProduct(productLike);
    setFocusOrder(false);
    setShowOrderModal(true);
  };

  // Open order modal by fetching product (Order Now)
  const handleOrderNow = async (offer) => {
    try {
      if (offer.productId) {
        const url = getApiUrl(`/users/products/${offer.productId}`);
        const response = await axios.get(url);
        setSelectedProduct(response.data);
      } else {
        // fallback to mapped data if no productId
        setSelectedProduct(mapOfferToProduct(offer));
      }
      setFocusOrder(true);
      setShowOrderModal(true);
    } catch (e) {
      console.error('Failed to load product for ordering', e);
    }
  };

  if (loading) {
    return (
      <div className="w-full px-4 py-12">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (offers.length === 0) {
    return (
      <div className="w-full px-4 py-12">
        <h1 className="mb-4 text-4xl font-bold text-center md:text-5xl">
          <span>{t("best") + " "}</span>
          <span className="text-primary">{t("offers")}</span>
        </h1>
        <SectionDivider />
        <div className="text-center py-12">
          <Tag size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-400 text-lg">{t("no_offers_available")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 py-12">
      <h1 className="mb-4 text-4xl font-bold text-center md:text-5xl">
        <span>{t("best") + " "}</span>
        <span className="text-primary">{t("offers")}</span>
      </h1>
      <SectionDivider />

      {/* Smooth Horizontal Scroll like Brands - Endless */}
      <div className="relative w-full overflow-hidden">
        {(() => {
          const CARD_WIDTH = 320; // px
          const GAP = 24; // Tailwind gap-6
          // Duplicate offers multiple times for seamless infinite scroll
          const duplicates = 4; // Create 4 sets for smooth endless effect
          const items = Array(duplicates).fill(offers).flat().map((o, i) => ({ ...o, __k: `${o.id}-${i}` }));
          const distance = offers.length * (CARD_WIDTH + GAP);
          return (
            <motion.div
              className="flex gap-6"
              style={{ width: `${items.length * (CARD_WIDTH + GAP)}px` }}
              initial={{ x: 0 }}
              animate={{ x: `-${distance}px` }}
              transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
            >
              {items.map((offer, index) => {
          const discount = calculateDiscount(offer.oldPrice, offer.newPrice);
          const savings = calculateSavings(offer.oldPrice, offer.newPrice);

          return (
            <motion.div
              key={offer.__k}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300 bg-white/10 backdrop-blur-md border border-white/10"
              style={{ minWidth: `${CARD_WIDTH}px` }}
            >
              {/* Image Container */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={offer.mainImage}
                  alt={offer.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk9mZmVyPC90ZXh0Pjwvc3ZnPg==';
                  }}
                />
                
                {/* Discount Badge */}
                {discount > 0 && (
                  <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                    <Percent size={14} />
                    {discount}%
                  </div>
                )}

                {/* View Button */}
                <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                  <Eye size={32} className="text-white opacity-0 hover:opacity-100 transition-opacity duration-300" />
                </div>
              </div>

              {/* Content */}
              <div className="p-6 font-source-sans">
                {/* Brand */}
                <div className="flex items-center gap-2 mb-2">
                  <Tag size={16} className="text-gray-500" />
                  <span className="text-sm text-gray-500 font-medium">{offer.brand}</span>
                </div>

                {/* Offer Name */}
                <h3 className={`text-xl font-bold mb-2 line-clamp-2 font-orbitron ${smokeyOn ? 'text-white' : 'text-gray-800'}`}>
                  {offer.name}
                </h3>

                {/* Reference */}
                {offer.reference && (
                  <p className="text-sm text-gray-500 mb-3">Ref: {offer.reference}</p>
                )}

                {/* Pricing */}
                <div className="mb-4">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-2xl font-bold text-green-600 font-orbitron">
                      {offer.newPrice.toFixed(2)} TD
                    </span>
                    <span className="text-lg text-gray-400 line-through">
                      {offer.oldPrice.toFixed(2)} TD
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-green-600 font-semibold">
                      {t("you_save")} {savings.toFixed(2)} TD
                    </span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {offer.description}
                </p>

                {/* Date */}
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Calendar size={12} />
                  <span>{formatDate(offer.uploadDate)}</span>
                </div>

                {/* Actions */}
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => handleOfferClick(offer)}
                    className="px-3 py-2 text-sm rounded text-white bg-green-600 hover:bg-green-700"
                  >
                    {t('product_view_details')}
                  </button>
                  <button
                    onClick={() => handleOrderNow(offer)}
                    disabled={!offer.productId && !offer.mainImage}
                    className={`px-3 py-2 text-sm rounded text-white ${ (offer.productId || offer.mainImage) ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400 cursor-not-allowed'}`}
                  >
                    Order Now
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
            </motion.div>
          );
        })()}
      </div>

      {/* Order Modal */}
      <AnimatePresence>
        {showOrderModal && selectedProduct && (
          <ProductPopup
            product={selectedProduct}
            onClose={() => { setShowOrderModal(false); setSelectedProduct(null); }}
            focusOrder={focusOrder}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default BestOffers;

