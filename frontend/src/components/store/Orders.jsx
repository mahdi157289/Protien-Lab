import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../config/api";
import { X, Loader, Trash } from "lucide-react";

function OrderPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [actionType, setActionType] = useState(null); // 'cancel' or 'delete'
  const navigate = useNavigate();

  // Fetch user orders from backend
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await api.get('/users/orders');
        setOrders(response.data);
        setLoading(false);
      } catch (error) {
        setError(error.response?.data?.message || 'Failed to fetch orders');
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

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
      setError(error.response?.data?.message || `Failed to ${actionType} order`);
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
      <div className="flex items-center justify-center h-screen text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen px-8 py-10 bg-secondary">
      {/* Page Heading */}
      <h1 className="mb-8 text-4xl font-bold text-center text-white">Your Orders</h1>
      <p className="px-4 mb-8 text-center text-accent/80">
        Track and manage your recent orders with ease. View detailed information about each purchase, including product details, order status, and delivery updates. <br/>Thank you for choosing us!
      </p>

      {/* Navigation Buttons */}
      <div className="flex flex-col justify-center gap-8 mb-8 sm:flex-row sm:gap-16">
        <button
          className="w-full sm:w-[288px] h-[60px] border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white font-bold rounded-[50px] transition duration-200"
          onClick={() => navigate("/store/products")}
        >
          Products
        </button>
        <button 
          className="w-full sm:w-[288px] h-[60px] bg-red-500 hover:bg-red-600 text-white font-bold border-2 border-white rounded-[50px] transition duration-200"
          onClick={() => navigate("/store/orders")}
        >
          Orders
        </button>
      </div>

      {/* Orders List */}
      <div className="max-w-4xl mx-auto">
        {orders.length === 0 ? (
          <div className="bg-[#1C1C1C] text-white rounded-lg p-6 shadow-lg text-center">
            <p className="text-xl font-semibold text-gray-400">
              No orders found
            </p>
          </div>
        ) : (
          orders.map((order) => (
            <div key={order._id} className="bg-[#1C1C1C] text-white rounded-lg p-6 shadow-lg mb-4">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-600">
                <div>
                  <h2 className="font-bold text-red-500">Order #{order._id.slice(-5).toUpperCase()}</h2>
                  <p className="text-sm text-gray-400">Placed on: {formatDate(order.createdAt)}</p>
                </div>
                <span className={`px-2 py-1 rounded-lg text-sm ${
                  order.status === 'Pending' ? 'bg-yellow-500' :
                  order.status === 'Processing' ? 'bg-blue-500' :
                  order.status === 'Shipped' ? 'bg-green-500' :
                  order.status === 'Delivered' ? 'bg-purple-500' : 'bg-red-500'
                }`}>
                  {order.status}
                </span>
              </div>

              {order.orderItems.map((item, index) => (
                <div key={index} className="flex gap-6 ">
                  <div className="flex justify-center items-center bg-[#29292A] w-[150px] h-[150px] p-2 rounded-lg">
                    <img
                      src={`${import.meta.env.VITE_IMAGE_URL}/${item.product.image}`}
                      alt={item.product.name}
                      className="w-[120px] h-[120px] object-contain"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="mb-2 text-lg font-bold">{item.product.name}</h3>
                    <p className="mb-1 text-sm">Quantity: {item.quantity}</p>
                    <p className="mb-1 font-medium text-md">
                      Rs. {item.price} x {item.quantity}
                    </p>
                    <div className="flex items-center justify-between mt-4">
                    <p className="text-xl font-bold text-primary">Total: Rs. {order.totalAmount}</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => openOrderDetails(order)}
                          className="px-4 py-2 text-white transition bg-blue-500 rounded-md hover:bg-blue-600"
                        >
                          View Details
                        </button>
                        {/* Show Cancel or Delete button based on order status */}
                        {order.status === 'Pending' || order.status === 'Processing' ? (
                          <button
                            onClick={() => openConfirmationModal(order, 'cancel')}
                            className="px-4 py-2 text-white transition bg-red-500 rounded-md hover:bg-red-600"
                          >
                            Cancel Order
                          </button>
                        ) : order.status === 'Cancelled' && (
                          <button
                            onClick={() => openConfirmationModal(order, 'delete')}
                            className="flex items-center gap-2 px-4 py-2 text-white bg-red-500 rounded-md hover:bg-red-600"
                          >
                            <Trash size={16} /> Delete
                          </button>
                        )}
                    </div>
                  </div>
                  </div>
                </div>
              ))}
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

            <h2 className="mb-4 text-2xl font-bold">Order Details</h2>
            
            {/* Shipping Information */}
            <div className="bg-[#29292A] p-4 rounded-lg mb-6">
              <h3 className="mb-2 text-lg font-bold">Shipping Details</h3>
              <p>Name: {selectedOrder.shippingAddress.fullName}</p>
              <p>Email: {selectedOrder.shippingAddress.email}</p>
              <p>Address: {selectedOrder.shippingAddress.address}</p>
              <p>Phone: {selectedOrder.shippingAddress.phoneNumber}</p>
            </div>

            {/* Order Items */}
            <div className="bg-[#29292A] p-4 rounded-lg">
              <h3 className="mb-2 text-lg font-bold">Products</h3>
              {selectedOrder.orderItems.map((item, index) => (
                <div key={index} className="flex items-center gap-4 mb-4">
                  <img
                    src={`${import.meta.env.VITE_IMAGE_URL}/${item.product.image}`}
                    alt={item.product.name}
                    className="object-contain w-20 h-20"
                  />
                  <div>
                    <h4 className="font-bold">{item.product.name}</h4>
                    <p>Quantity: {item.quantity}</p>
                    <p>Price: Rs. {item.price} each</p>
                  </div>
                </div>
              ))}
              <div className="pt-4 border-t border-gray-600">
                <p className="text-lg font-bold">Total: Rs. {selectedOrder.totalAmount}</p>
                <p className="text-sm text-gray-400">Payment Method: {selectedOrder.paymentMethod}</p>
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
              {actionType === 'cancel' ? 'Cancel Order' : 'Delete Order'}
            </h2>
            <p className="mb-6 text-center text-accent/80">
              Are you sure you want to {actionType} this order?
            </p>

            <div className="flex justify-center gap-10">
              <button
                onClick={() => setIsConfirmationModalOpen(false)}
                className="px-8 py-2 transition border rounded-lg text-primary bg-secondary hover:bg-dark border-primary"
              >
                No, Go Back
              </button>
              <button
                onClick={handleConfirmAction}
                className="px-8 py-2 transition border rounded-lg border-primary bg-primary hover:bg-red-600"
              >
                Yes, {actionType === 'cancel' ? 'Cancel' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default OrderPage;