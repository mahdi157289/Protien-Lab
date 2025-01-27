import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import {BarChart,Bar,LineChart,Line,XAxis,YAxis,CartesianGrid,Tooltip,Legend,ResponsiveContainer} from 'recharts';

const AdminDashboard = () => {
  const { token } = useAdminAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [counts, setCounts] = useState({
    users: 0,
    orders: 0,
    posts: 0,
    products: 0,
    exercises: 0,
    dietPlans: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [postAnalytics, setPostAnalytics] = useState({
    postsPerDay: [],
    topPosters: [],
    totalLikes: 0
  });
  const [userStats, setUserStats] = useState([]);
  const [orderStats, setOrderStats] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!token) return;
      
      setLoading(true);
      try {
        const headers = { Authorization: `Bearer ${token}` };
        
        // Fetch all data in parallel
        const [
          users, 
          ordersRes, 
          postsRes, 
          products, 
          exercises, 
          dietPlans,
          postAnalyticsRes
        ] = await Promise.all([
          axios.get('http://localhost:5000/api/admin/users', { headers }),
          axios.get('http://localhost:5000/api/admin/orders', { headers }),
          axios.get('http://localhost:5000/api/admin/posts', { headers }),
          axios.get('http://localhost:5000/api/admin/products', { headers }),
          axios.get('http://localhost:5000/api/admin/exercises', { headers }),
          axios.get('http://localhost:5000/api/admin/diet-plans', { headers }),
          axios.get('http://localhost:5000/api/admin/posts/analytics', { headers })
        ]);

        // Set counts
        setCounts({
          users: users.data.length,
          orders: ordersRes.data.totalOrders || 0,
          posts: postsRes.data.totalPosts || 0,
          products: products.data.totalProducts || 0,
          exercises: exercises.data.length,
          dietPlans: dietPlans.data.count || 0
        });

        // Set recent orders
        setRecentOrders(ordersRes.data.orders?.slice(0, 5) || []);

        // Process post analytics
        const analytics = postAnalyticsRes.data;
        setPostAnalytics({
          postsPerDay: analytics.postsPerDay || [],
          topPosters: analytics.topPosters || [],
          totalLikes: analytics.totalLikes || 0
        });

        // Process order statistics
        const processedOrders = ordersRes.data.orders.reduce((acc, order) => {
          const date = new Date(order.createdAt).toLocaleDateString();
          acc[date] = (acc[date] || 0) + 1;
          return acc;
        }, {});

        const orderStatsData = Object.entries(processedOrders)
          .map(([date, count]) => ({
            date,
            orders: count
          }));

        setOrderStats(orderStatsData);

        // Process user statistics
        const processedUsers = users.data.reduce((acc, user) => {
          const date = new Date(user.createdAt).toLocaleDateString();
          acc[date] = (acc[date] || 0) + 1;
          return acc;
        }, {});

        const userStatsData = Object.entries(processedUsers)
          .map(([date, count]) => ({
            date,
            users: count
          }));

        setUserStats(userStatsData);

      } catch (err) {
        console.error('Error fetching data:', err);
        if (err.response) {
          console.error('Response data:', err.response.data);
          console.error('Response status:', err.response.status);
        }
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-secondary">
        <div className="text-xl text-accent">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-secondary">
        <div className="text-xl text-primary">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-6 mx-auto bg-secondary max-w-7xl">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 mb-8 sm:grid-cols-2 lg:grid-cols-3">
        <StatBox title="Total Users" value={counts.users} color="primary" />
        <StatBox title="Total Orders" value={counts.orders} color="primary" />
        <StatBox title="Total Products" value={counts.products} color="primary" />
        <StatBox title="Total Posts" value={counts.posts} color="primary" />
        <StatBox title="Total Exercises" value={counts.exercises} color="primary" />
        <StatBox title="Total Diet Plans" value={counts.dietPlans} color="primary" />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-6 mb-8 lg:grid-cols-2">
        {/* User Growth Chart */}
        <div className="p-4 rounded-lg bg-dark">
          <h3 className="mb-4 text-lg text-accent">User Growth</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={userStats}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="date" stroke="#FFFCF9" />
              <YAxis stroke="#FFFCF9" />
              <Tooltip contentStyle={{ backgroundColor: '#29292A', border: 'none' }} />
              <Legend />
              <Line type="monotone" dataKey="users" stroke="#EE4540" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Order Trends Chart */}
        <div className="p-4 rounded-lg bg-dark">
          <h3 className="mb-4 text-lg text-accent">Order Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={orderStats}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="date" stroke="#FFFCF9" />
              <YAxis stroke="#FFFCF9" />
              <Tooltip contentStyle={{ backgroundColor: '#29292A', border: 'none' }} />
              <Legend />
              <Bar dataKey="orders" fill="#EE4540" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Post Analytics */}
        <div className="p-4 rounded-lg bg-dark">
          <h3 className="mb-4 text-lg text-accent">Post Analytics</h3>
          <div className="mb-4">
            <h4 className="mb-2 text-gray-400">Posts per Day</h4>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={postAnalytics.postsPerDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis dataKey="_id" stroke="#FFFCF9" />
                <YAxis stroke="#FFFCF9" />
                <Tooltip contentStyle={{ backgroundColor: '#29292A', border: 'none' }} />
                <Line type="monotone" dataKey="count" stroke="#EE4540" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div>
            <h4 className="mb-2 text-gray-400">Top Posters</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-accent">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="px-4 py-2 text-left">User</th>
                    <th className="px-4 py-2 text-right">Posts</th>
                  </tr>
                </thead>
                <tbody>
                  {postAnalytics.topPosters.map((poster) => (
                    <tr key={poster._id} className="border-b border-gray-700">
                      <td className="px-4 py-2">{poster.firstName} {poster.lastName}</td>
                      <td className="px-4 py-2 text-right">{poster.postCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Recent Orders Table */}
        <div className="p-4 rounded-lg bg-dark">
          <h3 className="mb-4 text-lg text-accent">Recent Orders</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-accent">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="px-4 py-2 text-left">Order ID</th>
                  <th className="px-4 py-2 text-left">Customer</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order._id} className="border-b border-gray-700">
                    <td className="px-4 py-2">{order._id.slice(-6)}</td>
                    <td className="px-4 py-2">{order.user?.email || 'N/A'}</td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 rounded ${
                        order.status === 'Delivered' ? 'bg-green-600' :
                        order.status === 'Processing' ? 'bg-yellow-600' :
                        'bg-red-600'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-right">
                      ${order.totalAmount?.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatBox = ({ title, value, color }) => (
  <div className="p-6 border-l-4 rounded-lg bg-dark" style={{ borderColor: color }}>
    <h3 className="text-lg text-accent">{title}</h3>
    <p className="text-2xl font-bold text-accent">{value}</p>
  </div>
);

export default AdminDashboard;