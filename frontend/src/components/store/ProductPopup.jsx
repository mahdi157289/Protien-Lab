import PropTypes from 'prop-types';
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import api from '../../config/api';
import { useTranslation } from "react-i18next";
import { useSmokey } from '../../contexts/SmokeyContext';
import { Star, Truck, ShieldCheck, ArrowLeft, X, CheckCircle, Flame, Dumbbell, Percent, Package, Repeat2, Sparkles, ShoppingBag, ChevronLeft, Tag, Users, AlertTriangle } from 'lucide-react';

function ProductPopup({ product, onClose, focusOrder }) {
  const { user } = useAuth();
  const { smokeyOn } = useSmokey();
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [ordering, setOrdering] = useState(false);

  const [selectedFlavor, setSelectedFlavor] = useState(product.flavors?.[0] || '');
  const [selectedWeight, setSelectedWeight] = useState(product.weights?.[0] || '');
  const orderSectionRef = useRef(null);
  useEffect(() => {
    if (focusOrder) {
      setOrdering(true);
    }
    if (focusOrder && orderSectionRef.current) {
      orderSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      orderSectionRef.current.classList.add('ring-2','ring-primary');
      setTimeout(()=>orderSectionRef.current && orderSectionRef.current.classList.remove('ring-2','ring-primary'),700);
    }
  }, [focusOrder]);

  // Image helpers
  const placeholder = (w=360,h=360) => `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}'><rect width='100%' height='100%' fill='#ededed'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='#888' font-size='14'>No Image</text></svg>`)}`;
  const resolveImageUrl = (url) => {
    if (!url) return '';
    const str = String(url);
    if (/^(https?:)?\/\//.test(str) || str.startsWith('data:')) return str; // absolute or data
    return `${import.meta.env.VITE_IMAGE_URL}/${str.replace(/^\/+/, '')}`;
  };

  // Gallery state
  const images = Array.isArray(product.images) ? product.images : (product.image ? [product.image] : []);
  const [galleryIdx, setGalleryIdx] = useState(0);
  const mainImgSrc = resolveImageUrl(images[galleryIdx]) || placeholder();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    address: "",
    phone: ""
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.firstName && user.lastName 
              ? `${user.firstName} ${user.lastName}` 
              : "",
        email: user.email || "",
        address: user.address || "",
        phone: user.number || ""
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleOrderNow = async () => {
    try {
      setLoading(true);
      setError(null);

      // Validate form data
      if (!formData.name || !formData.email || !formData.address || !formData.phone) {
        throw new Error(t("product_order_error_required"));
      }

      if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
        throw new Error(t("product_order_error_email"));
      }

      if (!/^\d{8}$/.test(formData.phone)) {
        throw new Error(t("product_order_error_phone"));
      }

      const orderData = {
        orderItems: [{
          product: product._id,
          quantity: quantity,
          price: product.price,
          flavor: selectedFlavor,
          weight: selectedWeight
        }],
        shippingAddress: {
          fullName: formData.name,
          address: formData.address,
          phoneNumber: formData.phone,
          email: formData.email
        },
        totalAmount: product.price * quantity
      };

      // Check if user is logged in
      if (user) {
        // User is logged in, use regular order endpoint
      await api.post('/users/orders', orderData);
      navigate('/store/orders');
      onClose();
      } else {
        // Guest order - no account needed
        const response = await api.post('/users/orders/guest', orderData);
        
        if (response.data.success) {
          // Show success message
          alert('Order placed successfully! You will receive a confirmation email shortly.');
          // Close the popup
          onClose();
        }
      }
    } catch (error) {
      setError(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black bg-opacity-80 flex items-center justify-center overflow-y-auto"
        style={{minHeight:'100dvh'}}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.95 }}
          className="w-full max-w-3xl sm:max-w-4xl md:max-w-5xl xl:max-w-6xl bg-white text-black rounded-lg shadow-2xl p-2 md:p-7 relative border border-white/10 mx-2 my-8"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button className="absolute text-3xl font-bold top-4 right-4 hover:text-primary z-10 focus:outline-none" onClick={onClose} aria-label="Close"><X/></button>

          {/* Overlay: ORDER FORM step — draw over details if ordering */}
          {ordering && (
            <motion.div initial={{y: "100%"}} animate={{y:0}} exit={{y:"100%"}} transition={{duration:0.3}} className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
              <div className="max-w-lg w-full m-4 bg-white rounded-xl shadow-2xl p-6 border border-primary/30 relative">
                <button className="absolute left-2 top-2 p-2 rounded hover:bg-gray-100" onClick={()=>setOrdering(false)} aria-label="Back"><ChevronLeft /></button>
                <h2 className="mb-4 text-center text-2xl font-black flex items-center gap-2"><ShoppingBag className="inline mr-1 text-primary"/> {t('product_order_now')}</h2>
                {/* -- THE SAME ORDER FORM AS BEFORE, re-inserted here -- */}
                <div className="mb-6 flex justify-center"><span className="bg-primary text-white py-1 px-4 text-lg font-bold rounded-md">{product.name}</span></div>
                <div className="flex gap-4 justify-between mb-6">
                  {selectedFlavor && <span className="flex items-center gap-1 text-sm"><Tag className="w-4"/> {selectedFlavor}</span>}
                  {selectedWeight && <span className="flex items-center gap-1 text-sm"><Dumbbell className="w-4"/> {selectedWeight}</span>}
                  <span className="flex items-center gap-1 text-primary font-bold">{product.price * quantity} TD</span>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block mb-1 text-sm ">{t('product_order_name')}</label>
                    <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full p-2 border rounded" required />
                  </div>
                  <div>
                    <label className="block mb-1 text-sm ">{t('product_order_email')}</label>
                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full p-2 border rounded" required />
                  </div>
                  <div>
                    <label className="block mb-1 text-sm ">{t('product_order_address')}</label>
                    <input type="text" name="address" value={formData.address} onChange={handleInputChange} className="w-full p-2 border rounded" required />
                  </div>
                  <div>
                    <label className="block mb-1 text-sm ">{t('product_order_phone')}</label>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full p-2 border rounded" required />
                  </div>
                  {error && <div className="text-red-500 py-1 text-center">{error}</div>}
                </div>
                <div className="flex justify-end mt-6">
                  <button className="px-10 py-2 bg-primary rounded-lg font-bold text-white hover:bg-green-600 transition disabled:opacity-50" disabled={loading} onClick={handleOrderNow}>{loading ? t('product_order_placing') : t('product_order_now')}</button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Main content: details only if not ordering */}
          {!ordering && (
          <div className="flex flex-col md:flex-row gap-8">
            {/* Gallery (Left) */}
            <div className="w-full md:w-[390px] flex flex-col items-center">
              <div className="flex-1 w-full flex items-center justify-center bg-gray-100 border border-gray-200 rounded-xl min-h-[300px] max-h-[420px]">
                <img src={mainImgSrc} alt={product.name}
                  className="object-contain max-h-[410px] w-full rounded-lg"
                  onError={(e)=>{e.currentTarget.onerror=null;e.currentTarget.src=placeholder(360,360);}}
                />
              </div>
              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-2 mt-4">
                  {images.map((img, idx) => (
                    <button key={img+idx} onClick={()=>setGalleryIdx(idx)}
                      className={`w-14 h-14 bg-gray-200 rounded-lg border ${galleryIdx===idx?'border-primary':'border-gray-200'} transition-all flex items-center justify-center`}>
                      <img src={resolveImageUrl(img) || placeholder(56,56)}
                        alt={`thumb ${idx}`}
                        className="object-contain w-12 h-12"
                        onError={(e)=>{e.currentTarget.onerror=null;e.currentTarget.src=placeholder(56,56);}}
                       />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info & Buy Section (Right) */}
            <div className="w-full max-w-xl flex flex-col gap-4">
              {/* Brand & SKU row */}
              <div className="flex flex-wrap items-center gap-3 mb-2">
                {product.brand && (
                  <span className="uppercase text-xs tracking-wide text-primary font-bold flex gap-1 items-center"><Tag className="w-4 inline-block"/> {product.brand}</span>
                )}
                {product.sku && (
                  <span className="text-xs bg-gray-200 text-gray-800 rounded px-2 py-1 flex items-center gap-1 font-mono"><strong>SKU:</strong> {product.sku}</span>
                )}
              </div>
              {/* Name/Title */}
              <h2 className={`text-2xl md:text-3xl font-black leading-tight flex gap-2 items-center mb-0 ${smokeyOn ? 'text-white' : 'text-black'}`}>
                {product.name} <span className="text-yellow-400 flex gap-1 ml-2 mt-1">{[...Array(4)].map((_,i)=> <Star key={i} className="w-5" fill="#FFD700"/>)}<Star className="w-5"/></span>
              </h2>
              {/* Short Description as subtitle */}
              {product.descriptionShort && (
                <div className="text-base italic text-black/70 mb-1">{product.descriptionShort}</div>
              )}
              {/* Categories/Types as chips if present */}
              <div className="flex flex-wrap gap-2 mb-2">
                {Array.isArray(product.categories) && product.categories.length > 0 && product.categories.map((cat) => (
                  <span key={cat} className="text-xs px-2 py-1 rounded-full bg-secondary/20 border border-primary/20 text-black font-semibold">{cat}</span>
                ))}
                {Array.isArray(product.types) && product.types.length > 0 && product.types.map((type) => (
                  <span key={type} className="text-xs px-2 py-1 rounded-full bg-accent/20 border border-accent/40 text-green-700 font-semibold">{type}</span>
                ))}
              </div>
              {/* Benefit list always if present */}
              {Array.isArray(product.benefits) && product.benefits.length > 0 && (
                <ul className="mb-2 mt-2 list-disc pl-5 text-base text-green-600 space-y-1">
                  {product.benefits.map((b, i) => (<li key={i} className="flex items-center gap-2"><CheckCircle className="w-4 text-green-500 inline"/>{b}</li>))}
                </ul>
              )}
              {/* Flavors/Weights always if present as chips */}
              <div className="flex flex-row flex-wrap gap-4 items-center mb-4 mt-2">
                {/* Flavors */}
                {Array.isArray(product.flavors) && product.flavors.length > 0 && (
                  <div className="flex items-center gap-1">
                    {product.flavors.map(f => (
                      <span key={f} className="px-3 py-1 rounded-full text-xs font-bold bg-primary text-black border border-primary flex items-center gap-1 mr-2"><Tag className="w-4"/>{f}</span>
                    ))}
                  </div>
                )}
                {/* Weights */}
                {Array.isArray(product.weights) && product.weights.length > 0 && (
                  <div className="flex items-center gap-1">
                    {product.weights.map(w => (
                      <span key={w} className="px-3 py-1 rounded-full text-xs font-bold bg-primary text-black border border-primary flex items-center gap-1 mr-2"><Dumbbell className="w-4"/>{w}</span>
                    ))}
                  </div>
                )}
                {/* Stock */}
                {typeof product.stock === 'number' && (
                  <span className={`${product.stock < 5 ? 'bg-red-50 border-red-400 text-red-800' : 'bg-green-50 border-green-600 text-green-900'} flex items-center gap-1 text-xs px-2 py-1 rounded-full font-bold border`}>
                    <Package className="w-4 inline-block"/>{product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                  </span>
                )}
                {/* Badges */}
                {product.isBestSeller && (<span className="flex items-center gap-1 bg-primary text-black text-xs font-bold px-2 py-1 rounded-full"><Flame className="w-4"/> Best Selles</span>)}
                {product.isNew && (<span className="flex items-center gap-1 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full"><Sparkles className="w-4"/> NEW</span>)}
                {product.fastDelivery && (<span className="flex items-center gap-1 bg-primary text-black text-xs font-semibold px-2 py-1 rounded-full"><Truck className="w-4"/>Fast Delivery</span>)}
                {product.limitedStockNotice && (<span className="flex items-center gap-1 bg-red-600 text-white text-xs px-3 py-1 rounded-full font-bold animate-pulse shadow"><AlertTriangle className="w-4"/> {product.limitedStockNotice}</span>)}
              </div>
              <div className="flex items-center gap-4 mb-1 mt-2">
                <span className="text-3xl font-extrabold text-primary flex gap-1 items-center">{product.price} TD</span>
                {product.oldPrice && product.oldPrice > product.price && (
                  <span className="line-through text-lg text-gray-400 flex gap-1 items-center"><Percent className="w-4"/>{product.oldPrice} TD</span>
                )}
                {product.oldPrice && product.oldPrice > product.price && (
                  <span className="bg-red-500 text-white text-xs px-2 py-1 ml-2 rounded-lg font-bold flex gap-1 items-center"><Percent className="w-4"/>-{Math.round(((product.oldPrice - product.price)/product.oldPrice)*100)}%</span>
                )}
              </div>
              {!ordering && (
                <div className="mt-3">
                  <button onClick={() => setOrdering(true)}
                    className="w-full sm:w-auto px-6 py-2 text-base rounded-md font-bold flex items-center justify-center gap-2 bg-primary hover:bg-green-600 text-black shadow-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
                    <ShoppingBag className="w-5 h-5"/> Order Now
                  </button>
                </div>
              )}
              {product.descriptionFull && (
                <details className="mt-3 border-t pt-4 text-gray-700 text-base" open>
                  <summary className="font-bold text-lg cursor-pointer mb-2">Description</summary>
                  <div>{product.descriptionFull}</div>
                </details>
              )}
            </div>{/* Info col */}
          </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
export default ProductPopup;