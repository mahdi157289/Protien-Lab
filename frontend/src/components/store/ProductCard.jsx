import React, { useState } from "react";
import ProductPopup from "./ProductPopup"; // Import the popup component

function ProductCard({ image, title, price, description, features }) {
  const [selectedProduct, setSelectedProduct] = useState(null);

  const handleProductClick = () => {
    const product = { image, title, price, description, features }; // Create the product object
    setSelectedProduct(product); // Set selected product
  };

  const togglePopup = () => setSelectedProduct(null); // Close the popup by setting the selected product to null

  return (
    <div className="w-80 h-[450px] bg-[#1C1C1C] text-white rounded-lg shadow-lg overflow-hidden border-[10px] border-[#1C1C1C] rounded-[15px]">
      {/* Product Image */}
      <div className="bg-[#29292A] flex justify-center items-center p-4 rounded-[10px]">
        <img className="h-48 object-contain" src={image} alt={title} />
      </div>

      {/* Product Info */}
      <div className="p-4 bg-[#1C1C1C]">
        <h2 className="text-lg font-bold text-white mb-2">{title}</h2>
        <p className="text-red-500 text-xl font-semibold mb-2">Rs. {price}</p>
        <p className="text-gray-400 text-sm mb-4">{description}</p>
        {/* Order Button */}
        <button
          className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 rounded-md"
          onClick={handleProductClick}
        >
          Order Now
        </button>
      </div>

      {/* Show Popup */}
      {selectedProduct && (
        <ProductPopup
          image={selectedProduct.image}
          title={selectedProduct.title}
          price={selectedProduct.price}
          features={selectedProduct.features}
          description={selectedProduct.description}
          onClose={togglePopup}
        />
      )}
    </div>
  );
}

export default ProductCard;
