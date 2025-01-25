import { useState, useEffect, useCallback } from 'react';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { Search, Trash2, BarChart2, RefreshCcw, UserCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import PropTypes from 'prop-types';

const DeleteModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md p-6 mx-4 rounded-lg bg-dark">
        <h2 className="mb-4 text-xl font-bold text-accent">Confirm Delete</h2>
        <p className="mb-6 text-accent/80">Are you sure you want to delete this post? This action cannot be undone.</p>
        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-secondary text-accent hover:bg-secondary/80"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg bg-primary text-accent hover:opacity-90"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

DeleteModal.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  onConfirm: PropTypes.func,
};

const VictoryWallAdmin = () => {
  const { token } = useAdminAuth();
  const [posts, setPosts] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [sortBy, setSortBy] = useState('createdAt');
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState(null);

  // Keep track of current search parameters
  const [searchParams, setSearchParams] = useState({
    search: '',
    startDate: '',
    endDate: '',
    sort: 'createdAt'
  });

  const fetchPosts = useCallback(async (params) => {
    try {
      const response = await fetch(
        `/api/admin/posts?search=${params.search}&startDate=${params.startDate}&endDate=${params.endDate}&sortBy=${params.sort}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      setPosts(data.posts);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  }, [token]);

  const fetchAnalytics = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/posts/analytics', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  }, [token]);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchPosts(searchParams),
      fetchAnalytics()
    ]).finally(() => setLoading(false));
  }, [fetchPosts, fetchAnalytics, searchParams]);

  const handleSearch = (e) => {
    e.preventDefault();
    const newParams = {
      search: searchTerm,
      startDate: dateRange.start,
      endDate: dateRange.end,
      sort: sortBy
    };
    setSearchParams(newParams);
    fetchPosts(newParams);
  };

  const handleDelete = async () => {
    try {
      await fetch(`/api/admin/posts/${selectedPostId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setDeleteModalOpen(false);
      fetchPosts(searchParams);
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const openDeleteModal = (postId) => {
    setSelectedPostId(postId);
    setDeleteModalOpen(true);
  };

  const formatTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    const intervals = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60
    };

    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
      const interval = Math.floor(seconds / secondsInUnit);
      if (interval >= 1) {
        return `${interval} ${unit}${interval === 1 ? '' : 's'} ago`;
      }
    }
    return 'Just now';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCcw className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-6 mx-auto max-w-7xl bg-secondary">
      <DeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
      />

      {/* Header Section */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-accent">Victory Wall Management</h1>
        <button
          onClick={() => setShowAnalytics(!showAnalytics)}
          className="flex items-center px-6 py-3 transition-opacity rounded-lg text-md bg-primary text-accent hover:bg-red-600"
        >
          <BarChart2 className="w-5 h-5 mr-2" />
          {showAnalytics ? 'Show Posts' : 'Show Analytics'}
        </button>
      </div>

      {showAnalytics ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Overview Card */}
        <div className="p-6 rounded-lg bg-dark">
          <h2 className="mb-4 text-lg font-bold text-accent">Overview</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-accent">Total Posts</span>
              <span className="font-bold text-primary">{analytics?.totalPosts}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-accent">Total Likes</span>
              <span className="font-bold text-primary">{analytics?.totalLikes}</span>
            </div>
          </div>
        </div>

        {/* Chart Card */}
        <div className="p-6 rounded-lg bg-dark">
          <h2 className="mb-4 text-lg font-bold text-accent">Posts Per Day</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics?.postsPerDay}>
                <XAxis dataKey="_id" stroke="#FFFCF9" />
                <YAxis stroke="#FFFCF9" />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#EE4540" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Posters Card */}
        <div className="p-6 rounded-lg md:col-span-2 bg-dark">
          <h2 className="mb-4 text-lg font-bold text-accent">Top Posters</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {analytics?.topPosters.map((poster, index) => (
              <div key={index} className="p-4 rounded-lg bg-secondary">
                <div className="font-bold text-accent">{`${poster.firstName} ${poster.lastName}`}</div>
                <div className="text-sm text-accent/75">{poster.email}</div>
                <div className="mt-2 text-primary">{poster.postCount} posts</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      ) : (
        <>
          {/* Search and Filter Section */}
          <form onSubmit={handleSearch} className="p-4 mb-6 bg-dark rounded-xl ">
            <div className="grid items-center justify-center gap-4 lg:grid-cols-12">
              <div className="relative lg:col-span-3">
                <Search className="absolute transform -translate-y-1/2 left-3 top-1/2 text-accent/60" />
                <input
                  type="text"
                  placeholder="Search posts..."
                  className="w-full py-2 pl-10 pr-4 border rounded-lg bg-secondary text-accent border-accent/50 focus:outline-none focus:border-accent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-4 lg:col-span-4">
                <input
                  type="date"
                  className="flex-1 px-4 py-2 border rounded-lg bg-secondary text-accent border-accent/50
                            focus:outline-none focus:border-accent
                            [&::-webkit-calendar-picker-indicator]:invert-[0.5]
                            [&::-webkit-calendar-picker-indicator]:brightness-125"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                />
                <input
                  type="date"
                  className="flex-1 px-4 py-2 border rounded-lg bg-secondary text-accent border-accent/50
                            focus:outline-none focus:border-accent
                            [&::-webkit-calendar-picker-indicator]:invert-[0.5]
                            [&::-webkit-calendar-picker-indicator]:brightness-125"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                />
              </div>
              <div className="lg:col-span-3">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg bg-secondary text-accent border-accent/50 focus:outline-none focus:border-accent"
                >
                  <option value="createdAt">Date Created</option>
                  <option value="likes">Likes Count</option>
                </select>
              </div>
              <div className="lg:col-span-2">
                <button
                  type="submit"
                  className="w-full px-4 py-2 transition-opacity rounded-lg bg-primary text-accent hover:opacity-90"
                >
                  Search
                </button>
              </div>
            </div>
          </form>

          {/* Posts Feed */}
          <div className="max-w-2xl mx-auto space-y-2">
            {posts.map((post) => (
              <div key={post._id} className="overflow-hidden rounded-lg bg-dark">
                <div className="p-4">
                  {/* User Info Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {post.user.profileImage ? (
                        <img
                          src={`${import.meta.env.VITE_IMAGE_URL}/${post.user.profileImage}`}
                          alt="Profile"
                          className="object-cover w-12 h-12 rounded-full"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.style.display = 'none';
                            e.target.nextElementSibling.style.display = 'block';
                          }}
                        />
                      ) : null}
                      <UserCircle
                        className="w-12 h-12 text-accent/50"
                        style={{ display: post.user.profileImage ? 'none' : 'block' }}
                      />
                      <div>
                        <h3 className="font-bold text-accent">
                          {`${post.user.firstName} ${post.user.lastName}`}
                        </h3>
                        <p className="text-sm text-accent/75">{formatTimeAgo(post.createdAt)}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => openDeleteModal(post._id)}
                      className="p-2 transition-colors rounded-full text-primary hover:bg-primary/10"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Post Content */}
                  <p className="mb-4 text-accent">{post.text}</p>
                  
                  {/* Post Image */}
                  {post.image && (
                    <div className="mx-1 mb-4">
                      <img 
                        src={`${import.meta.env.VITE_IMAGE_URL}/${post.image}`}
                        alt="Post" 
                        className="w-full rounded-sm"
                      />
                    </div>
                  )}

                  {/* Post Stats */}
                  <div className="flex items-center pt-3 border-t text-accent/75 border-accent/10">
                    <span className="text-primary">{post.likes.length} likes</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default VictoryWallAdmin;