import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation

function ProductPopup({ image, title, price, description, features, onClose }) {
  const [quantity, setQuantity] = useState(1);
  const navigate = useNavigate(); // Initialize useNavigate for navigation

  const increment = () => {
    setQuantity((prevQuantity) => prevQuantity + 1);
  };

  const decrement = () => {
    if (quantity > 1) {
      setQuantity((prevQuantity) => prevQuantity - 1);
    }
  };

  const handleOrderNow = () => {
    // Navigate to the Orders page with product details and quantity
    navigate("/store/orders", { state: { title, price, quantity } });
  };

  const totalPrice = price * quantity; // Calculate total price based on quantity

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50">
      <div className="bg-[#1C1C1C] text-white rounded-lg shadow-lg w-[100%] max-w-4xl p-6 relative">
        {/* Close Button */}
        <button
          className="absolute top-4 right-4 text-xl font-bold text-white hover:text-gray-400"
          onClick={onClose}
        >
          &times;
        </button>

        {/* Product Section */}
        <div className="flex flex-col md:flex-row gap-6">
          <div
            className="flex justify-center items-center"
            style={{
              backgroundColor: "#29292A",
              width: "320px",
              height: "320px",
              padding: "10px",
              borderRadius: "8px",
            }}
          >
            <img
              src={image}
              alt="Product"
              style={{
                width: "300px",
                height: "300px",
                objectFit: "contain",
              }}
            />
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">{title}</h2>
            {features && features.length > 0 ? (
              <ul className="list-disc pl-5 text-sm mb-4">
                {features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm mb-4">No features available for this product.</p>
            )}

            {/* Quantity Section */}
            <div className="flex items-center mb-4">
              <label className="text-sm font-bold mr-4">Quantity</label>
              <div className="flex items-center border border-gray-600 rounded-lg overflow-hidden">
                <button
                  className="px-4 py-2 bg-[#29292A] hover:bg-gray-600 text-white font-bold"
                  onClick={decrement}
                >
                  -
                </button>
                <div className="w-12 text-center bg-[#1C1C1C] text-white font-bold py-2">
                  {quantity}
                </div>
                <button
                  className="px-4 py-2 bg-[#29292A] hover:bg-gray-600 text-white font-bold"
                  onClick={increment}
                >
                  +
                </button>
              </div>
            </div>

            <p className="text-xl font-semibold text-red-500">Rs. {totalPrice}</p>
          </div>
        </div>

        {/* User and Delivery Information */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          <div className="lg:col-span-2 bg-[#29292A] p-4 rounded">
            <h3 className="text-lg font-bold mb-4">Your Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1">Name:</label>
                <input
                  type="text"
                  className="w-full p-2 bg-[#29292A] text-white border border-gray-600 rounded"
                  defaultValue="Thisara Kavinda Wickramarathna"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Email:</label>
                <input
                  type="email"
                  className="w-full p-2 bg-[#29292A] text-white border border-gray-600 rounded"
                  defaultValue="thisarakavinda@gmail.com"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Address:</label>
                <input
                  type="text"
                  className="w-full p-2 bg-[#29292A] text-white border border-gray-600 rounded"
                  defaultValue="123/A Labunoruwa Road, Maradan"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Phone No:</label>
                <input
                  type="tel"
                  className="w-full p-2 bg-[#29292A] text-white border border-gray-600 rounded"
                  defaultValue="0771234567"
                />
              </div>
            </div>
          </div>

          <div className="bg-[#29292A] p-4 rounded">
            <h3 className="text-lg font-bold mb-4">Delivery Information</h3>
            <p className="text-sm mb-2">
              <strong>Delivery Mode:</strong> Cash on Delivery
            </p>
            <p className="text-sm mb-2">
              <strong>Delivery Time:</strong> 3-5 Business Days
            </p>
            <p className="text-sm">
              <strong>Shipping Charges:</strong> Free
            </p>
          </div>
        </div>

        {/* Order Button */}
        <div className="flex justify-end mt-6">
          <button
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-8 rounded"
            onClick={handleOrderNow}
          >
            Order Now
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductPopup;
