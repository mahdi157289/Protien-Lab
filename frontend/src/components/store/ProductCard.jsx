import PropTypes from 'prop-types';
import { useState } from "react";
import ProductPopup from "./ProductPopup";

function ProductCard({ product }) {
  const [selectedProduct, setSelectedProduct] = useState(null);

  const handleProductClick = () => {
    setSelectedProduct(product);
  };

  const togglePopup = () => setSelectedProduct(null);

  return (
    <div className="w-80 h-[450px] bg-[#1C1C1C] text-white rounded-lg shadow-lg overflow-hidden border-[10px] border-[#1C1C1C] rounded-[15px]">
      {/* Product Image */}
      <div className="bg-[#29292A] flex justify-center items-center p-4 rounded-[10px]">
        <img
          className="object-contain h-48"
          src={`${import.meta.env.VITE_IMAGE_URL}/${product.image}`}
          alt={product.name}
        />
      </div>

      {/* Product Info */}
      <div className="p-4 bg-[#1C1C1C]">
        <h2 className="mb-2 text-lg font-bold text-white">{product.name}</h2>
        <p className="mb-2 text-xl font-semibold text-red-500">Rs. {product.price}</p>
        <p className="mb-4 text-sm text-gray-400">{product.descriptionShort}</p>
        {/* Order Button */}
        <button
          className="w-full py-2 font-bold text-white bg-red-500 rounded-md hover:bg-red-600"
          onClick={handleProductClick}
        >
          Order Now
        </button>
      </div>

      {/* Show Popup */}
      {selectedProduct && (
        <ProductPopup
          product={selectedProduct}
          onClose={togglePopup}
        />
      )}
    </div>
  );
}

ProductCard.propTypes = {
  product: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    image: PropTypes.string.isRequired,
    descriptionShort: PropTypes.string.isRequired
  }).isRequired
};

export default ProductCard;