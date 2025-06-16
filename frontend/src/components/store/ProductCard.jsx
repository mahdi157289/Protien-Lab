import PropTypes from 'prop-types';
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ProductPopup from "./ProductPopup";
import { useTranslation } from "react-i18next";

function ProductCard({ product }) {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const { t } = useTranslation();

  const handleProductClick = (e) => {
    e.stopPropagation();
    setSelectedProduct(product);
  };

  const togglePopup = () => setSelectedProduct(null);

  // Handle images array fallback
  const images = Array.isArray(product.images) ? product.images : [product.image];

  return (
    <motion.div 
      className="w-80 h-[450px] bg-[#1C1C1C] text-white rounded-xl shadow-lg overflow-hidden border-[10px] border-[#1C1C1C]"
      layout
    >
      {/* Product Images with Hover Effect */}
      <div className="bg-[#29292A] flex justify-center items-center p-4 rounded-lg relative group h-48">
        {/* First image (default) */}
        <img
          className="object-contain h-48 w-full absolute left-0 top-0 transition-opacity duration-300 group-hover:opacity-0"
          src={`${import.meta.env.VITE_IMAGE_URL}/${images[0]}`}
          alt={product.name}
        />
        {/* Second image (on hover) */}
        {images[1] && (
          <img
            className="object-contain h-48 w-full absolute left-0 top-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            src={`${import.meta.env.VITE_IMAGE_URL}/${images[1]}`}
            alt={product.name + " alt"}
          />
        )}
      </div>

      {/* Product Info */}
      <div className="p-4 bg-[#1C1C1C]">
        <h2 className="mb-2 text-lg font-bold text-white">{product.name}</h2>
        <p className="mb-2 text-xl font-semibold #40ee45">TND. {product.price}</p>
        <p className="mb-4 text-sm text-gray-400">{product.descriptionShort}</p>
        {/* Order Button */}
        <button
          className="w-full py-2 font-bold text-white bg-green-500 rounded-md hover:bg-green-600"
          onClick={handleProductClick}
        >
          {t('product_order_now')}
        </button>
      </div>

      {/* Show Popup with proper animation handling */}
      <AnimatePresence>
        {selectedProduct && (
          <ProductPopup
            product={selectedProduct}
            onClose={togglePopup}
          />
        )}
      </AnimatePresence>
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