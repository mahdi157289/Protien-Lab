import { useState, useEffect, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from '../contexts/AuthContext';
import api from '../config/api';
import { Image, Heart, Users, PlusSquare, X, MoreVertical, Trash2, Edit2 } from 'lucide-react';
import {Loader} from 'lucide-react';
import { motion } from 'framer-motion';

// Confirmation Dialog Component
const ConfirmationDialog = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;
  return (
    <motion.div 
      className="fixed inset-0 z-50 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div 
        className="fixed inset-0 transition-opacity bg-black bg-opacity-80" 
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />
      <motion.div 
        className="relative z-50 w-full max-w-md p-6 m-4 rounded-lg shadow-xl bg-dark"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', damping: 20 }}
      >
        <h3 className="mb-2 text-xl font-semibold text-center text-white">{title}</h3>
        <p className="mb-6 text-center text-accent/80">{message}</p>
        <div className="flex justify-center gap-10">
          <motion.button
            onClick={onClose}
            className="px-8 py-2 transition border rounded-lg text-primary bg-secondary hover:bg-dark border-primary"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Cancel
          </motion.button>
          <motion.button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-8 py-2 transition border rounded-lg border-primary bg-primary hover:bg-green-600"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Delete
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

ConfirmationDialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
};

// Menu Dropdown Component
const MenuDropdown = ({ onDelete, onEdit }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="relative">
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1 transition-colors duration-200 rounded-full hover:bg-secondary"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <MoreVertical size={20} className="text-accent" />
      </motion.button>
      {isOpen && (
        <>
          <motion.div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div 
            className="absolute right-0 z-20 w-48 mt-1 overflow-hidden rounded-lg shadow-lg bg-secondary"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          >
            <motion.button
              onClick={() => {
                onEdit();
                setIsOpen(false);
              }}
              className="flex items-center w-full gap-2 px-4 py-2 text-left transition-colors duration-200 hover:bg-accent/10"
              whileHover={{ x: 5 }}
            >
              <Edit2 size={16} />
              Edit Post
            </motion.button>
            <motion.button
              onClick={() => {
                onDelete();
                setIsOpen(false);
              }}
              className="flex items-center w-full gap-2 px-4 py-2 text-left #40ee45 transition-colors duration-200 hover:bg-green-500/10"
              whileHover={{ x: 5 }}
            >
              <Trash2 size={16} />
              Delete Post
            </motion.button>
          </motion.div>
        </>
      )}
    </div>
  );
};

MenuDropdown.propTypes = {
  onDelete: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
};

// Dialog Components
const Dialog = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;
  return (
    <motion.div 
      className="fixed inset-0 z-50 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div 
        className="fixed inset-0 transition-opacity bg-black bg-opacity-50" 
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />
      <motion.div 
        className="relative z-50 w-full max-w-2xl m-4 bg-gray-800 rounded-lg shadow-xl"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ type: 'spring', damping: 25 }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
};

Dialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
};

const DialogHeader = ({ children }) => (
  <div className="mb-4">{children}</div>
);

DialogHeader.propTypes = {
  children: PropTypes.node.isRequired,
};

const DialogTitle = ({ children }) => (
  <h2 className="text-xl font-semibold text-white">{children}</h2>
);

DialogTitle.propTypes = {
  children: PropTypes.node.isRequired,
};

// Create Post Modal Component
const CreatePostModal = ({ isOpen, onClose, onPost }) => {
  const { user } = useAuth();
  const [isDragging, setIsDragging] = useState(false);
  const [postText, setPostText] = useState('');
  const [selectedImages, setSelectedImages] = useState([]);
  const fileInputRef = useRef(null);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
    handleImageSelection(files);
  }, []);

  const handleImageSelection = (files) => {
    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    setSelectedImages(prev => [...prev, ...newImages]);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files).filter(file => file.type.startsWith('image/'));
    handleImageSelection(files);
  };

  const removeImage = (index) => {
    setSelectedImages(prev => {
      const newImages = [...prev];
      URL.revokeObjectURL(newImages[index].preview);
      newImages.splice(index, 1);
      return newImages;
    });
  };

  const handlePost = async () => {
    try {
      const formData = new FormData();
      formData.append('text', postText);
      if (selectedImages.length > 0) {
        formData.append('image', selectedImages[0].file);
      }

      const { data } = await api.post('/posts', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      onPost(data);
      setPostText('');
      setSelectedImages([]);
      onClose();
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose}>
      <motion.div 
        className="rounded-lg bg-dark"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', damping: 25 }}
      >
        <div className="border-b border-accent/50 ">
          <div className="p-4 text-xl font-semibold ">
              Create Post
          </div>
          <motion.button
            onClick={onClose}
            className="absolute transition-colors duration-200 right-4 top-4 hover:text-primary"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <X className='w-6 h-6' />
          </motion.button>
        </div>
        <div className="p-4">
          <div className="flex items-center gap-3">
            <motion.div 
              className="w-12 h-12 rounded-full bg-secondary"
              whileHover={{ scale: 1.05 }}
            >
              {user?.profileImage && (
                <img
                  src={`${import.meta.env.VITE_IMAGE_URL}/${user.profileImage}`}
                  alt="Profile"
                  className="object-cover w-full h-full rounded-full"
                />
              )}
            </motion.div>
            <div>
              <h2 className="font-semibold text-white">{user?.firstName} {user?.lastName}</h2>
              <div className="flex items-center gap-2 px-3 py-1 mt-1 rounded-md bg-secondary">
                <Users size={16} className="text-gray-400" />
                <span className="text-sm text-gray-300">Everyone</span>
              </div>
            </div>
          </div>
        </div>
        <div className="p-4">
          <textarea
            placeholder="What's on your mind..."
            value={postText}
            onChange={(e) => setPostText(e.target.value)}
            className="w-full p-2 text-white placeholder-gray-400 transition-colors duration-200 rounded-lg outline-none resize-none bg-secondary/70 hover:bg-secondary"
            rows={3}
          />
        </div>
        {selectedImages.length > 0 && (
          <motion.div 
            className="grid grid-cols-2 gap-4 p-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {selectedImages.map((image, index) => (
              <motion.div 
                key={index} 
                className="relative group"
                whileHover={{ scale: 1.01 }}
              >
                <img
                  src={image.preview}
                  alt={`Selected ${index + 1}`}
                  className="object-cover w-full h-48 rounded-lg"
                />
                <motion.button
                  onClick={() => removeImage(index)}
                  className="absolute p-1 transition-opacity duration-200 rounded-full opacity-0 bg-secondary top-2 right-2 group-hover:opacity-100 hover:bg-secondary"
                  whileHover={{ scale: 1.1 }}
                >
                  <X size={16} className="text-white" />
                </motion.button>
              </motion.div>
            ))}
          </motion.div>
        )}
        {selectedImages.length === 0 && (
          <div className="p-4">
            <motion.div
              className={`border-2 border-dashed rounded-lg p-8 cursor-pointer group transition-all duration-200 ${
                isDragging ? 'border-500 bg-secondary' : 'border-accent/40 hover:border-accent/60'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              whileHover={{ scale: 1.01 }}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/*"
                multiple
                className="hidden"
              />
              <div className="flex flex-col items-center justify-center text-center ">
                <motion.div 
                  className="flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-secondary "
                  whileHover={{ scale: 1.1 }}
                >
                  <PlusSquare size={24} className="text-accent/80 group-hover:text-accent" />
                </motion.div>
                <h3 className="mb-2 text-lg font-medium ">Add photos/videos</h3>
                <p className="text-sm text-accent/50">or drag and drop</p>
              </div>
            </motion.div>
          </div>
        )}
        <div className="p-4 border-t border-accent/50">
          <motion.button 
            className={`w-full py-2 rounded-lg transition-all duration-200 ${
              (!postText && selectedImages.length === 0) 
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
            onClick={handlePost}
            disabled={!postText && selectedImages.length === 0}
            whileHover={(!postText && selectedImages.length === 0) ? {} : { scale: 1.01 }}
            whileTap={(!postText && selectedImages.length === 0) ? {} : { scale: 0.98 }}
          >
            Post
          </motion.button>
        </div>
      </motion.div>
    </Dialog>
  );
};

CreatePostModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onPost: PropTypes.func.isRequired,
};

// Edit Post Modal Component
const EditPostModal = ({ isOpen, onClose, post, onSave }) => {
  const [postText, setPostText] = useState(post?.text || '');
  const [selectedImages, setSelectedImages] = useState(
    post?.image ? [{ preview: `${import.meta.env.VITE_IMAGE_URL}${post.image}` }] : []
  );
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files).filter(file => file.type.startsWith('image/'));
    handleImageSelection(files);
  };

  const handleImageSelection = (files) => {
    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    setSelectedImages(prev => [...prev, ...newImages]);
  };

  const removeImage = (index) => {
    setSelectedImages(prev => {
      const newImages = [...prev];
      if (newImages[index].file) {
        URL.revokeObjectURL(newImages[index].preview);
      }
      newImages.splice(index, 1);
      return newImages;
    });
  };

  const handleSave = async () => {
    try {
      const formData = new FormData();
      formData.append('text', postText);
      if (selectedImages[0]?.file) {
        formData.append('image', selectedImages[0].file);
      }

      const { data } = await api.put(`/posts/${post._id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      onSave(data);
    } catch (error) {
      console.error('Error updating post:', error);
    }
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose}>
      <motion.div 
        className="rounded-lg bg-dark"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', damping: 25 }}
      >
        <div className="border-b border-accent/50">
          <div className="p-4 text-xl font-semibold ">
            Edit Post
          </div>
          <motion.button
            onClick={onClose}
            className="absolute transition-colors duration-200 right-4 top-4 hover:text-primary"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <X className='w-6 h-6' />
          </motion.button>
        </div>
        <div className="p-4">
          <textarea
            placeholder="What's on your mind..."
            value={postText}
            onChange={(e) => setPostText(e.target.value)}
            className="w-full p-2 text-white transition-colors duration-200 rounded-lg outline-none resize-none bg-secondary/70 placeholder-accent/80 hover:bg-secondary"
            rows={3}
          />
        </div>
        {selectedImages.length > 0 && (
          <motion.div 
            className="grid grid-cols-2 gap-4 p-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {selectedImages.map((image, index) => (
              <motion.div 
                key={index} 
                className="relative group"
                whileHover={{ scale: 1.01 }}
              >
                <img
                  src={`${import.meta.env.VITE_IMAGE_URL}/${post.image}`}
                  alt={`Selected ${index + 1}`}
                  className="object-cover w-full h-48 rounded-lg"
                />
                <motion.button
                  onClick={() => removeImage(index)}
                  className="absolute p-1 transition-opacity duration-200 rounded-full opacity-0 bg-secondary top-2 right-2 group-hover:opacity-100 hover:bg-secondary-800"
                  whileHover={{ scale: 1.1 }}
                >
                  <X size={16} className="text-white" />
                </motion.button>
              </motion.div>
            ))}
          </motion.div>
        )}
        <div className="p-4">
          <motion.button
            onClick={() => fileInputRef.current?.click()}
            className="w-full px-4 py-2 transition-colors duration-200 border-2 border-gray-600 border-dashed rounded-lg hover:border-gray-500"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/*"
              multiple
              className="hidden"
            />
            <div className="flex items-center justify-center gap-2 ">
              <PlusSquare size={20} />
              <span>Add More Photos</span>
            </div>
          </motion.button>
        </div>
        <div className="p-4 border-t border-gray-700">
          <motion.button 
            className="w-full py-2 text-white transition-all duration-200 bg-blue-600 rounded-lg hover:bg-blue-700"
            onClick={handleSave}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
          >
            Save Changes
          </motion.button>
        </div>
      </motion.div>
    </Dialog>
  );
};

EditPostModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  post: PropTypes.object,
  onSave: PropTypes.func.isRequired,
};

// Main VictoryWall Component
const VictoryWall = () => {
  const { user } = useAuth();
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);
  const [postToEdit, setPostToEdit] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const { data } = await api.get('/posts');
        setPosts(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching posts:', error);
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const handleLike = async (postId) => {
    try {
      const { data } = await api.put(`/posts/${postId}/like`);
      setPosts(posts.map(post =>
        post._id === postId ? data : post
      ));
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleNewPost = (newPost) => {
    setPosts(prevPosts => [newPost, ...prevPosts]);
  };

  const handleEditSave = (updatedPost) => {
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post._id === updatedPost._id ? updatedPost : post
      )
    );
    setPostToEdit(null);
    setIsEditModalOpen(false);
  };

  const handleDeleteConfirm = async () => {
    try {
      if (postToDelete) {
        await api.delete(`/posts/${postToDelete}`);
        setPosts(prevPosts => prevPosts.filter(post => post._id !== postToDelete));
        setPostToDelete(null);
      }
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  if (loading) {
    return (
      <motion.div 
        className="flex items-center justify-center h-screen"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        >
          <Loader className="text-primary" size={40} />
        </motion.div>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen p-4 ">
      <div className="max-w-2xl mx-auto space-y-4">
        {/* Create Post Section */}
        <motion.div 
          className="p-4 transition-shadow duration-200 rounded-lg bg-dark hover:shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center gap-3">
            <motion.div 
              className="w-10 h-10 rounded-full bg-secondary"
              whileHover={{ scale: 1.05 }}
            >
              {user?.profileImage && (
                <img 
                  src={`${import.meta.env.VITE_IMAGE_URL}/${user.profileImage}`} 
                  alt="Profile" 
                  className="object-cover w-full h-full rounded-full"
                />
              )}
            </motion.div>
            <motion.input
              type="text"
              placeholder="What's on your mind..."
              className="flex-1 px-4 py-2 transition-colors duration-200 rounded-full cursor-pointer placeholder-accent/80 bg-secondary/70 focus:outline-none hover:bg-secondary"
              onClick={() => setIsPostModalOpen(true)}
              readOnly
              whileHover={{ scale: 1.01 }}
            />
          </div>
          <div className="flex justify-end mt-3">
            <motion.button 
              onClick={() => setIsPostModalOpen(true)}
              className="flex items-center gap-2 bg-secondary/70 px-3 py-1.5 rounded-lg transition-all duration-200 hover:bg-secondary hover:scale-105 active:scale-95"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Image size={20} className="text-accent" />
              <span className="text-sm text-accent">Media</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Create Post Modal */}
        <CreatePostModal 
          isOpen={isPostModalOpen} 
          onClose={() => setIsPostModalOpen(false)}
          onPost={handleNewPost}
        />

        {/* Edit Post Modal */}
        {postToEdit && (
          <EditPostModal
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setPostToEdit(null);
            }}
            post={postToEdit}
            onSave={handleEditSave}
          />
        )}

        {/* Confirmation Dialog */}
        <ConfirmationDialog
          isOpen={isConfirmDeleteOpen}
          onClose={() => setIsConfirmDeleteOpen(false)}
          onConfirm={handleDeleteConfirm}
          title="Delete Post"
          message="Are you sure you want to delete this post? This action cannot be undone."
        />

        {/* Posts List */}
        {posts.map((post, index) => (
          <motion.div 
            key={post._id} 
            className="overflow-hidden transition-shadow duration-200 rounded-lg bg-dark hover:shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            whileHover={{ scale: 1.005 }}
          >
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <motion.div 
                    className="w-10 h-10 rounded-full bg-secondary"
                    whileHover={{ scale: 1.05 }}
                  >
                    {post.user?.profileImage && (
                      <img 
                        src={`${import.meta.env.VITE_IMAGE_URL}/${post.user.profileImage}`} 
                        alt="Profile" 
                        className="object-cover w-full h-full rounded-full"
                      />
                    )}
                  </motion.div>
                  <div>
                    <h3 className="font-semibold text-white transition-colors duration-200 cursor-pointer hover:text-accent">
                      {post.user?.firstName} {post.user?.lastName}
                    </h3>
                    <p className="text-sm text-accent/80">
                      {new Date(post.createdAt).toLocaleDateString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
                {post.user?._id === user?._id && (
                  <MenuDropdown 
                    onDelete={() => {
                      setPostToDelete(post._id);
                      setIsConfirmDeleteOpen(true);
                    }}
                    onEdit={() => {
                      setPostToEdit(post);
                      setIsEditModalOpen(true);
                    }}
                  />
                )}
              </div>
              <p className="mt-3 text-white">{post.text}</p>
              <div className="flex gap-2 mt-2">
                {post.tags?.map((tag) => (
                  <motion.span
                    key={tag}
                    className="text-sm text-blue-400 transition-colors duration-200 cursor-pointer hover:text-blue-300"
                    whileHover={{ scale: 1.1 }}
                  >
                    #{tag}
                  </motion.span>
                ))}
              </div>
            </div>
            {post.image && (
              <motion.div 
                className="mx-5"
                whileHover={{ scale: 1.01 }}
              >
                <img
                  src={`${import.meta.env.VITE_IMAGE_URL}/${post.image}`}
                  alt="Post"
                  className="object-cover w-full transition-opacity duration-200 rounded-sm hover:opacity-90"
                />
              </motion.div>
            )}
            <div className="p-4">
              <motion.button 
                onClick={() => handleLike(post._id)}
                className="flex items-center gap-2 transition-all duration-200 transform hover:opacity-80 hover:scale-105 active:scale-95"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Heart 
                  size={20} 
                  className={post.likes.some(like => like._id === user?._id) ? "fill-green-500 #40ee45" : "text-gray-300"} 
                />
                <span className="text-gray-300">{post.likes.length}</span>
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default VictoryWall;