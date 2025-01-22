import { useState, useEffect, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from '../contexts/AuthContext';
import api from '../config/api';
import { Image, Heart, Users, PlusSquare, X, MoreVertical, Trash2, Edit2 } from 'lucide-react';

// Confirmation Dialog Component
const ConfirmationDialog = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 transition-opacity bg-black bg-opacity-50" onClick={onClose} />
      <div className="relative z-50 w-full max-w-md p-6 m-4 bg-gray-800 rounded-lg shadow-xl">
        <h3 className="mb-2 text-xl font-semibold text-white">{title}</h3>
        <p className="mb-6 text-gray-300">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 transition-colors duration-200 rounded-lg bg-secondary text-accent hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-4 py-2 transition-colors duration-200 bg-red-600 rounded-lg text-accent hover:bg-primary"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
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
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1 transition-colors duration-200 rounded-full hover:bg-gray-700"
      >
        <MoreVertical size={20} className="text-gray-400" />
      </button>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 z-20 w-48 mt-1 overflow-hidden bg-gray-800 border border-gray-700 rounded-lg shadow-lg">
            <button
              onClick={() => {
                onEdit();
                setIsOpen(false);
              }}
              className="flex items-center w-full gap-2 px-4 py-2 text-left text-blue-500 transition-colors duration-200 hover:bg-gray-700"
            >
              <Edit2 size={16} />
              Edit Post
            </button>
            <button
              onClick={() => {
                onDelete();
                setIsOpen(false);
              }}
              className="flex items-center w-full gap-2 px-4 py-2 text-left text-red-500 transition-colors duration-200 hover:bg-gray-700"
            >
              <Trash2 size={16} />
              Delete Post
            </button>
          </div>
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
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 transition-opacity bg-black bg-opacity-50" onClick={onClose} />
      <div className="relative z-50 w-full max-w-2xl m-4 bg-gray-800 rounded-lg shadow-xl">
        {children}
      </div>
    </div>
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
      <div className="text-white bg-gray-800 border-gray-700">
        <DialogHeader className="p-4 border-b border-gray-700">
          <DialogTitle className="text-xl font-semibold text-center text-white">
            Create Post
          </DialogTitle>
          <button
            onClick={onClose}
            className="absolute text-gray-400 transition-colors duration-200 right-4 top-4 hover:text-white"
          >
            <X size={20} />
          </button>
        </DialogHeader>
        <div className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-600 rounded-full">
              {user?.profileImage && (
                <img
                  src={`${import.meta.env.VITE_IMAGE_URL}/${user.profileImage}`}
                  alt="Profile"
                  className="object-cover w-full h-full rounded-full"
                />
              )}
            </div>
            <div>
              <h2 className="font-semibold text-white">{user?.firstName} {user?.lastName}</h2>
              <div className="flex items-center gap-2 px-3 py-1 mt-1 bg-gray-700 rounded-md">
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
            className="w-full p-2 text-white placeholder-gray-400 transition-colors duration-200 bg-transparent rounded-lg outline-none resize-none hover:bg-gray-700"
            rows={3}
          />
        </div>
        {selectedImages.length > 0 && (
          <div className="grid grid-cols-2 gap-4 p-4">
            {selectedImages.map((image, index) => (
              <div key={index} className="relative group">
                <img
                  src={image.preview}
                  alt={`Selected ${index + 1}`}
                  className="object-cover w-full h-48 rounded-lg"
                />
                <button
                  onClick={() => removeImage(index)}
                  className="absolute p-1 transition-opacity duration-200 bg-gray-900 rounded-full opacity-0 top-2 right-2 group-hover:opacity-100 hover:bg-gray-800"
                >
                  <X size={16} className="text-white" />
                </button>
              </div>
            ))}
          </div>
        )}
        {selectedImages.length === 0 && (
          <div className="p-4">
            <div
              className={`border-2 border-dashed rounded-lg p-8 cursor-pointer group transition-all duration-200 ${
                isDragging ? 'border-blue-500 bg-blue-500/10' : 'border-gray-600 hover:border-gray-500'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/*"
                multiple
                className="hidden"
              />
              <div className="flex flex-col items-center justify-center text-center">
                <div className="flex items-center justify-center w-16 h-16 mb-4 bg-gray-700 rounded-full">
                  <PlusSquare size={24} className="text-gray-400" />
                </div>
                <h3 className="mb-2 text-lg font-medium text-white">Add photos/videos</h3>
                <p className="text-sm text-gray-400">or drag and drop</p>
              </div>
            </div>
          </div>
        )}
        <div className="p-4 border-t border-gray-700">
          <button 
            className={`w-full py-2 rounded-lg transition-all duration-200 ${
              (!postText && selectedImages.length === 0) 
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
            onClick={handlePost}
            disabled={!postText && selectedImages.length === 0}
          >
            Post
          </button>
        </div>
      </div>
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
      <div className="text-white bg-gray-800 border-gray-700">
        <DialogHeader className="p-4 border-b border-gray-700">
          <DialogTitle className="text-xl font-semibold text-center text-white">
            Edit Post
          </DialogTitle>
          <button
            onClick={onClose}
            className="absolute text-gray-400 transition-colors duration-200 right-4 top-4 hover:text-white"
          >
            <X size={20} />
          </button>
        </DialogHeader>
        <div className="p-4">
          <textarea
            placeholder="What's on your mind..."
            value={postText}
            onChange={(e) => setPostText(e.target.value)}
            className="w-full p-2 text-white placeholder-gray-400 transition-colors duration-200 bg-transparent rounded-lg outline-none resize-none hover:bg-gray-700"
            rows={3}
          />
        </div>
        {selectedImages.length > 0 && (
          <div className="grid grid-cols-2 gap-4 p-4">
            {selectedImages.map((image, index) => (
              <div key={index} className="relative group">
                <img
                  src={image.preview || `${import.meta.env.VITE_IMAGE_URL}/${post.image}`}
                  alt={`Selected ${index + 1}`}
                  className="object-cover w-full h-48 rounded-lg"
                />
                <button
                  onClick={() => removeImage(index)}
                  className="absolute p-1 transition-opacity duration-200 bg-gray-900 rounded-full opacity-0 top-2 right-2 group-hover:opacity-100 hover:bg-gray-800"
                >
                  <X size={16} className="text-white" />
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="p-4">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full px-4 py-2 transition-colors duration-200 border-2 border-gray-600 border-dashed rounded-lg hover:border-gray-500"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/*"
              multiple
              className="hidden"
            />
            <div className="flex items-center justify-center gap-2 text-gray-400">
              <PlusSquare size={20} />
              <span>Add More Photos</span>
            </div>
          </button>
        </div>
        <div className="p-4 border-t border-gray-700">
          <button 
            className="w-full py-2 text-white transition-all duration-200 bg-blue-600 rounded-lg hover:bg-blue-700"
            onClick={handleSave}
          >
            Save Changes
          </button>
        </div>
      </div>
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
      <div className="flex items-center justify-center min-h-screen p-4 bg-gray-900">
        <div className="text-white">Loading posts...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 bg-gray-900">
      <div className="max-w-2xl mx-auto space-y-4">
        {/* Create Post Section */}
        <div className="p-4 transition-shadow duration-200 bg-gray-800 rounded-lg hover:shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-600 rounded-full">
              {user?.profileImage && (
                <img 
                  src={`${import.meta.env.VITE_IMAGE_URL}/${user.profileImage}`} 
                  alt="Profile" 
                  className="object-cover w-full h-full rounded-full"
                />
              )}
            </div>
            <input
              type="text"
              placeholder="What's on your mind..."
              className="flex-1 px-4 py-2 text-white transition-colors duration-200 bg-gray-700 rounded-full cursor-pointer focus:outline-none hover:bg-gray-600"
              onClick={() => setIsPostModalOpen(true)}
              readOnly
            />
          </div>
          <div className="flex justify-end mt-3">
            <button 
              onClick={() => setIsPostModalOpen(true)}
              className="flex items-center gap-2 bg-gray-700 px-3 py-1.5 rounded-lg transition-all duration-200 hover:bg-gray-600 hover:scale-105 active:scale-95"
            >
              <Image size={20} className="text-green-400" />
              <span className="text-sm text-green-400">Media</span>
            </button>
          </div>
        </div>

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
        {posts.map((post) => (
          <div key={post._id} className="overflow-hidden transition-shadow duration-200 bg-gray-800 rounded-lg hover:shadow-lg">
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-600 rounded-full">
                    {post.user?.profileImage && (
                      <img 
                        src={`${import.meta.env.VITE_IMAGE_URL}/${post.user.profileImage}`} 
                        alt="Profile" 
                        className="object-cover w-full h-full rounded-full"
                      />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white transition-colors duration-200 cursor-pointer hover:text-gray-300">
                      {post.user?.firstName} {post.user?.lastName}
                    </h3>
                    <p className="text-sm text-gray-400">
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
                  <span
                    key={tag}
                    className="text-sm text-blue-400 transition-colors duration-200 cursor-pointer hover:text-blue-300"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
            {post.image && (
              <img
                src={`${import.meta.env.VITE_IMAGE_URL}/${post.image}`}
                alt="Post"
                className="object-cover w-full transition-opacity duration-200 max-h-96 hover:opacity-90"
              />
            )}
            <div className="p-4">
              <button 
                onClick={() => handleLike(post._id)}
                className="flex items-center gap-2 transition-all duration-200 transform hover:opacity-80 hover:scale-105 active:scale-95"
              >
                <Heart 
                  size={20} 
                  className={post.likes.some(like => like._id === user?._id) ? "fill-red-500 text-red-500" : "text-gray-300"} 
                />
                <span className="text-gray-300">{post.likes.length}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VictoryWall;