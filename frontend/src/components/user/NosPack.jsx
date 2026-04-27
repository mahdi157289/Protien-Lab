import { useTranslation } from "react-i18next";
import { motion, AnimatePresence, useMotionValue, useAnimationFrame } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Percent, Tag, Calendar, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import ProductPopup from "../store/ProductPopup";
import { useSmokey } from '../../contexts/SmokeyContext';
import SectionDivider from "../common/SectionDivider";
import { SkeletonProductCard } from "../common/Skeletons";
import { resolveImageUrl } from '../../lib/image';
import { getCachedData } from "../../utils/apiCache";

const NosPack = () => {
  const { t } = useTranslation();
  const { smokeyOn } = useSmokey();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [focusOrder, setFocusOrder] = useState(false);
  const [scrollIndex, setScrollIndex] = useState(0);
  const [autoScrollPaused, setAutoScrollPaused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef(null);
  const currentXRef = useRef(0);
  const x = useMotionValue(0);

  useEffect(() => {
    const unsub = x.on('change', (v) => {
      currentXRef.current = v;
    });
    return () => {
      if (typeof unsub === 'function') unsub();
    };
  }, [x]);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const getApiUrl = (endpoint) => {
    if (import.meta.env.MODE === 'development') return `/api${endpoint}`;
    const baseUrl = API_BASE_URL.endsWith('/api') ? API_BASE_URL : `${API_BASE_URL}/api`;
    return `${baseUrl}${endpoint}`;
  };
  const getPhotoUrl = (photoUrl) => {
    if (!photoUrl) return '';
    if (photoUrl.startsWith('http')) return photoUrl;
    const baseUrl = API_BASE_URL.replace('/api', '');
    return `${baseUrl}${photoUrl}`;
  };

  const fetchNosPack = async () => {
    try {
      const url = getApiUrl(`/photos/category/${encodeURIComponent('Nos Pack')}`);
      const response = await getCachedData(url, () => axios.get(url), 30000);

      let offersFromPhotos = [];

      if (response.data.success && response.data.data) {
        offersFromPhotos = response.data.data.map((offer) => ({
          id: offer._id,
          name: offer.offerData?.name || '',
          brand: offer.offerData?.brand || '',
          reference: offer.offerData?.reference || '',
          description: offer.offerData?.description || '',
          bigDescription: offer.offerData?.bigDescription || '',
          productId: offer.offerData?.productId || null,
          displaySection: offer.offerData?.displaySection || 'Nos Pack',
          oldPrice: offer.offerData?.oldPrice || 0,
          newPrice: offer.offerData?.newPrice || 0,
          mainImage: getPhotoUrl(offer.url),
          additionalImages: (offer.offerData?.additionalPhotos || []).map(p => getPhotoUrl(p.url)),
          uploadDate: offer.uploadDate,
        }));
      }

      let offersFromProducts = [];

      try {
        const productsUrl = getApiUrl('/users/products?limit=500');
        const productsRes = await getCachedData(productsUrl, () => axios.get(productsUrl), 30000);

        let list = [];
        if (Array.isArray(productsRes.data?.products)) {
          list = productsRes.data.products;
        } else if (Array.isArray(productsRes.data?.data)) {
          list = productsRes.data.data;
        } else if (Array.isArray(productsRes.data)) {
          list = productsRes.data;
        } else {
          list = productsRes.data?.products || [];
        }

        const packProducts = list.filter((p) => {
          const name = typeof p.name === 'string' ? p.name.trim() : '';
          return name.toLowerCase().startsWith('pack');
        });

        offersFromProducts = packProducts.map((p) => {
          const imagesArray = Array.isArray(p.images) ? p.images : (p.image ? [p.image] : []);
          const mainImgRaw = imagesArray[0] || '';
          const additionalImgsRaw = imagesArray.slice(1);

          const oldPrice = typeof p.oldPrice === 'number' && p.oldPrice > 0
            ? p.oldPrice
            : (typeof p.price === 'number' && p.price > 0 ? p.price : 1);

          const newPrice = typeof p.price === 'number' && p.price > 0
            ? p.price
            : oldPrice;

          return {
            id: p._id || p.id,
            name: p.name || '',
            brand: p.brand || '',
            reference: p.reference || '',
            description: p.descriptionShort || '',
            bigDescription: p.descriptionFull || p.descriptionShort || '',
            productId: p._id || p.id || null,
            displaySection: 'Nos Pack',
            oldPrice,
            newPrice,
            mainImage: resolveImageUrl(String(mainImgRaw), { removeBackground: true }),
            additionalImages: additionalImgsRaw.map((src) => resolveImageUrl(String(src))),
            uploadDate: p.createdAt || new Date().toISOString(),
          };
        });
      } catch (err) {
        console.error('Failed to fetch products for Nos Pack section', err);
      }

      const combined = [...offersFromPhotos, ...offersFromProducts];

      if (combined.length > 0) {
        combined.sort((a, b) => {
          const discountA = a.oldPrice > 0 ? (a.oldPrice - a.newPrice) / a.oldPrice : 0;
          const discountB = b.oldPrice > 0 ? (b.oldPrice - b.newPrice) / b.oldPrice : 0;
          return discountA - discountB;
        });
        setOffers(combined);
      } else {
        setOffers([]);
      }
    } catch (e) {
      console.error('Failed to fetch nos pack', e);
      setOffers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNosPack();
    let bc;
    try {
      bc = new BroadcastChannel('offers');
      bc.onmessage = (ev) => {
        if (ev?.data?.type === 'offers-updated') {
          fetchNosPack();
        }
      };
    } catch (e) { console.error(e); }
    return () => { try { bc && bc.close(); } catch (e) { console.error(e); } };
  }, []);

  const CARD_WIDTH = 320;
  const GAP = 24;
  const SCROLL_DISTANCE = CARD_WIDTH + GAP;
  const maxScrollIndex = offers.length > 0 ? Math.max(0, offers.length - 1) : 0;
  const duplicatedOffers = offers.length > 0
    ? [...offers, ...offers].map((offer, idx) => ({
      ...offer,
      __k: `${offer.id || 'offer'}-${idx}`
    }))
    : [];
  const getNearestIndexFromX = () => {
    const idx = Math.round(-currentXRef.current / SCROLL_DISTANCE);
    return Math.min(Math.max(idx, 0), maxScrollIndex);
  };
  useAnimationFrame((t, delta) => {
    if (!autoScrollPaused && offers.length > 0) {
      const dist = offers.length * SCROLL_DISTANCE;
      const speed = dist / 100;
      const next = x.get() - speed * (delta / 1000);
      if (next <= -dist) {
        x.set(next + dist);
      } else {
        x.set(next);
      }
    }
  });
  const scrollX = -scrollIndex * SCROLL_DISTANCE;
  useEffect(() => {
    if (autoScrollPaused && !isHovered) {
      x.set(scrollX);
    }
  }, [scrollX, autoScrollPaused, isHovered, x]);

  const discountPct = (o) => o.oldPrice > o.newPrice ? Math.round(((o.oldPrice - o.newPrice) / o.oldPrice) * 100) : 0;
  const formatDate = (d) => new Date(d).toLocaleDateString();

  const handleOrderNow = async (offer) => {
    try {
      if (!offer.productId) return;
      const res = await axios.get(getApiUrl(`/users/products/${offer.productId}`));
      setSelectedProduct(res.data);
      setShowOrderModal(true);
    } catch (e) {
      console.error('order load failed', e);
    }
  };



  const mapOfferToProduct = (o) => ({
    _id: `offer-${o.id}`,
    name: o.name,
    brand: o.brand,
    price: o.newPrice,
    oldPrice: o.oldPrice,
    images: [o.mainImage, ...(o.additionalImages || [])],
    descriptionShort: o.description || '',
    descriptionFull: o.bigDescription || o.description || '',
    categories: [],
    types: [],
    isBestSeller: true,
    benefits: [],
    flavors: [],
    weights: [],
    stock: 999,
  });

  const renderSplitTitle = () => {
    const title = t('nos_pack_title') || '';
    const parts = title.split(' ');
    if (parts.length >= 2) {
      const first = parts.slice(0, parts.length - 1).join(' ');
      const last = parts[parts.length - 1];
      return (
        <>
          <span className={smokeyOn ? 'text-white' : 'text-black'}>{first} </span>
          <span className="text-primary">{last}</span>
        </>
      );
    }
    return <span className="text-primary">{title}</span>;
  };

  if (loading) {
    return (
      <div className="w-full px-4 py-12">
        <h1 className="mb-4 text-4xl font-bold text-center md:text-5xl">{renderSplitTitle()}</h1>
        <SectionDivider />
        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3 animate-pulse">
          {[...Array(6)].map((_, idx) => (
            <SkeletonProductCard key={`nospack-skel-${idx}`} />
          ))}
        </div>
      </div>
    );
  }


  const handleScrollLeft = () => {
    const base = isHovered ? getNearestIndexFromX() : scrollIndex;
    const next = Math.max(0, base - 1);
    setAutoScrollPaused(true);
    setScrollIndex(next);
    x.set(-next * SCROLL_DISTANCE);
    clearTimeout(window.autoScrollResumeTimeout);
    if (!isHovered) {
      window.autoScrollResumeTimeout = setTimeout(() => setAutoScrollPaused(false), 5000);
    }
  };

  const handleScrollRight = () => {
    const base = isHovered ? getNearestIndexFromX() : scrollIndex;
    const next = Math.min(maxScrollIndex, base + 1);
    setAutoScrollPaused(true);
    setScrollIndex(next);
    x.set(-next * SCROLL_DISTANCE);
    clearTimeout(window.autoScrollResumeTimeout);
    if (!isHovered) {
      window.autoScrollResumeTimeout = setTimeout(() => setAutoScrollPaused(false), 5000);
    }
  };

  return (
    <div className="w-full px-4 py-12">
      <h1 className="mb-4 text-4xl font-bold text-center md:text-5xl">{renderSplitTitle()}</h1>
      <SectionDivider />

      <div
        className="relative w-full overflow-hidden"
        ref={containerRef}
        onMouseEnter={() => {
          setIsHovered(true);
          setAutoScrollPaused(true);
        }}
        onMouseLeave={() => {
          setIsHovered(false);
          setAutoScrollPaused(false);
        }}
      >
        {/* Left Arrow - show on hover */}
        {isHovered && (
          <button
            onClick={handleScrollLeft}
            disabled={!autoScrollPaused && scrollIndex === 0}
            className={`absolute left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-dark/80 hover:bg-dark text-accent flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 ${!autoScrollPaused && scrollIndex === 0 ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            aria-label="Scroll left"
          >
            <ChevronLeft size={24} />
          </button>
        )}

        {/* Right Arrow - show on hover */}
        {isHovered && (
          <button
            onClick={handleScrollRight}
            disabled={!autoScrollPaused && scrollIndex >= maxScrollIndex}
            className={`absolute right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-dark/80 hover:bg-dark text-accent flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 ${!autoScrollPaused && scrollIndex >= maxScrollIndex ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            aria-label="Scroll right"
          >
            <ChevronRight size={24} />
          </button>
        )}

        <motion.div
          className="flex gap-6"
          style={{ width: `${duplicatedOffers.length * SCROLL_DISTANCE}px`, x }}
          drag="x"
          dragElastic={0.05}
          dragMomentum={false}
          onDragStart={() => {
            setAutoScrollPaused(true);
            setIsHovered(true);
          }}
          onDragEnd={(e, info) => {
            const threshold = SCROLL_DISTANCE / 4;
            if (info.offset.x > threshold) {
              const base = isHovered ? getNearestIndexFromX() : scrollIndex;
              const next = Math.max(0, base - 1);
              setScrollIndex(next);
              x.set(-next * SCROLL_DISTANCE);
            } else if (info.offset.x < -threshold) {
              const base = isHovered ? getNearestIndexFromX() : scrollIndex;
              const next = Math.min(maxScrollIndex, base + 1);
              setScrollIndex(next);
              x.set(-next * SCROLL_DISTANCE);
            }
            clearTimeout(window.autoScrollResumeTimeout);
            window.autoScrollResumeTimeout = setTimeout(() => setAutoScrollPaused(false), 5000);
          }}
        >
          {duplicatedOffers.map((o, index) => (
            <motion.div key={o.__k || `offer-${index}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: (index % offers.length) * 0.1 }} className="rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300 bg-white/10 backdrop-blur-md border border-white/10" style={{ minWidth: `${CARD_WIDTH}px` }}>
              <div className="relative h-48 overflow-hidden">
                <img src={o.mainImage} alt={o.name} className="w-full h-full object-cover" />
                {discountPct(o) > 0 && (
                  <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                    <Percent size={14} />{discountPct(o)}%
                  </div>
                )}
                <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                  <Eye size={32} className="text-white opacity-0 hover:opacity-100 transition-opacity duration-300" />
                </div>
              </div>
              <div className="p-6 font-source-sans">
                <div className="flex items-center gap-2 mb-2"><Tag size={16} className="text-gray-500" /><span className="text-sm text-gray-500 font-medium">{o.brand}</span></div>
                <h3 className={`text-xl font-bold mb-2 line-clamp-2 font-orbitron ${smokeyOn ? 'text-white' : 'text-gray-800'}`}>{o.name}</h3>
                {o.reference && <p className="text-sm text-gray-500 mb-3">Ref: {o.reference}</p>}
                <div className="mb-4">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-2xl font-normal text-green-600 font-source-sans">{o.newPrice.toFixed(2)} TD</span>
                    <span className="text-lg text-gray-400 line-through font-source-sans">{o.oldPrice.toFixed(2)} TD</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-green-600 font-semibold">{t('you_save')} {(o.oldPrice - o.newPrice).toFixed(2)} TD</span>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{o.description}</p>
                <div className="flex items-center gap-2 text-xs text-gray-400"><Calendar size={12} /><span>{formatDate(o.uploadDate)}</span></div>
                <div className="mt-4 flex gap-2">
                  <button onClick={() => { const p = mapOfferToProduct(o); setSelectedProduct(p); setFocusOrder(false); setShowOrderModal(true); }} className="px-3 py-2 text-sm rounded text-white bg-green-600 hover:bg-green-700">{t('product_view_details')}</button>
                  <button onClick={() => { setFocusOrder(true); handleOrderNow(o); }} disabled={!o.productId && !o.mainImage} className={`px-3 py-2 text-sm rounded text-white ${(o.productId || o.mainImage) ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400 cursor-not-allowed'}`}>Order Now</button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      <AnimatePresence>
        {showOrderModal && selectedProduct && (
          <ProductPopup product={selectedProduct} onClose={() => { setShowOrderModal(false); setSelectedProduct(null); }} focusOrder={focusOrder} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default NosPack;
