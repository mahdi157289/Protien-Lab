import PropTypes from 'prop-types';
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ProductPopup from "./ProductPopup";
import { useTranslation } from "react-i18next";
import { Percent, Star } from "lucide-react";
import { createPortal } from 'react-dom';
import { useSmokey } from '../../contexts/SmokeyContext';
import { resolveImageUrl } from '../../lib/image';

function ProductCard({ product }) {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [orderDirect, setOrderDirect] = useState(false);
  const { t } = useTranslation();
  const { smokeyOn } = useSmokey();

  const togglePopup = () => setSelectedProduct(null);

  // Handle images array fallback
  let images = Array.isArray(product.images) ? product.images : [];
  if (images.length === 0 && product.image) images = [product.image];
  const [imageIndex, setImageIndex] = useState(0);
  useEffect(() => {
    if (images.length > 1) {
      const id = setInterval(() => {
        setImageIndex((i) => (i + 1) % images.length);
      }, 2000);
      return () => clearInterval(id);
    }
    setImageIndex(0);
  }, [images.length]);

  const discountPct = product.oldPrice && product.oldPrice > product.price 
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : 0;

  return (
    <motion.div 
      className="w-full max-w-sm mx-auto bg-secondary text-white rounded-xl shadow-2xl overflow-hidden border border-white/5 relative group hover:border-primary/30 transition-colors duration-300"
      layout
    >
      {/* URGENCY/TRUST BADGES (left group) */}
      <div className="absolute z-10 flex flex-wrap gap-2 left-2 top-2 max-w-[80%]">
        {product.isNewProduct && (
          <span className="inline-flex items-center bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg font-sans uppercase tracking-wider">NEW</span>
        )}
        {product.isBestSeller && (
          <span className={`inline-flex items-center bg-primary text-[10px] font-bold px-2 py-1 rounded-full shadow-lg font-sans uppercase tracking-wider ${smokeyOn ? 'text-white' : 'text-black'}`}>Best Seller</span>
        )}
        {product.fastDelivery && (
          <span className="inline-flex items-center bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg font-sans uppercase tracking-wider">Fast Delivery</span>
        )}
      </div>
      {product.limitedStockNotice && (
        <div className="absolute top-2 right-2 bg-red-600 text-white text-[10px] px-3 py-1 rounded-full font-bold animate-pulse shadow-lg font-sans uppercase tracking-wider z-10">
          {product.limitedStockNotice}
        </div>
      )}

      {/* Product Images */}
      <div
        className="bg-white/5 flex justify-center items-center p-4 relative h-80 overflow-hidden cursor-pointer border-b border-white/5 group-hover:bg-white/10 transition-colors duration-500"
        onClick={() => { setSelectedProduct(product); setOrderDirect(false); }}
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={images[imageIndex] || 'placeholder'}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 0.5 }}
            className="object-contain h-64 w-full drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] transform group-hover:scale-110 transition-transform duration-700"
            src={resolveImageUrl(images[imageIndex]) || 'https://via.placeholder.com/240x180/1a1a1a/40ee45?text=No+Image'}
            alt={product.name}
            style={{background: 'transparent'}}
            onError={(e)=>{e.currentTarget.onerror=null;e.currentTarget.src='https://via.placeholder.com/240x180/1a1a1a/40ee45?text=No+Image';}}
          />
        </AnimatePresence>
        {discountPct > 0 && (
          <div className="absolute bottom-4 right-4 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1 font-sans shadow-lg transform rotate-3">
            <Percent size={12} />{discountPct}% OFF
          </div>
        )}
      </div>

      {/* Flavor & Weight chips (variant indicators) */}
      {(product.flavors?.length > 0 || product.weights?.length > 0) && (
        <div className="flex flex-wrap gap-2 px-4 pt-4">
          {product.flavors && product.flavors.map(f => (
            <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-bold border border-primary/20 font-sans uppercase" key={f}>{f}</span>
          ))}
          {product.weights && product.weights.map(w => (
            <span className="px-2 py-0.5 rounded-md bg-white/5 text-gray-400 text-[10px] font-bold border border-white/10 font-sans uppercase" key={w}>{w}</span>
          ))}
        </div>
      )}
      {/* Basic Info */}
      <div className="p-4">
        <h2 className="mb-2 text-lg font-bold line-clamp-2 font-sans text-white group-hover:text-primary transition-colors duration-300">{product.name}</h2>
        <div className="flex items-center justify-between mb-3">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-primary font-sans">{product.price.toFixed(2)} TD</span>
              {product.oldPrice && product.oldPrice > product.price && (
                <span className="text-sm line-through text-gray-500 font-sans">{product.oldPrice.toFixed(2)} TD</span>
              )}
            </div>
            {discountPct > 0 && (
              <span className="text-[10px] text-green-500 font-bold font-sans uppercase tracking-tight italic">
                Save {(product.oldPrice - product.price).toFixed(2)} TD Today
              </span>
            )}
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-0.5 text-yellow-500">
              <Star size={14} fill="currentColor" />
              <Star size={14} fill="currentColor" />
              <Star size={14} fill="currentColor" />
              <Star size={14} fill="currentColor" />
              <Star size={14} fill="currentColor" className="opacity-50" />
            </div>
            <span className="text-[10px] text-gray-500 font-bold uppercase">4.8 Rating</span>
          </div>
        </div>
        
        <div className="mb-3 flex flex-wrap gap-1">
          {(product.categories || []).map((c) => (
            <span
              key={c}
              className="text-[9px] px-2 py-0.5 rounded bg-dark border border-white/5 text-gray-400 font-bold uppercase tracking-wider"
            >
              {c.replace('_',' ')}
            </span>
          ))}
        </div>
        <p className="mb-5 text-sm text-gray-400 line-clamp-2 font-sans leading-relaxed">{product.descriptionShort}</p>
        
        {/* Benefits bullets */}
        {product.benefits?.length > 0 && (
          <ul className="mb-5 grid grid-cols-1 gap-1 text-[11px] text-gray-300 font-sans font-medium">
            {product.benefits.slice(0, 3).map((b,i) => (
              <li key={i} className="flex items-center gap-2">
                <div className="w-1 h-1 bg-primary rounded-full"></div>
                {b}
              </li>
            ))}
          </ul>
        )}
        {/* Two CTA buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mt-4">
          <button
            className="flex-1 py-2 font-bold text-white bg-green-600 rounded-md hover:bg-green-700 font-sans"
            onClick={() => { setSelectedProduct(product); setOrderDirect(false); }}
          >
            {t('product_view_details')}
          </button>
          <button
            className="flex-1 py-2 font-bold text-white bg-green-600 rounded-md hover:bg-green-700 font-sans"
            onClick={() => { setSelectedProduct(product); setOrderDirect(true); }}
          >
            {t('product_order_now')}
          </button>
        </div>
      </div>
      {/* Show Popup with proper animation handling */}
      {typeof window !== 'undefined' && createPortal(
        <AnimatePresence>
          {selectedProduct && (
            <ProductPopup
              product={selectedProduct}
              onClose={togglePopup}
              focusOrder={orderDirect}
            />
          )}
        </AnimatePresence>,
        document.body
      )}
    </motion.div>
  );
}

ProductCard.propTypes = {
  product: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    images: PropTypes.arrayOf(PropTypes.string),
    image: PropTypes.string,
    descriptionShort: PropTypes.string.isRequired,
    oldPrice: PropTypes.number,
    isNewProduct: PropTypes.bool,
    isBestSeller: PropTypes.bool,
    fastDelivery: PropTypes.bool,
    limitedStockNotice: PropTypes.string,
    flavors: PropTypes.arrayOf(PropTypes.string),
    weights: PropTypes.arrayOf(PropTypes.string),
    categories: PropTypes.arrayOf(PropTypes.string),
    benefits: PropTypes.arrayOf(PropTypes.string)
  }).isRequired
};

export default ProductCard;
