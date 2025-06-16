import PropTypes from 'prop-types';
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import api from '../../config/api';
import { useTranslation } from "react-i18next";

function ProductPopup({ product, onClose }) {
  const { user } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { t } = useTranslation();

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

      if (!formData.name || !formData.email || !formData.address || !formData.phone) {
        throw new Error(t("product_order_error_required"));
      }

      if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
        throw new Error(t("product_order_error_email"));
      }

      if (!/^\d{10}$/.test(formData.phone)) {
        throw new Error(t("product_order_error_phone"));
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

      await api.post('/users/orders', orderData);
      navigate('/store/orders');
      onClose();
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
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80"
        onClick={onClose}
      >
        <motion.div 
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.9 }}
          className="bg-[#1C1C1C] text-white rounded-lg shadow-lg w-full max-w-4xl p-6 relative mx-4"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            className="absolute text-4xl font-semibold top-4 right-4 hover:text-primary"
            onClick={onClose}
          >
            &times;
          </button>

          {/* Scrollable Content */}
          <div className="overflow-y-auto max-h-[80vh]">
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
                  <label className="mr-4 text-sm font-bold">{t('product_order_quantity')}</label>
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
                  <p className="text-xl font-bold #40ee45">
                    {t('product_order_total', { total: (product.price * quantity).toLocaleString() })}
                  </p>
                </div>
              </div>
            </div>

            {/* User Details and Delivery Information */}
            <div className="grid grid-cols-1 gap-6 mt-6 lg:grid-cols-3">
              {/* User Details Form */}
              <div className="lg:col-span-2 bg-[#29292A] p-4 rounded">
                <h3 className="mb-4 text-lg font-bold">{t('product_order_your_info')}</h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="block mb-1 text-sm">{t('product_order_name')}</label>
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
                    <label className="block mb-1 text-sm">{t('product_order_email')}</label>
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
                    <label className="block mb-1 text-sm">{t('product_order_address')}</label>
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
                    <label className="block mb-1 text-sm">{t('product_order_phone')}</label>
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
                <h3 className="mb-4 text-lg font-bold">{t('product_order_delivery_info')}</h3>
                <p className="mb-2 text-sm">
                  <strong>{t('product_order_delivery_mode_label')}</strong> {t('product_order_delivery_mode')}
                </p>
                <p className="mb-2 text-sm">
                  <strong>{t('product_order_delivery_time_label')}</strong> {t('product_order_delivery_time')}
                </p>
                <p className="text-sm">
                  <strong>{t('product_order_shipping_charges_label')}</strong> {t('product_order_shipping_charges')}
                </p>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 mt-4 #40ee45 rounded-lg bg-red-500/20">
                {error}
              </div>
            )}

            {/* Order Button */}
            <div className="flex justify-end mt-6">
              <button
                className="px-8 py-2 font-bold transition bg-green-500 rounded hover:bg-green-600"
                onClick={handleOrderNow}
                disabled={loading}
              >
                {loading ? t('product_order_placing') : t('product_order_now')}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
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