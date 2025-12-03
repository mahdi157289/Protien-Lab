import { useState, useEffect, useCallback } from 'react';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { Search, Trash2, UserCircle, Loader } from 'lucide-react';
import PropTypes from 'prop-types';
import { useTranslation } from "react-i18next"; // Add this import
import { resolveImageUrl } from "../../lib/image";
import { getApiUrl } from '../../utils/apiUrl';

const DeleteModal = ({ isOpen, onClose, onConfirm }) => {
  const { t } = useTranslation(); // Add this line

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="w-full max-w-md p-6 mx-4 rounded-lg bg-dark">
        <h2 className="mb-4 text-xl font-bold text-center">{t('admin_victorywall_confirm_delete')}</h2>
        <p className="mb-6 text-center text-accent/80">{t('admin_victorywall_confirm_delete_message')}</p>
        <div className="flex justify-center gap-10">
          <button
            onClick={onClose}
            className="px-8 py-2 transition border rounded-lg text-primary bg-secondary hover:bg-dark border-primary"
          >
            {t('admin_victorywall_cancel')}
          </button>
          <button
            onClick={onConfirm}
            className="px-8 py-2 transition border rounded-lg border-primary bg-primary hover:bg-green-600"
          >
            {t('admin_victorywall_delete')}
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
  const { t } = useTranslation(); // Add this line
  const { token } = useAdminAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [sortBy, setSortBy] = useState('createdAt');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [searchParams, setSearchParams] = useState({
    search: '',
    startDate: '',
    endDate: '',
    sort: 'createdAt'
  });

  const fetchPosts = useCallback(async (params) => {
    try {
      const response = await fetch(
        getApiUrl(`/admin/posts?search=${params.search}&startDate=${params.startDate}&endDate=${params.endDate}&sortBy=${params.sort}`),
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

  useEffect(() => {
    setLoading(true);
    fetchPosts(searchParams).finally(() => setLoading(false));
  }, [fetchPosts, searchParams]);

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
      await fetch(getApiUrl(`/admin/posts/${selectedPostId}`), {
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
      <div className="flex items-center justify-center h-screen">
        <Loader className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-6 mx-auto max-w-7xl font-source-sans">
      <DeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
      />

      {/* Header Section */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-black">{t('admin_victorywall_management_title')}</h1>
      </div>

      {/* Search and Filter Section */}
      <form onSubmit={handleSearch} className="p-4 mb-6 bg-dark rounded-xl ">
        <div className="grid items-center justify-center gap-4 lg:grid-cols-12">
          <div className="relative lg:col-span-3">
            <Search className="absolute transform -translate-y-1/2 left-3 top-1/2 text-accent/60" />
            <input
              type="text"
              placeholder={t('admin_victorywall_search_placeholder')}
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
              <option value="createdAt">{t('admin_victorywall_sort_date')}</option>
              <option value="likes">{t('admin_victorywall_sort_likes')}</option>
            </select>
          </div>
          <div className="lg:col-span-2">
            <button
              type="submit"
              className="w-full px-4 py-2 transition-opacity rounded-lg bg-primary text-accent hover:opacity-90"
            >
              {t('admin_victorywall_search')}
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
                      src={resolveImageUrl(post.user.profileImage)}
                      alt={t('admin_victorywall_profile_alt')}
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
                    src={resolveImageUrl(post.image)}
                    alt={t('admin_victorywall_post_image_alt')}
                    className="w-full rounded-sm"
                  />
                </div>
              )}

              {/* Post Stats */}
              <div className="flex items-center pt-3 border-t text-accent/75 border-accent/10">
                <span className="text-primary">{post.likes.length} {t('admin_victorywall_likes')}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VictoryWallAdmin;