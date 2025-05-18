import { useState, useEffect } from 'react';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader, X, CheckCircle, Search, Eye } from 'lucide-react';

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
        <Loader className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-6 mx-auto bg-secondary text-accent max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Order Management</h1>
        <button
          onClick={() => navigate('/admin/store/products')}
          className="flex items-center px-4 py-3 rounded-lg bg-primary text-accent hover:bg-green-600"
        >
          <ArrowLeft className='mr-2 size-5' /> Go to Products
        </button>
      </div>

      {/* Filters */}
      <div className="p-4 mb-6 rounded-lg shadow-lg bg-dark">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {/* Search Input */}
          <div className="relative">
            <input
              type="text"
              name="search"
              placeholder="Search Orders"
              value={filters.search}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 border rounded-lg bg-secondary placeholder-accent/80 text-accent border-accent/50 focus:outline-none focus:border-accent"
            />
            <Search className="absolute right-3 top-3 text-accent/80" size={20} />
          </div>

          {/* Status Dropdown */}
          <select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            className="w-full px-4 py-2 border rounded-lg bg-secondary placeholder-accent/80 text-accent border-accent/50 focus:outline-none focus:border-accent"
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
            className="w-full px-4 py-2 border rounded-lg bg-secondary placeholder-accent/80 text-accent border-accent/50 focus:outline-none focus:border-accent
                      [&::-webkit-calendar-picker-indicator]:invert-[0.5]
                      [&::-webkit-calendar-picker-indicator]:brightness-125"
          />

          {/* End Date Input */}
          <input
            type="date"
            name="endDate"
            value={filters.endDate}
            onChange={handleFilterChange}
            className="w-full px-4 py-2 border rounded-lg bg-secondary placeholder-accent/80 text-accent border-accent/50 focus:outline-none focus:border-accent
                      [&::-webkit-calendar-picker-indicator]:invert-[0.5]
                      [&::-webkit-calendar-picker-indicator]:brightness-125"
          />

          {/* Search Button */}
          <button
            onClick={applyFilters}
            className="flex items-center justify-center w-full px-2 py-2 transition-all rounded-md bg-primary text-accent hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            Search
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
                <td className="p-3">Rs. {order.totalAmount}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded-lg text-sm ${order.status === 'Pending' ? 'bg-yellow-500' : order.status === 'Processing' ? 'bg-blue-500' : order.status === 'Shipped' ? 'bg-green-500' : order.status === 'Delivered' ? 'bg-purple-500' : 'bg-red-500'}`}>
                    {order.status}
                  </span>
                </td>
                <td className="flex gap-2 p-3">
                  <button
                    onClick={() => openViewModal(order)}
                    className="flex items-center gap-1 px-3 py-1 transition bg-blue-500 rounded-md text-accent hover:bg-blue-600"
                  >
                    <Eye size={16} /> View
                  </button>
                  {order.status !== 'Cancelled' && order.status !== 'Delivered' && (
                    <button
                      onClick={() => openStatusModal(order)}
                      className="flex items-center gap-1 px-3 py-1 transition bg-green-500 rounded-md text-accent hover:bg-green-600"
                    >
                      <CheckCircle size={16} /> Update
                    </button>
                  )}
                  {order.status === 'Cancelled' && (
                    <button
                      disabled
                      className="flex items-center gap-1 px-3 py-1 bg-gray-500 rounded-md opacity-50 cursor-not-allowed text-accent"
                    >
                      <X size={16} /> Cannot Update
                    </button>
                  )}
                  {order.status !== 'Cancelled' && order.status !== 'Delivered' && (
                    <button
                      onClick={() => openCancelModal(order)}
                      className="flex items-center gap-1 px-3 py-1 transition bg-green-500 rounded-md text-accent hover:bg-green-600"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80">
          <div className="w-full max-w-md p-6 rounded-lg shadow-lg bg-dark text-accent">
            <div className="flex justify-end">
              <button onClick={() => setIsStatusModalOpen(false)} className="text-accent hover:bg-green-600">
                <X size={24} />
              </button>
            </div>
            <h2 className="mb-4 text-2xl font-bold">Update Order Status</h2>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full p-2 mb-4 rounded-md bg-secondary text-accent"
            >
              <option value="Pending">Pending</option>
              <option value="Processing">Processing</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
            </select>
            <button
              onClick={updateOrderStatus}
              className="px-4 py-2 bg-green-500 rounded-md text-accent hover:bg-green-600"
            >
              Update Status
            </button>
          </div>
        </div>
      )}

      {/* Cancel Order Modal */}
      {isCancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80">
          <div className="w-full max-w-md p-6 rounded-lg shadow-lg bg-dark text-accent">
            <h2 className="mb-4 text-2xl font-bold text-center">Cancel Order</h2>
            <p className="mb-6 text-center">Are you sure you want to cancel this order?</p>
            <div className="flex justify-center gap-10">
              <button
                onClick={() => setIsCancelModalOpen(false)}
                className="px-8 py-2 transition border rounded-lg text-primary bg-secondary hover:bg-dark border-primary"
              >
                Cancel
              </button>
              <button
                onClick={cancelOrder}
                className="px-8 py-2 transition border rounded-lg border-primary bg-primary hover:bg-green-600"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Order Details Modal */}
      {isViewModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-80">
          <div className="w-full max-w-4xl overflow-hidden shadow-2xl bg-dark rounded-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 ">
              <h2 className="text-3xl font-bold text-primary">Order #{selectedOrder._id?.slice(-6)}</h2>
              <button 
                onClick={() => setIsViewModalOpen(false)} 
                className="transition-colors duration-300 text-accent hover:bg-green-600"
              >
                <X size={28} strokeWidth={2} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2">
              {/* User Details Section */}
              <div>
                <div className="p-6 space-y-4 bg-secondary rounded-xl">
                  <h3 className="pb-2 text-xl font-semibold text-accent">
                    Customer Information
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-accent opacity-70">Name</span>
                      <span className="font-medium text-accent">
                        {selectedOrder.user?.firstName} {selectedOrder.user?.lastName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-accent opacity-70">Email</span>
                      <span className="font-medium text-accent">
                        {selectedOrder.user?.email}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-accent opacity-70">Phone</span>
                      <span className="font-medium text-accent">
                        {selectedOrder.shippingAddress?.phoneNumber}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-accent opacity-70">Address</span>
                      <span className="font-medium text-right text-accent">
                        {selectedOrder.shippingAddress?.address}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Product Details Section */}
              <div className="space-y-2">
                <div className="p-6 space-y-2 bg-secondary rounded-xl">
                  <h3 className="pb-2 text-xl font-semibold text-accent">
                    Order Items
                  </h3>
                  <div className="space-y-2">
                    {selectedOrder.orderItems.map((item, index) => (
                      <div 
                        key={index} 
                        className="flex items-center justify-between pb-0 last:pb-0"
                      >
                        <div>
                          <p className="font-medium text-accent">{item.product?.name}</p>
                          <p className="text-accent opacity-70">Qty: {item.quantity}</p>
                        </div>
                        <span className="font-semibold text-accent">
                          Rs. {item.price} x {item.quantity}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className='p-6 bg-secondary rounded-xl'>
                  <span className="font-medium text-md text-primary">
                    Total Amount: Rs. {selectedOrder.totalAmount}
                  </span>
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