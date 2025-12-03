import PropTypes from 'prop-types';
import { useState } from "react";
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

  const handleProductClick = (e) => {
    e.stopPropagation();
    setSelectedProduct(product);
  };

  const togglePopup = () => setSelectedProduct(null);

  // Handle images array fallback
  let images = Array.isArray(product.images) ? product.images : [];
  if (images.length === 0 && product.image) images = [product.image];

  const discountPct = product.oldPrice && product.oldPrice > product.price 
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : 0;

  return (
    <motion.div 
      className="w-80 text-white rounded-xl shadow-lg overflow-hidden border border-accent/10 hover:border-primary/30 transition-all bg-dark relative"
      whileHover={{ y: -4 }}
      layout
    >
      {/* URGENCY/TRUST BADGES (left group) */}
      <div className="absolute z-10 flex flex-wrap gap-2 left-2 top-2 max-w-[80%]">
        {product.isNew && (
          <span className="inline-flex items-center bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full mb-1 font-source-sans">NEW</span>
        )}
        {product.isBestSeller && (
          <span className={`inline-flex items-center bg-primary text-xs font-bold px-2 py-1 rounded-full mb-1 font-source-sans ${smokeyOn ? 'text-white' : 'text-black'}`}>Selles</span>
        )}
        {product.fastDelivery && (
          <span className={`inline-flex items-center bg-primary text-xs font-semibold px-2 py-1 rounded-full mb-1 font-source-sans ${smokeyOn ? 'text-white' : 'text-black'}`}>Fast Delivery</span>
        )}
      </div>
      {product.limitedStockNotice && (
        <div className="absolute top-2 right-2 bg-red-600 text-white text-xs px-3 py-1 rounded-full font-bold animate-pulse shadow font-source-sans">
          {product.limitedStockNotice}
        </div>
      )}

      {/* Product Images with Hover Effect (same as old but robust for all data) */}
      <div className="bg-gradient-to-b from-[#1f1f1f] to-[#141414] flex justify-center items-center p-4 relative group h-48 overflow-hidden">
        {/* Use first image or fallback, both must fill */}
        {images[0] && (
          <img
            className="object-contain h-48 w-full transition-opacity duration-300 rounded-md bg-black"
            src={resolveImageUrl(images[0]) || 'https://via.placeholder.com/240x180/272727/40ee45?text=No+Image'}
            alt={product.name}
            style={{background: '#181818'}}
            onError={(e)=>{e.currentTarget.onerror=null;e.currentTarget.src='https://via.placeholder.com/240x180/272727/40ee45?text=No+Image';}}
          />
        )}
        {images[1] && (
          <img
            className="object-contain h-48 w-full absolute left-0 top-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 rounded-md bg-black"
            src={resolveImageUrl(images[1]) || 'https://via.placeholder.com/240x180/272727/40ee45?text=No+Image'}
            alt={product.name + " alt"}
            onError={(e)=>{e.currentTarget.onerror=null;e.currentTarget.src='https://via.placeholder.com/240x180/272727/40ee45?text=No+Image';}}
          />
        )}
        {discountPct > 0 && (
          <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 font-source-sans">
            <Percent size={12} />{discountPct}%
          </div>
        )}
      </div>

      {/* Flavor & Weight chips (variant indicators) */}
      {(product.flavors?.length > 0 || product.weights?.length > 0) && (
        <div className="flex flex-wrap gap-2 px-4 pt-4">
          {product.flavors && product.flavors.map(f => (
            <span className={`px-2 py-0.5 rounded-full bg-primary text-xs font-medium border border-primary/30 font-source-sans ${smokeyOn ? 'text-white' : 'text-dark'}`} key={f}>{f}</span>
          ))}
          {product.weights && product.weights.map(w => (
            <span className="px-2 py-0.5 rounded-full bg-gray-800 text-white/80 text-xs font-medium border border-white/10 font-source-sans" key={w}>{w}</span>
          ))}
        </div>
      )}
      {/* Basic Info */}
      <div className="p-4">
        <h2 className={`mb-2 text-lg font-bold line-clamp-2 font-orbitron ${smokeyOn ? 'text-white' : 'text-gray-300'}`}>{product.name}</h2>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-end gap-2">
            <span className="text-2xl font-extrabold text-green-500 font-orbitron">{product.price.toFixed(2)} TD</span>
            {product.oldPrice && product.oldPrice > product.price && (
              <span className="text-sm line-through text-white/50 font-source-sans">{product.oldPrice.toFixed(2)} TD</span>
            )}
          </div>
          <div className="flex items-center gap-1 text-yellow-400">
            <Star size={16} fill="currentColor" />
            <Star size={16} fill="currentColor" />
            <Star size={16} fill="currentColor" />
            <Star size={16} fill="currentColor" />
            <Star size={16} />
          </div>
        </div>
        {discountPct > 0 && (
          <div className="mb-2 text-xs text-green-400 font-semibold font-source-sans">You save {(product.oldPrice - product.price).toFixed(2)} TD</div>
        )}
        <div className="mb-2 flex flex-wrap gap-1">
          {(product.categories || []).map((c) => (
            <span key={c} className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 border border-white/10 font-source-sans">{c.replace('_',' ')}</span>
          ))}
        </div>
        <p className="mb-4 text-sm text-gray-400 line-clamp-2 font-source-sans">{product.descriptionShort}</p>
        {/* Benefits bullets */}
        {product.benefits?.length > 0 && (
          <ul className="mb-4 list-disc pl-5 text-sm text-green-300 font-source-sans">
            {product.benefits.map((b,i) => (
              <li key={i}>{b}</li>
            ))}
          </ul>
        )}
        {/* Two CTA buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mt-4">
          <button
            className="flex-1 py-2 font-bold text-white bg-green-600 rounded-md hover:bg-green-700 font-source-sans"
            onClick={() => { setSelectedProduct(product); setOrderDirect(false); }}
          >
            {t('product_view_details')}
          </button>
          <button
            className="flex-1 py-2 font-bold text-white bg-green-600 rounded-md hover:bg-green-700 font-source-sans"
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
    images: PropTypes.arrayOf(PropTypes.string), // Now expects an array
    image: PropTypes.string, // fallback for old data
    descriptionShort: PropTypes.string.isRequired
  }).isRequired
};

export default ProductCard;