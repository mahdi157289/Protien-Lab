import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../config/api";
import { X, Loader, Trash } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useSmokey } from '../../contexts/SmokeyContext';
import { resolveImageUrl } from '../../lib/image';

function OrderPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [actionType, setActionType] = useState(null); // 'cancel' or 'delete'
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { smokeyOn } = useSmokey();

  const buildPlaceholder = (w, h) => `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}'>`+
    `<rect width='100%' height='100%' fill='#232323'/></svg>`
  )}`;

  // Fetch user orders from backend
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await api.get('/users/orders');
        setOrders(response.data);
        setLoading(false);
      } catch (error) {
        setError(error.response?.data?.message || t('orders_fetch_error'));
        setLoading(false);
      }
    };

    fetchOrders();
  }, [t]);

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Open confirmation modal
  const openConfirmationModal = (order, type) => {
    setSelectedOrder(order);
    setActionType(type);
    setIsConfirmationModalOpen(true);
  };

  // Handle cancel or delete order
  const handleConfirmAction = async () => {
    try {
      if (actionType === 'cancel') {
        await api.delete(`/users/orders/${selectedOrder._id}/cancel`);
      } else if (actionType === 'delete') {
        await api.delete(`/users/orders/${selectedOrder._id}/delete`);
      }
      setOrders(orders.filter(order => order._id !== selectedOrder._id));
      setIsConfirmationModalOpen(false);
    } catch (error) {
      setError(error.response?.data?.message || t('orders_action_error', { action: actionType }));
    }
  };

  // Open order details modal
  const openOrderDetails = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen #40ee45">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen px-8 py-10">
      {/* Page Heading */}
      <h1 className={`mb-8 text-4xl font-bold text-center ${smokeyOn ? 'text-white' : 'text-black'}`}>{t('orders_title')}</h1>
      <p className={`px-4 mb-8 text-center ${smokeyOn ? 'text-white' : 'text-black'}`}>
        {t('orders_subtitle')}
      </p>

      {/* Navigation Buttons */}
      <div className="flex flex-col justify-center gap-8 mb-8 sm:flex-row sm:gap-16">
        <button
          className="w-full sm:w-[288px] h-[60px] border-2 border-green-500 #40ee45 hover:bg-green-500 hover:text-white font-bold rounded-[50px] transition duration-200"
          onClick={() => navigate("/store/products")}
        >
          {t('orders_products_btn')}
        </button>
        <button 
          className="w-full sm:w-[288px] h-[60px] bg-green-500 hover:bg-green-600 text-white font-bold border-2 border-white rounded-[50px] transition duration-200"
          onClick={() => navigate("/store/orders")}
        >
          {t('orders_orders_btn')}
        </button>
      </div>

      {/* Orders List */}
      <div className="max-w-4xl mx-auto">
        {orders.length === 0 ? (
          <div className="bg-[#1C1C1C] text-white rounded-lg p-6 shadow-lg text-center">
            <p className="text-xl font-semibold text-gray-400">
              {t('orders_no_orders')}
            </p>
          </div>
        ) : (
          orders.map((order) => (
            <div key={order._id} className="bg-[#1C1C1C] text-white rounded-lg p-6 shadow-lg mb-4">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-600">
                <div>
                  <h2 className="font-bold #40ee45">{t('orders_order_number', { number: order._id.slice(-5).toUpperCase() })}</h2>
                  <p className="text-sm text-gray-400">{t('orders_placed_on', { date: formatDate(order.createdAt) })}</p>
                </div>
                <span className={`px-2 py-1 rounded-lg text-sm ${
                  order.status === 'Pending' ? 'bg-yellow-500' :
                  order.status === 'Processing' ? 'bg-blue-500' :
                  order.status === 'Shipped' ? 'bg-green-500' :
                  order.status === 'Delivered' ? 'bg-purple-500' : 'bg-red-500'
                }`}>
                  {t(`orders_status_${order.status.toLowerCase()}`, { defaultValue: order.status })}
                </span>
              </div>

              {order.orderItems.map((item, index) => {
                const rawImage = (Array.isArray(item.product?.images) && item.product.images[0]) || item.product?.image || '';
                const resolvedSrc = resolveImageUrl(String(rawImage)) || buildPlaceholder(120,120);
                return (
                <div key={index} className="flex gap-6 ">
                  <div className="flex justify-center items-center bg-[#29292A] w-[150px] h-[150px] p-2 rounded-lg">
                    <img
                      src={resolvedSrc}
                      alt={item.product?.name || 'product'}
                      className="w-[120px] h-[120px] object-contain"
                      onError={(e)=>{e.currentTarget.onerror=null;e.currentTarget.src=buildPlaceholder(120,120);}}
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="mb-2 text-lg font-bold">{item.product.name}</h3>
                    <p className="mb-1 text-sm">{t('orders_quantity', { quantity: item.quantity })}</p>
                    <p className="mb-1 font-medium text-md">
                      {t('orders_price_x_quantity', { price: item.price, quantity: item.quantity })}
                    </p>
                    <div className="flex items-center justify-between mt-4">
                      <p className="text-xl font-bold text-primary">{t('orders_total', { total: order.totalAmount })}</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => openOrderDetails(order)}
                          className="px-4 py-2 text-white transition bg-blue-500 rounded-md hover:bg-blue-600"
                        >
                          {t('orders_view_details')}
                        </button>
                        {/* Show Cancel or Delete button based on order status */}
                        {order.status === 'Pending' || order.status === 'Processing' ? (
                          <button
                            onClick={() => openConfirmationModal(order, 'cancel')}
                            className="px-4 py-2 text-white transition bg-green-500 rounded-md hover:bg-green-600"
                          >
                            {t('orders_cancel_order')}
                          </button>
                        ) : order.status === 'Cancelled' && (
                          <button
                            onClick={() => openConfirmationModal(order, 'delete')}
                            className="flex items-center gap-2 px-4 py-2 text-white bg-green-500 rounded-md hover:bg-green-600"
                          >
                            <Trash size={16} /> {t('orders_delete')}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )})}
            </div>
          ))
        )}
      </div>

      {/* Order Details Modal */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
          <div className="relative w-full max-w-4xl p-6 rounded-lg shadow-lg bg-dark">
            <button
              className="absolute text-xl font-bold top-4 right-4 hover:text-primary"
              onClick={() => setIsModalOpen(false)}
            >
              <X size={24} />
            </button>

            <h2 className="mb-4 text-2xl font-bold">{t('orders_details_title')}</h2>
            
            {/* Shipping Information */}
            <div className="bg-[#29292A] p-4 rounded-lg mb-6">
              <h3 className="mb-2 text-lg font-bold">{t('orders_shipping_details')}</h3>
              <p>{t('orders_shipping_name', { name: selectedOrder.shippingAddress.fullName })}</p>
              <p>{t('orders_shipping_email', { email: selectedOrder.shippingAddress.email })}</p>
              <p>{t('orders_shipping_address', { address: selectedOrder.shippingAddress.address })}</p>
              <p>{t('orders_shipping_phone', { phone: selectedOrder.shippingAddress.phoneNumber })}</p>
            </div>

            {/* Order Items */}
            <div className="bg-[#29292A] p-4 rounded-lg">
              <h3 className="mb-2 text-lg font-bold">{t('orders_products')}</h3>
              {selectedOrder.orderItems.map((item, index) => {
                const rawImage = (Array.isArray(item.product?.images) && item.product.images[0]) || item.product?.image || '';
                const resolvedSrc = resolveImageUrl(String(rawImage)) || buildPlaceholder(80,80);
                return (
                <div key={index} className="flex items-center gap-4 mb-4">
                  <img
                    src={resolvedSrc}
                    alt={item.product?.name || 'product'}
                    className="object-contain w-20 h-20"
                    onError={(e)=>{e.currentTarget.onerror=null;e.currentTarget.src=buildPlaceholder(80,80);}}
                  />
                  <div>
                    <h4 className="font-bold">{item.product.name}</h4>
                    <p>{t('orders_quantity', { quantity: item.quantity })}</p>
                    <p>{t('orders_price_each', { price: item.price })}</p>
                  </div>
                </div>
              )})}
              <div className="pt-4 border-t border-gray-600">
                <p className="text-lg font-bold">{t('orders_total', { total: selectedOrder.totalAmount })}</p>
                <p className="text-sm text-gray-400">{t('orders_payment_method', { method: selectedOrder.paymentMethod })}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {isConfirmationModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80">
          <div className="relative w-full max-w-md p-6 rounded-lg shadow-lg bg-dark">
            <button
              className="absolute text-xl font-bold top-4 right-4 hover:text-primary"
              onClick={() => setIsConfirmationModalOpen(false)}
            >
              <X size={24} />
            </button>

            <h2 className="mb-4 text-2xl font-bold text-center">
              {actionType === 'cancel' ? t('orders_cancel_order') : t('orders_delete_order')}
            </h2>
            <p className="mb-6 text-center text-accent/80">
              {t('orders_confirm_action', { action: t(actionType === 'cancel' ? 'orders_cancel_order' : 'orders_delete_order') })}
            </p>

            <div className="flex justify-center gap-10">
              <button
                onClick={() => setIsConfirmationModalOpen(false)}
                className="px-8 py-2 transition border rounded-lg text-primary bg-secondary hover:bg-dark border-primary"
              >
                {t('orders_no_go_back')}
              </button>
              <button
                onClick={handleConfirmAction}
                className="px-8 py-2 transition border rounded-lg border-primary bg-primary hover:bg-red-600"
              >
                {t('orders_yes_action', { action: t(actionType === 'cancel' ? 'orders_cancel' : 'orders_delete') })}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default OrderPage;