import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Users, ShoppingCart, Box, FileText, Dumbbell, Utensils, Activity, ClipboardList, Package } from 'lucide-react';
import PropTypes from 'prop-types';
import { Loader } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const AdminDashboard = () => {
  const { token } = useAdminAuth();
  const { t } = useTranslation();
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
          axios.get(`${import.meta.env.VITE_API_URL}/admin/users`, { headers }),
          axios.get(`${import.meta.env.VITE_API_URL}/admin/orders`, { headers }),
          axios.get(`${import.meta.env.VITE_API_URL}/admin/posts`, { headers }),
          axios.get(`${import.meta.env.VITE_API_URL}/admin/products`, { headers }),
          axios.get(`${import.meta.env.VITE_API_URL}/admin/exercises`, { headers }),
          axios.get(`${import.meta.env.VITE_API_URL}/admin/diet-plans`, { headers }),
          axios.get(`${import.meta.env.VITE_API_URL}/admin/posts/analytics`, { headers })
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
        setError(t('admin_dashboard_error'));
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [token, t]);

  const StatBox = ({ title, value }) => {
    const getIcon = () => {
      switch (title) {
        case t('admin_dashboard_total_users'): return <Users className="w-5 h-5" />;
        case t('admin_dashboard_total_orders'): return <ShoppingCart className="w-5 h-5" />;
        case t('admin_dashboard_total_products'): return <Box className="w-5 h-5" />;
        case t('admin_dashboard_total_posts'): return <FileText className="w-5 h-5" />;
        case t('admin_dashboard_total_exercises'): return <Dumbbell className="w-5 h-5" />;
        case t('admin_dashboard_total_diet_plans'): return <Utensils className="w-5 h-5" />;
        default: return null;
      }
    };

    return (
      <div className="p-4 transition-all duration-200 border rounded-lg border-dark bg-dark hover:bg-dark/80 hover:border-primary/50">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-md bg-primary/10 text-primary">
            {getIcon()}
          </div>
          <p className="text-sm font-medium text-accent/70 font-source-sans">{title}</p>
        </div>
        <p className="pl-1 text-2xl font-semibold text-center text-accent font-source-sans">
          {value.toLocaleString()}
        </p>
      </div>
    );
  };

  StatBox.propTypes = {
    title: PropTypes.string.isRequired,
    value: PropTypes.number.isRequired,
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-primary font-source-sans">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 font-source-sans">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-8 text-3xl font-bold text-black font-orbitron">{t('admin_dashboard_title')}</h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-6 mb-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <StatBox title={t('admin_dashboard_total_users')} value={counts.users} />
          <StatBox title={t('admin_dashboard_total_orders')} value={counts.orders} />
          <StatBox title={t('admin_dashboard_total_products')} value={counts.products} />
          <StatBox title={t('admin_dashboard_total_posts')} value={counts.posts} />
          <StatBox title={t('admin_dashboard_total_exercises')} value={counts.exercises} />
          <StatBox title={t('admin_dashboard_total_diet_plans')} value={counts.dietPlans} />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 gap-6 mb-8 lg:grid-cols-2">
          {/* User Growth Chart */}
          <div className="p-6 rounded-xl bg-dark">
            <div className="flex items-center gap-3 mb-6">
              <Activity className="w-6 h-6 text-primary" />
              <h3 className="text-xl font-semibold text-accent font-source-sans">{t('admin_dashboard_user_growth')}</h3>
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
                  stroke="#40ee45"
                  strokeWidth={2}
                  dot={{ fill: '#40ee45', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Order Trends Chart */}
          <div className="p-6 rounded-xl bg-dark">
            <div className="flex items-center gap-3 mb-6">
              <Package className="w-6 h-6 text-primary" />
              <h3 className="text-xl font-semibold text-accent font-source-sans">{t('admin_dashboard_order_trends')}</h3>
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
                  fill="#40ee45"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Post Analytics */}
          <div className="p-6 rounded-xl bg-dark">
            <div className="flex items-center gap-3 mb-6">
              <ClipboardList className="w-6 h-6 text-primary" />
              <h3 className="text-xl font-semibold text-accent font-source-sans">{t('admin_dashboard_post_analytics')}</h3>
            </div>
            <div className="mb-8">
              <h4 className="mb-4 text-lg font-medium text-accent/80 font-source-sans">{t('admin_dashboard_posts_per_day')}</h4>
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
                    stroke="#40ee45"
                    strokeWidth={2}
                    dot={{ fill: '#40ee45', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div>
              <h4 className="mb-4 text-lg font-medium text-accent/80 font-source-sans">{t('admin_dashboard_top_posters')}</h4>
              <div className="overflow-x-auto border border-gray-700 rounded-lg">
                <table className="w-full">
                  <thead className="bg-secondary">
                    <tr>
                      <th className="px-4 py-3 font-medium text-left text-accent/80 font-source-sans">{t('admin_dashboard_user')}</th>
                      <th className="px-4 py-3 font-medium text-right text-accent/80 font-source-sans">{t('admin_dashboard_posts')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {postAnalytics.topPosters.map((poster) => (
                      <tr key={poster._id} className="border-t border-gray-700">
                        <td className="px-4 py-3 text-accent/80 font-source-sans">{poster.firstName} {poster.lastName}</td>
                        <td className="px-4 py-3 text-right text-accent/80 font-source-sans">{poster.postCount}</td>
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
              <h3 className="text-xl font-semibold text-accent font-source-sans">{t('admin_dashboard_recent_orders')}</h3>
            </div>
            <div className="overflow-x-auto border border-gray-700 rounded-lg">
              <table className="w-full">
                <thead className="bg-secondary">
                  <tr>
                    <th className="px-4 py-3 font-medium text-left text-accent/80 font-source-sans">{t('admin_dashboard_order_id')}</th>
                    <th className="px-4 py-3 font-medium text-left text-accent/80 font-source-sans">{t('admin_dashboard_customer')}</th>
                    <th className="px-4 py-3 font-medium text-left text-accent/80 font-source-sans">{t('admin_dashboard_status')}</th>
                    <th className="px-4 py-3 font-medium text-right text-accent/80 font-source-sans">{t('admin_dashboard_amount')}</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order._id} className="border-t border-gray-700">
                      <td className="px-4 py-3 text-accent/80 font-source-sans">{order._id.slice(-6)}</td>
                      <td className="px-4 py-3 text-accent/80 font-source-sans">{order.user?.email || 'N/A'}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium font-source-sans ${
                          order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                          order.status === 'Processing' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-accent/80 font-source-sans">
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