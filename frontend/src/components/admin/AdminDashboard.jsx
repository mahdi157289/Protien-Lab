import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import {BarChart,Bar,LineChart,Line,XAxis,YAxis,CartesianGrid,Tooltip,Legend,ResponsiveContainer} from 'recharts';
import {Users,ShoppingCart,Box,FileText,Dumbbell,Utensils,Activity,ClipboardList,Package} from 'lucide-react';
import PropTypes from 'prop-types';

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

        setCounts({
          users: users.data.length,
          orders: ordersRes.data.totalOrders || 0,
          posts: postsRes.data.totalPosts || 0,
          products: products.data.totalProducts || 0,
          exercises: exercises.data.length,
          dietPlans: dietPlans.data.count || 0
        });

        setRecentOrders(ordersRes.data.orders?.slice(0, 5) || []);

        const analytics = postAnalyticsRes.data;
        setPostAnalytics({
          postsPerDay: analytics.postsPerDay || [],
          topPosters: analytics.topPosters || [],
          totalLikes: analytics.totalLikes || 0
        });

        const processedOrders = ordersRes.data.orders.reduce((acc, order) => {
          const date = new Date(order.createdAt).toLocaleDateString();
          acc[date] = (acc[date] || 0) + 1;
          return acc;
        }, {});

        const orderStatsData = Object.entries(processedOrders)
          .map(([date, count]) => ({ date, orders: count }));
        setOrderStats(orderStatsData);

        const processedUsers = users.data.reduce((acc, user) => {
          const date = new Date(user.createdAt).toLocaleDateString();
          acc[date] = (acc[date] || 0) + 1;
          return acc;
        }, {});

        const userStatsData = Object.entries(processedUsers)
          .map(([date, count]) => ({ date, users: count }));
        setUserStats(userStatsData);

      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [token]);

  const StatBox = ({ title, value }) => {
    const getIcon = () => {
      switch(title) {
        case 'Total Users': return <Users className="w-5 h-5" />;
        case 'Total Orders': return <ShoppingCart className="w-5 h-5" />;
        case 'Total Products': return <Box className="w-5 h-5" />;
        case 'Total Posts': return <FileText className="w-5 h-5" />;
        case 'Total Exercises': return <Dumbbell className="w-5 h-5" />;
        case 'Total Diet Plans': return <Utensils className="w-5 h-5" />;
        default: return null;
      }
    };

    return (
      <div className="p-4 transition-all duration-200 border rounded-lg border-dark bg-dark hover:bg-dark/80 hover:border-primary/50">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-md bg-primary/10 text-primary">
            {getIcon()}
          </div>
          <p className="text-sm font-medium text-accent/70">{title}</p>
        </div>
        <p className="pl-1 text-2xl font-semibold text-center text-accent">
          {value.toLocaleString()}
        </p>
      </div>
    );
  };

  StatBox.propTypes = {
    title: PropTypes.string.isRequired, // Ensure title is a string and is required
    value: PropTypes.number.isRequired, // Ensure value is a number and is required
  };

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
    <div className="min-h-screen p-8 bg-secondary">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-8 text-3xl font-bold text-accent">Admin Dashboard</h1>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-6 mb-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <StatBox title="Total Users" value={counts.users} />
          <StatBox title="Total Orders" value={counts.orders} />
          <StatBox title="Total Products" value={counts.products} />
          <StatBox title="Total Posts" value={counts.posts} />
          <StatBox title="Total Exercises" value={counts.exercises} />
          <StatBox title="Total Diet Plans" value={counts.dietPlans} />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 gap-6 mb-8 lg:grid-cols-2">
          {/* User Growth Chart */}
          <div className="p-6 rounded-xl bg-dark">
            <div className="flex items-center gap-3 mb-6">
              <Activity className="w-6 h-6 text-primary" />
              <h3 className="text-xl font-semibold text-accent">User Growth</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={userStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2D2D2D" />
                <XAxis dataKey="date" stroke="#A3A3A3" />
                <YAxis stroke="#A3A3A3" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1C1C1C',
                    border: 'none',
                    borderRadius: '8px'
                  }} 
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="users" 
                  stroke="#EE4540" 
                  strokeWidth={2}
                  dot={{ fill: '#EE4540', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Order Trends Chart */}
          <div className="p-6 rounded-xl bg-dark">
            <div className="flex items-center gap-3 mb-6">
              <Package className="w-6 h-6 text-primary" />
              <h3 className="text-xl font-semibold text-accent">Order Trends</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={orderStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2D2D2D" />
                <XAxis dataKey="date" stroke="#A3A3A3" />
                <YAxis stroke="#A3A3A3" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1C1C1C',
                    border: 'none',
                    borderRadius: '8px'
                  }} 
                />
                <Legend />
                <Bar 
                  dataKey="orders" 
                  fill="#EE4540" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Post Analytics */}
          <div className="p-6 rounded-xl bg-dark">
            <div className="flex items-center gap-3 mb-6">
              <ClipboardList className="w-6 h-6 text-primary" />
              <h3 className="text-xl font-semibold text-accent">Post Analytics</h3>
            </div>
            <div className="mb-8">
              <h4 className="mb-4 text-lg font-medium text-accent/80">Posts per Day</h4>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={postAnalytics.postsPerDay}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2D2D2D" />
                  <XAxis dataKey="_id" stroke="#A3A3A3" />
                  <YAxis stroke="#A3A3A3" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1C1C1C',
                      border: 'none',
                      borderRadius: '8px'
                    }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#EE4540" 
                    strokeWidth={2}
                    dot={{ fill: '#EE4540', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div>
              <h4 className="mb-4 text-lg font-medium text-accent/80">Top Posters</h4>
              <div className="overflow-x-auto border border-gray-700 rounded-lg">
                <table className="w-full">
                  <thead className="bg-secondary">
                    <tr>
                      <th className="px-4 py-3 font-medium text-left text-accent/80">User</th>
                      <th className="px-4 py-3 font-medium text-right text-accent/80">Posts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {postAnalytics.topPosters.map((poster) => (
                      <tr key={poster._id} className="border-t border-gray-700">
                        <td className="px-4 py-3 text-accent/80">{poster.firstName} {poster.lastName}</td>
                        <td className="px-4 py-3 text-right text-accent/80">{poster.postCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Recent Orders Table */}
          <div className="p-6 rounded-xl bg-dark">
            <div className="flex items-center gap-3 mb-6">
              <ShoppingCart className="w-6 h-6 text-primary" />
              <h3 className="text-xl font-semibold text-accent">Recent Orders</h3>
            </div>
            <div className="overflow-x-auto border border-gray-700 rounded-lg">
              <table className="w-full">
                <thead className="bg-secondary">
                  <tr>
                    <th className="px-4 py-3 font-medium text-left text-accent/80">Order ID</th>
                    <th className="px-4 py-3 font-medium text-left text-accent/80">Customer</th>
                    <th className="px-4 py-3 font-medium text-left text-accent/80">Status</th>
                    <th className="px-4 py-3 font-medium text-right text-accent/80">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order._id} className="border-t border-gray-700">
                      <td className="px-4 py-3 text-accent/80">{order._id.slice(-6)}</td>
                      <td className="px-4 py-3 text-accent/80">{order.user?.email || 'N/A'}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                          order.status === 'Processing' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-accent/80">
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
    </div>
  );
};

export default AdminDashboard;