import { useState, useEffect } from 'react';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader, X, RefreshCw, Search, Eye } from 'lucide-react';

const AdminOrderManagement = () => {
  const { token } = useAdminAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    startDate: '',
    endDate: '',
    userId: '',
    productId: '',
    minAmount: '',
    maxAmount: '',
    search: '',
  });
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const navigate = useNavigate();

  // Fetch orders based on filters
  useEffect(() => {
    fetchOrders();
  }, [filters]);

  const fetchOrders = async () => {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const response = await axios.get(`${import.meta.env.VITE_API_URL}/admin/orders?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(response.data.orders);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      setLoading(false);
    }
  };

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  // Apply filters
  const applyFilters = () => {
    fetchOrders();
  };

  // Open status update modal
  const openStatusModal = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setIsStatusModalOpen(true);
  };

  // Open cancel order modal
  const openCancelModal = (order) => {
    setSelectedOrder(order);
    setIsCancelModalOpen(true);
  };

  // Open view order details modal
  const openViewModal = (order) => {
    setSelectedOrder(order);
    setIsViewModalOpen(true);
  };

  // Update order status
  const updateOrderStatus = async () => {
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/admin/orders/${selectedOrder._id}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOrders(orders.map((order) => (order._id === selectedOrder._id ? response.data : order)));
      setIsStatusModalOpen(false);
    } catch (error) {
      console.error('Failed to update order status:', error);
    }
  };

  // Cancel order
  const cancelOrder = async () => {
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/admin/orders/${selectedOrder._id}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOrders(orders.map((order) => (order._id === selectedOrder._id ? response.data : order)));
      setIsCancelModalOpen(false);
    } catch (error) {
      console.error('Failed to cancel order:', error);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="animate-spin" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-6 mx-auto bg-secondary text-accent max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Order Management</h1>
        <button
          onClick={() => navigate('/admin/store/products')}
          className="flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-accent"
        >
          <ArrowLeft size={20} /> Go to Products
        </button>
      </div>

      {/* Filters */}
      <div className="p-6 mb-6 rounded-lg shadow-lg bg-dark">
        <h3 className="mb-4 text-xl font-semibold text-accent">Filter Orders</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {/* Search Input */}
          <div className="relative">
            <input
              type="text"
              name="search"
              placeholder="Search Orders"
              value={filters.search}
              onChange={handleFilterChange}
              className="w-full px-2 py-2 placeholder-gray-400 rounded-md bg-secondary text-accent focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <Search className="absolute right-3 top-3.5 text-gray-400" size={20} />
          </div>

          {/* Status Dropdown */}
          <select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            className="w-full px-2 py-1 rounded-md bg-secondary text-accent focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Processing">Processing</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          {/* Start Date Input */}
          <input
            type="date"
            name="startDate"
            value={filters.startDate}
            onChange={handleFilterChange}
            className="w-full px-2 py-1 rounded-md bg-secondary text-accent focus:outline-none focus:ring-2 focus:ring-primary"
          />

          {/* End Date Input */}
          <input
            type="date"
            name="endDate"
            value={filters.endDate}
            onChange={handleFilterChange}
            className="w-full px-2 py-1 rounded-md bg-secondary text-accent focus:outline-none focus:ring-2 focus:ring-primary"
          />

          {/* Search Button */}
          <button
            onClick={applyFilters}
            className="flex items-center justify-center w-full gap-2 px-3 py-2 transition-all rounded-md bg-primary text-accent hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <Search size={20} /> Search
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="overflow-x-auto">
        <table className="w-full rounded-lg bg-dark">
          <thead>
            <tr className="border-b border-secondary">
              <th className="p-3 text-left">Order ID</th>
              <th className="p-3 text-left">User</th>
              <th className="p-3 text-left">Total Amount</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id} className="border-b border-secondary">
                <td className="p-3 truncate max-w-[200px]">{order._id}</td>
                <td className="p-3">{order.user?.firstName} {order.user?.lastName}</td>
                <td className="p-3">${order.totalAmount}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded-full text-sm ${order.status === 'Pending' ? 'bg-yellow-500' : order.status === 'Processing' ? 'bg-blue-500' : order.status === 'Shipped' ? 'bg-green-500' : order.status === 'Delivered' ? 'bg-purple-500' : 'bg-red-500'}`}>
                    {order.status}
                  </span>
                </td>
                <td className="flex gap-2 p-3">
                  <button
                    onClick={() => openViewModal(order)}
                    className="flex items-center gap-1 px-3 py-1 rounded-md bg-primary text-accent"
                  >
                    <Eye size={16} /> View
                  </button>
                  <button
                    onClick={() => openStatusModal(order)}
                    className="flex items-center gap-1 px-3 py-1 rounded-md bg-primary text-accent"
                  >
                    <RefreshCw size={16} /> Update
                  </button>
                  {order.status !== 'Cancelled' && order.status !== 'Delivered' && (
                    <button
                      onClick={() => openCancelModal(order)}
                      className="flex items-center gap-1 px-3 py-1 bg-red-500 rounded-md text-accent"
                    >
                      <X size={16} /> Cancel
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Update Status Modal */}
      {isStatusModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md p-6 rounded-lg shadow-lg bg-secondary text-accent">
            <div className="flex justify-end">
              <button onClick={() => setIsStatusModalOpen(false)} className="text-accent hover:text-primary">
                <X size={24} />
              </button>
            </div>
            <h2 className="mb-4 text-2xl font-bold">Update Order Status</h2>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full p-2 mb-4 rounded-md bg-dark text-accent"
            >
              <option value="Pending">Pending</option>
              <option value="Processing">Processing</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
            </select>
            <button
              onClick={updateOrderStatus}
              className="px-4 py-2 rounded-md bg-primary text-accent"
            >
              Update Status
            </button>
          </div>
        </div>
      )}

      {/* Cancel Order Modal */}
      {isCancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md p-6 rounded-lg shadow-lg bg-secondary text-accent">
            <h2 className="mb-4 text-2xl font-bold">Cancel Order</h2>
            <p className="mb-6">Are you sure you want to cancel this order?</p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setIsCancelModalOpen(false)}
                className="px-4 py-2 bg-gray-500 rounded-md text-accent hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={cancelOrder}
                className="px-4 py-2 bg-red-500 rounded-md text-accent hover:bg-red-600"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Order Details Modal */}
      {isViewModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-4xl p-6 rounded-lg shadow-lg bg-secondary text-accent">
            <div className="flex justify-end">
              <button onClick={() => setIsViewModalOpen(false)} className="text-accent hover:text-primary">
                <X size={24} />
              </button>
            </div>
            <h2 className="mb-4 text-2xl font-bold">Order Details</h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* User Details */}
              <div>
                <h3 className="mb-2 text-xl font-semibold">User Details</h3>
                <div className="p-4 rounded-lg bg-dark">
                  <p><strong>Name:</strong> {selectedOrder.user?.firstName} {selectedOrder.user?.lastName}</p>
                  <p><strong>Email:</strong> {selectedOrder.user?.email}</p>
                  <p><strong>Phone:</strong> {selectedOrder.shippingAddress?.phoneNumber}</p>
                  <p><strong>Address:</strong> {selectedOrder.shippingAddress?.address}</p>
                </div>
              </div>

              {/* Product Details */}
              <div>
                <h3 className="mb-2 text-xl font-semibold">Product Details</h3>
                <div className="p-4 rounded-lg bg-dark">
                  {selectedOrder.orderItems.map((item, index) => (
                    <div key={index} className="mb-4">
                      <p><strong>Product Name:</strong> {item.product?.name}</p>
                      <p><strong>Quantity:</strong> {item.quantity}</p>
                      <p><strong>Price:</strong> ${item.price}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrderManagement;