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
    <div className="min-h-screen px-8 py-10 bg-black backdrop-blur-sm">
      {/* Page Heading */}
      <h1 className="mb-8 text-4xl font-bold text-center text-white">{t('orders_title')}</h1>
      <p className="px-4 mb-8 text-center text-gray-400">
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
          <div className="bg-white text-gray-900 border border-black/5 rounded-2xl p-8 shadow-xl text-center">
            <p className="text-xl font-bold text-gray-400">
              {t('orders_no_orders')}
            </p>
          </div>
        ) : (
          orders.map((order) => (
            <div key={order._id} className="bg-white text-gray-900 border border-black/5 rounded-2xl p-6 shadow-xl mb-6 hover:shadow-2xl transition-shadow duration-300">
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-gray-100">
                <div>
                  <h2 className="font-bold text-green-600 tracking-tight font-sans">{t('orders_order_number', { number: order._id.slice(-5).toUpperCase() })}</h2>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t('orders_placed_on', { date: formatDate(order.createdAt) })}</p>
                </div>
                <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm ${
                  order.status === 'Pending' ? 'bg-yellow-500 text-white' :
                  order.status === 'Processing' ? 'bg-blue-500 text-white' :
                  order.status === 'Shipped' ? 'bg-green-500 text-white' :
                  order.status === 'Delivered' ? 'bg-purple-500 text-white' : 'bg-red-500 text-white'
                }`}>
                  {t(`orders_status_${order.status.toLowerCase()}`, { defaultValue: order.status })}
                </span>
              </div>

              {order.orderItems.map((item, index) => {
                const rawImage = (Array.isArray(item.product?.images) && item.product.images[0]) || item.product?.image || '';
                const resolvedSrc = resolveImageUrl(String(rawImage)) || buildPlaceholder(120,120);
                return (
                <div key={index} className="flex gap-6 ">
                  <div className="flex justify-center items-center bg-gray-50 border border-gray-100 w-[150px] h-[150px] p-2 rounded-lg">
                    <img
                      src={resolvedSrc}
                      alt={item.product?.name || 'product'}
                      className="w-[120px] h-[120px] object-contain"
                      onError={(e)=>{e.currentTarget.onerror=null;e.currentTarget.src=buildPlaceholder(120,120);}}
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="mb-2 text-lg font-bold text-gray-900 group-hover:text-green-600 transition-colors font-sans">{item.product.name}</h3>
                    <p className="mb-1 text-sm font-medium text-gray-500 uppercase tracking-wide">{t('orders_quantity', { quantity: item.quantity })}</p>
                    <p className="mb-4 font-bold text-md text-gray-700">
                      {t('orders_price_x_quantity', { price: item.price, quantity: item.quantity })}
                    </p>
                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-50">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Total Commande</span>
                        <p className="text-2xl font-black text-green-600 font-sans">{t('orders_total', { total: order.totalAmount })}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => openOrderDetails(order)}
                          className="px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-white transition bg-blue-600 rounded-xl hover:bg-blue-700 shadow-md hover:shadow-blue-500/20"
                        >
                          {t('orders_view_details')}
                        </button>
                        {/* Show Cancel or Delete button based on order status */}
                        {order.status === 'Pending' || order.status === 'Processing' ? (
                          <button
                            onClick={() => openConfirmationModal(order, 'cancel')}
                            className="px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-white transition bg-green-600 rounded-xl hover:bg-green-700 shadow-md hover:shadow-green-500/20"
                          >
                            {t('orders_cancel_order')}
                          </button>
                        ) : order.status === 'Cancelled' && (
                          <button
                            onClick={() => openConfirmationModal(order, 'delete')}
                            className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-white bg-green-600 rounded-xl hover:bg-green-700 shadow-md hover:shadow-green-500/20"
                          >
                            <Trash size={14} /> {t('orders_delete')}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md px-4">
          <div className="relative w-full max-w-lg p-8 rounded-3xl shadow-2xl bg-white text-gray-900 border border-black/5">
            <button
              className="absolute text-xl font-bold top-6 right-6 text-gray-400 hover:text-green-600 transition-colors"
              onClick={() => setIsModalOpen(false)}
            >
              <X size={24} />
            </button>

            <h2 className="mb-6 text-3xl font-black text-gray-900 tracking-tight font-sans">{t('orders_details_title')}</h2>
            
            {/* Shipping Information */}
            <div className="bg-gray-50 p-6 rounded-2xl mb-6 border border-gray-100">
              <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-green-600">{t('orders_shipping_details')}</h3>
              <p className="text-sm font-bold text-gray-900">{selectedOrder.shippingAddress.fullName}</p>
              <p className="text-xs font-medium text-gray-500 mb-2">{selectedOrder.shippingAddress.email}</p>
              <p className="text-sm text-gray-700 leading-relaxed">{selectedOrder.shippingAddress.address}</p>
              <p className="text-xs font-bold text-gray-500 mt-2">{selectedOrder.shippingAddress.phoneNumber}</p>
            </div>

            {/* Order Items */}
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
              <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-green-600">{t('orders_products')}</h3>
              <div className="max-h-[30vh] overflow-y-auto pr-2 custom-scrollbar">
                {selectedOrder.orderItems.map((item, index) => {
                  const rawImage = (Array.isArray(item.product?.images) && item.product.images[0]) || item.product?.image || '';
                  const resolvedSrc = resolveImageUrl(String(rawImage)) || buildPlaceholder(80,80);
                  return (
                  <div key={index} className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-100 last:border-0 last:mb-0 last:pb-0">
                    <img
                      src={resolvedSrc}
                      alt={item.product?.name || 'product'}
                      className="object-contain w-16 h-16 bg-white rounded-xl p-1 border border-gray-200"
                      onError={(e)=>{e.currentTarget.onerror=null;e.currentTarget.src=buildPlaceholder(80,80);}}
                    />
                    <div className="min-w-0">
                      <h4 className="font-bold text-gray-900 text-sm truncate">{item.product.name}</h4>
                      <div className="flex gap-3 items-center mt-1">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Qté: {item.quantity}</span>
                        <span className="text-[10px] font-bold text-green-600">{item.price.toFixed(2)} TD</span>
                      </div>
                    </div>
                  </div>
                )})}
              </div>
              <div className="pt-6 border-t border-gray-200 mt-6 flex items-end justify-between">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Total Montant</span>
                  <p className="text-3xl font-black text-green-600 font-sans">{selectedOrder.totalAmount.toFixed(2)} TD</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Paiement</p>
                  <p className="text-xs font-bold text-gray-700">{selectedOrder.paymentMethod}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {isConfirmationModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md px-4">
          <div className="relative w-full max-w-md p-8 rounded-3xl shadow-2xl bg-white text-gray-900 border border-black/5 text-center">
            <button
              className="absolute text-xl font-bold top-6 right-6 text-gray-400 hover:text-red-600 transition-colors"
              onClick={() => setIsConfirmationModalOpen(false)}
            >
              <X size={24} />
            </button>

            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Trash className="w-8 h-8 text-red-500" />
            </div>

            <h2 className="mb-4 text-2xl font-black text-gray-900 tracking-tight font-sans">
              {actionType === 'cancel' ? t('orders_cancel_order') : t('orders_delete_order')}
            </h2>
            <p className="mb-8 text-gray-500 font-medium">
              {t('orders_confirm_action', { action: t(actionType === 'cancel' ? 'orders_cancel_order' : 'orders_delete_order') })}
            </p>

            <div className="flex gap-4">
              <button
                onClick={() => setIsConfirmationModalOpen(false)}
                className="flex-1 px-6 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-all"
              >
                {t('orders_no_go_back')}
              </button>
              <button
                onClick={handleConfirmAction}
                className="flex-1 px-6 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-all shadow-lg shadow-red-600/20"
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