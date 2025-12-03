import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import axios from "axios";
import { Percent, Tag, Calendar, Eye } from "lucide-react";
import ProductPopup from "../store/ProductPopup";
import { useSmokey } from '../../contexts/SmokeyContext';
import SectionDivider from "../common/SectionDivider";

const NosPack = () => {
  const { t } = useTranslation();
  const { smokeyOn } = useSmokey();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [focusOrder, setFocusOrder] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const getApiUrl = (endpoint) => {
    if (import.meta.env.MODE === 'development') return `/api${endpoint}`;
    const baseUrl = API_BASE_URL.endsWith('/api') ? API_BASE_URL : `${API_BASE_URL}/api`;
    return `${baseUrl}${endpoint}`;
  };
  const getPhotoUrl = (photoUrl) => {
    const baseUrl = API_BASE_URL.replace('/api', '');
    return `${baseUrl}${photoUrl}`;
  };

  const fetchNosPack = async () => {
    try {
      const url = getApiUrl(`/photos/category/${encodeURIComponent('Nos Pack')}`);
      const response = await axios.get(url);
      if (response.data.success && response.data.data) {
        const processed = response.data.data.map((offer) => ({
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

        processed.sort((a, b) => (((a.oldPrice - a.newPrice)/a.oldPrice) - ((b.oldPrice - b.newPrice)/b.oldPrice)));
        setOffers(processed);
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
    } catch {}
    return () => { try { bc && bc.close(); } catch {} };
  }, []);

  const discountPct = (o) => o.oldPrice > o.newPrice ? Math.round(((o.oldPrice - o.newPrice)/o.oldPrice)*100) : 0;
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

  const handleView = (offer) => {
    setSelectedOffer(offer);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedOffer(null);
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

  if (loading) {
    return (
      <div className="w-full px-4 py-12">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

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

  return (
    <div className="w-full px-4 py-12">
      <h1 className="mb-4 text-4xl font-bold text-center md:text-5xl">{renderSplitTitle()}</h1>
      <SectionDivider />

      <div className="relative w-full overflow-hidden">
        {(() => {
          const CARD_WIDTH = 320;
          const GAP = 24;
          // Duplicate offers multiple times for seamless infinite scroll
          const duplicates = 4; // Create 4 sets for smooth endless effect
          const items = Array(duplicates).fill(offers).flat().map((o, i) => ({...o, __k: `${o.id}-${i}`}));
          const distance = offers.length * (CARD_WIDTH + GAP);
          return (
            <motion.div 
              className="flex gap-6" 
              style={{ width: `${items.length * (CARD_WIDTH + GAP)}px` }} 
              initial={{ x: 0 }}
              animate={{ x: `-${distance}px` }}
              transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
            >
        {items.map((o, index) => (
          <motion.div key={o.__k} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:index*0.1}} className="rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300 bg-white/10 backdrop-blur-md border border-white/10" style={{ minWidth: `${CARD_WIDTH}px` }}>
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
                  <span className="text-2xl font-normal text-green-600 font-orbitron">{o.newPrice.toFixed(2)} TD</span>
                  <span className="text-lg text-gray-400 line-through">{o.oldPrice.toFixed(2)} TD</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-green-600 font-semibold">{t('you_save')} {(o.oldPrice - o.newPrice).toFixed(2)} TD</span>
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{o.description}</p>
              <div className="flex items-center gap-2 text-xs text-gray-400"><Calendar size={12}/><span>{formatDate(o.uploadDate)}</span></div>
              <div className="mt-4 flex gap-2">
                <button onClick={()=>{ const p = mapOfferToProduct(o); setSelectedProduct(p); setFocusOrder(false); setShowOrderModal(true); }} className="px-3 py-2 text-sm rounded text-white bg-green-600 hover:bg-green-700">{t('product_view_details')}</button>
                <button onClick={()=>{ setFocusOrder(true); handleOrderNow(o); }} disabled={!o.productId && !o.mainImage} className={`px-3 py-2 text-sm rounded text-white ${(o.productId || o.mainImage) ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400 cursor-not-allowed'}`}>Order Now</button>
              </div>
            </div>
          </motion.div>
        ))}
            </motion.div>
          );
        })()}
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



