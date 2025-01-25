import PropTypes from 'prop-types';
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import api from '../../config/api';

function ProductPopup({ product, onClose }) {
  const { user } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Initialize form with user data
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    address: "",
    phone: ""
  });

  // Update form when user data loads/changes
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

      // Validate required fields
      if (!formData.name || !formData.email || !formData.address || !formData.phone) {
        throw new Error("Please fill in all required fields marked with *");
      }

      // Validate email format
      if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
        throw new Error("Please enter a valid email address");
      }

      // Validate phone number format
      if (!/^\d{10}$/.test(formData.phone)) {
        throw new Error("Please enter a valid 10-digit phone number");
      }

      const orderData = {
        orderItems: [{
          product: product._id,
          quantity: quantity,
          price: product.price
        }],
        shippingAddress: {
          fullName: formData.name,
          address: formData.address,
          phoneNumber: formData.phone,
          email: formData.email
        },
        totalAmount: product.price * quantity
      };

      const response = await api.post('/users/orders', orderData);
      
      // Redirect to orders page and close popup
      navigate('/store/orders');
      onClose();
    } catch (error) {
      setError(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80">
      <div className="bg-[#1C1C1C] text-white rounded-lg shadow-lg w-full max-w-4xl p-6 relative">
        {/* Close Button */}
        <button
          className="absolute text-4xl font-semibold top-4 right-4 hover:text-primary"
          onClick={onClose}
        >
          &times;
        </button>

        {/* Scrollable Content */}
        <div className="overflow-y-auto max-h-[100vh]">
          {/* Product Section */}
          <div className="flex flex-col gap-6 md:flex-row">
            {/* Product Image */}
            <div className="flex items-center justify-center bg-[#29292A] w-full md:w-[320px] h-[320px] p-2 rounded-lg">
              <img
                src={`${import.meta.env.VITE_IMAGE_URL}/${product.image}`}
                alt={product.name}
                className="object-contain w-[300px] h-[300px]"
              />
            </div>

            {/* Product Details */}
            <div className="flex-1">
              <h2 className="mb-4 text-2xl font-bold">{product.name}</h2>
              <p className="mb-4 text-sm text-gray-300">
                {product.descriptionFull.split('\r\n').map((line, index) => (
                  <span key={index} className="block">
                    • {line}
                  </span>
                ))}
              </p>

              {/* Quantity Selector */}
              <div className="flex items-center mb-6">
                <label className="mr-4 text-sm font-bold">Quantity:</label>
                <div className="flex items-center border border-gray-600 rounded-lg">
                  <button
                    className="px-4 py-2 bg-[#29292A] hover:bg-gray-600 transition-colors"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    -
                  </button>
                  <span className="w-12 text-center bg-[#1C1C1C] py-2">
                    {quantity}
                  </span>
                  <button
                    className="px-4 py-2 bg-[#29292A] hover:bg-gray-600 transition-colors"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Total Price */}
              <div className="p-4 bg-[#29292A] rounded-lg">
                <p className="text-xl font-bold text-red-500">
                  Total: Rs. {(product.price * quantity).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* User Details and Delivery Information */}
          <div className="grid grid-cols-1 gap-6 mt-6 lg:grid-cols-3">
            {/* User Details Form */}
            <div className="lg:col-span-2 bg-[#29292A] p-4 rounded">
              <h3 className="mb-4 text-lg font-bold">Your Information</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="block mb-1 text-sm">Name:</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full p-2 bg-[#29292A] text-white border border-gray-600 rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm">Email:</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full p-2 bg-[#29292A] text-white border border-gray-600 rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm">Address:</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full p-2 bg-[#29292A] text-white border border-gray-600 rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm">Phone No:</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full p-2 bg-[#29292A] text-white border border-gray-600 rounded"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Delivery Information */}
            <div className="bg-[#29292A] p-4 rounded">
              <h3 className="mb-4 text-lg font-bold">Delivery Information</h3>
              <p className="mb-2 text-sm">
                <strong>Delivery Mode:</strong> Cash on Delivery
              </p>
              <p className="mb-2 text-sm">
                <strong>Delivery Time:</strong> 3-5 Business Days
              </p>
              <p className="text-sm">
                <strong>Shipping Charges:</strong> Free
              </p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 mt-4 text-red-500 rounded-lg bg-red-500/20">
              {error}
            </div>
          )}

          {/* Order Button */}
          <div className="flex justify-end mt-6">
            <button
              className="px-8 py-2 font-bold transition bg-red-500 rounded hover:bg-red-600"
              onClick={handleOrderNow}
              disabled={loading}
            >
              {loading ? "Placing Order..." : "Order Now"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

ProductPopup.propTypes = {
  product: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    image: PropTypes.string.isRequired,
    descriptionFull: PropTypes.string.isRequired,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
};

export default ProductPopup;
