import React, { useState, useCallback, useRef } from 'react';
import { Image, Heart, Users, PlusSquare, X, MoreVertical, Trash2, Edit2 } from 'lucide-react';
// Confirmation Dialog Component
const ConfirmationDialog = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose} />
      <div className="relative z-50 w-full max-w-md bg-gray-800 rounded-lg shadow-xl m-4 p-6">
        <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
        <p className="text-gray-300 mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-secondary text-accent hover:bg-gray-600 transition-colors duration-200">
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-4 py-2 rounded-lg bg-red-600 text-accent hover:bg-primary transition-colors duration-200">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};
// Menu Dropdown Component (Updated with Edit)
const MenuDropdown = ({ onDelete, onEdit }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1 rounded-full hover:bg-gray-700 transition-colors duration-200" >
        <MoreVertical size={20} className="text-gray-400" />
      </button>  
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}/>
          <div className="absolute right-0 mt-1 w-48 bg-gray-800 rounded-lg shadow-lg overflow-hidden z-20 border border-gray-700">
            <button
              onClick={() => {
                onEdit();
                setIsOpen(false);
              }}
              className="w-full px-4 py-2 text-left text-blue-500 hover:bg-gray-700 transition-colors duration-200 flex items-center gap-2">
              <Edit2 size={16} />
              Edit Post
            </button>
            <button
              onClick={() => {
                onDelete();
                setIsOpen(false);
              }}
              className="w-full px-4 py-2 text-left text-red-500 hover:bg-gray-700 transition-colors duration-200 flex items-center gap-2">
              <Trash2 size={16} />
              Delete Post
            </button>
          </div>
        </>
      )}
    </div>
  );
};
// Dialog Components
const Dialog = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}/>
      <div className="relative z-50 w-full max-w-2xl bg-gray-800 rounded-lg shadow-xl m-4">
        {children}
      </div>
    </div>
  );
};
const DialogHeader = ({ children }) => (
  <div className="mb-4">
    {children}
  </div>
);
const DialogTitle = ({ children }) => (
  <h2 className="text-xl font-semibold text-white">
    {children}
  </h2>
);
// Create Post Modal Component
const CreatePostModal = ({ isOpen, onClose, onPost }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [postText, setPostText] = useState('');
  const [selectedImages, setSelectedImages] = useState([]);
  const fileInputRef = useRef(null);
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);}, []);
  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);}, []);
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith('image/') );
    handleImageSelection(files);}, []);
  const handleImageSelection = (files) => {
    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    setSelectedImages(prev => [...prev, ...newImages]);};
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files).filter(file => 
      file.type.startsWith('image/')
    );
    handleImageSelection(files);};
  const removeImage = (index) => {
    setSelectedImages(prev => {
      const newImages = [...prev];
      URL.revokeObjectURL(newImages[index].preview);
      newImages.splice(index, 1);
      return newImages;
    });
  };
  const handlePost = () => {
    const newPost = {
      id: Date.now(),
      author: 'Sadeepa Bandara',
      timeAgo: 'Just now',
      text: postText,
      tags: ['bodysync', 'fitness'],
      images: selectedImages.map(img => img.preview),
      likes: 0,
      isLiked: false
    };
    onPost(newPost);
    setPostText('');
    setSelectedImages([]);
    onClose();
  };
  return (
    <Dialog isOpen={isOpen} onClose={onClose}>
      <div className="bg-gray-800 border-gray-700 text-white">
        <DialogHeader className="p-4 border-b border-gray-700">
          <DialogTitle className="text-xl font-semibold text-center text-white">
            Create Post
          </DialogTitle>
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-gray-400 hover:text-white transition-colors duration-200">
            <X size={20} />
          </button>
        </DialogHeader>
        <div className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gray-600"></div>
            <div>
              <h2 className="text-white font-semibold">Sadeepa Bandara</h2>
              <div className="flex items-center gap-2 bg-gray-700 rounded-md px-3 py-1 mt-1">
                <Users size={16} className="text-gray-400" />
                <span className="text-gray-300 text-sm">Everyone</span>
              </div>
            </div>
          </div>
        </div>
        <div className="p-4">
          <textarea
            placeholder="What's on your mind..."
            value={postText}
            onChange={(e) => setPostText(e.target.value)}
            className="w-full bg-transparent text-white placeholder-gray-400 outline-none resize-none hover:bg-gray-700 transition-colors duration-200 p-2 rounded-lg"
            rows={3}
          />
        </div>
        {selectedImages.length > 0 && (
          <div className="p-4 grid grid-cols-2 gap-4">
            {selectedImages.map((image, index) => (
              <div key={index} className="relative group">
                <img
                  src={image.preview}
                  alt={`Selected ${index + 1}`}
                  className="w-full h-48 object-cover rounded-lg"/>
                <button
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 bg-gray-900 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-gray-800">
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
              onClick={() => fileInputRef.current?.click()}>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/*"
                multiple
                className="hidden"/>
              <div className="flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mb-4">
                  <PlusSquare size={24} className="text-gray-400" />
                </div>
                <h3 className="text-white text-lg font-medium mb-2">Add photos/videos</h3>
                <p className="text-gray-400 text-sm">or drag and drop</p>
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
            disabled={!postText && selectedImages.length === 0}>
            Post
          </button>
        </div>
      </div>
    </Dialog>
  );
};
// Edit Post Modal Component
const EditPostModal = ({ isOpen, onClose, post, onSave }) => {
  const [postText, setPostText] = useState(post?.text || '');
  const [selectedImages, setSelectedImages] = useState(
    post?.images ? post.images.map(url => ({ preview: url })) :
    post?.imageUrl ? [{ preview: post.imageUrl }] : []
  );
  const fileInputRef = useRef(null);
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files).filter(file => 
      file.type.startsWith('image/')
    );
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
    });};
  const handleSave = () => {
    const updatedPost = {
      ...post,
      text: postText,
      images: selectedImages.map(img => img.preview),
      imageUrl: undefined // Convert to using images array instead
    };
    onSave(updatedPost);
  };
  return (
    <Dialog isOpen={isOpen} onClose={onClose}>
      <div className="bg-gray-800 border-gray-700 text-white">
        <DialogHeader className="p-4 border-b border-gray-700">
          <DialogTitle className="text-xl font-semibold text-center text-white">
            Edit Post
          </DialogTitle>
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-gray-400 hover:text-white transition-colors duration-200" >
            <X size={20} />
          </button>
        </DialogHeader>
        <div className="p-4">
          <textarea
            placeholder="What's on your mind..."
            value={postText}
            onChange={(e) => setPostText(e.target.value)}
            className="w-full bg-transparent text-white placeholder-gray-400 outline-none resize-none hover:bg-gray-700 transition-colors duration-200 p-2 rounded-lg"
            rows={3}
          />
        </div>
        {selectedImages.length > 0 && (
          <div className="p-4 grid grid-cols-2 gap-4">
            {selectedImages.map((image, index) => (
              <div key={index} className="relative group">
                <img
                  src={image.preview}
                  alt={`Selected ${index + 1}`}
                  className="w-full h-48 object-cover rounded-lg"/>
                <button
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 bg-gray-900 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-gray-800">
                  <X size={16} className="text-white" />
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="p-4">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-2 px-4 rounded-lg border-2 border-dashed border-gray-600 hover:border-gray-500 transition-colors duration-200">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/*"
              multiple
              className="hidden"/>
            <div className="flex items-center justify-center gap-2 text-gray-400">
              <PlusSquare size={20} />
              <span>Add More Photos</span>
            </div>
          </button>
        </div>
        <div className="p-4 border-t border-gray-700">
          <button 
            className="w-full py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all duration-200"
            onClick={handleSave}>
            Save Changes
          </button>
        </div>
      </div>
    </Dialog>
  );
};
// Main VictoryWall Component
const VictoryWall = () => {
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);
  const [postToEdit, setPostToEdit] = useState(null);
  const [posts, setPosts] = useState([
    {
      id: 1,
      author: 'Geethaka Kalhara',
      timeAgo: '1h',
      text: 'Thank you bodysync for guiding me.',
      tags: ['bodysync', 'fitness', 'gymfever'],
      imageUrl: '/api/placeholder/800/600',
      likes: 42,
      isLiked: false
    },
    {
      id: 2,
      author: 'Sadeepa Bandara',
      timeAgo: '45 min',
      text: 'Thank you bodysync!!!',
      tags: ['bodysync', 'fitness', 'gymfever'],
      imageUrl: '/api/placeholder/800/600',
      likes: 24,
      isLiked: false
    }
  ]);

  const handleLike = (postId) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          likes: post.isLiked ? post.likes - 1 : post.likes + 1,
          isLiked: !post.isLiked
        };
      }
      return post;
    }));
  };
  const handleNewPost = (newPost) => {
    setPosts(prevPosts => [newPost, ...prevPosts]);
  };
  const handleEditClick = (postId) => {
    const post = posts.find(p => p.id === postId);
    setPostToEdit(post);
    setIsEditModalOpen(true);
  };
  const handleEditSave = (updatedPost) => {
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === updatedPost.id ? updatedPost : post
      )
    );
    setPostToEdit(null);
    setIsEditModalOpen(false);
  };
  const handleDeleteClick = (postId) => {
    setPostToDelete(postId);
    setIsConfirmDeleteOpen(true);
  };
  const handleDeleteConfirm = () => {
    if (postToDelete) {
      setPosts(prevPosts => prevPosts.filter(post => post.id !== postToDelete));
      setPostToDelete(null);
    }
  };
  return (
    <div className="bg-gray-900 min-h-screen p-4">
      <div className="max-w-2xl mx-auto space-y-4">
        {/* Create Post Section */}
        <div className="bg-gray-800 rounded-lg p-4 hover:shadow-lg transition-shadow duration-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-600"></div>
            <input
              type="text"
              placeholder="What's on your mind..."
              className="bg-gray-700 text-white rounded-full py-2 px-4 flex-1 focus:outline-none cursor-pointer hover:bg-gray-600 transition-colors duration-200"
              onClick={() => setIsPostModalOpen(true)}
              readOnly
            />
          </div>
          <div className="mt-3 flex justify-end">
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
          <div key={post.id} className="bg-gray-800 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-200">
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-600"></div>
                  <div>
                    <h3 className="text-white font-semibold hover:text-gray-300 transition-colors duration-200 cursor-pointer">
                      {post.author}
                    </h3>
                    <p className="text-gray-400 text-sm">{post.timeAgo}</p>
                  </div>
                </div>
                <MenuDropdown 
                  onDelete={() => handleDeleteClick(post.id)}
                  onEdit={() => handleEditClick(post.id)}
                />
              </div>
              <p className="text-white mt-3">{post.text}</p>
              <div className="flex gap-2 mt-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-blue-400 text-sm hover:text-blue-300 cursor-pointer transition-colors duration-200"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
            {post.imageUrl ? (
              <img
                src={post.imageUrl}
                alt="Post"
                className="w-full object-cover max-h-96 hover:opacity-90 transition-opacity duration-200"
              />
            ) : post.images && post.images.length > 0 && (
              <div className={`grid ${post.images.length > 1 ? 'grid-cols-2' : 'grid-cols-1'} gap-1`}>
                {post.images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Post ${index + 1}`}
                    className="w-full object-cover max-h-96 hover:opacity-90 transition-opacity duration-200"
                  />
                ))}
              </div>
            )}
            <div className="p-4">
              <button 
                onClick={() => handleLike(post.id)}
                className="flex items-center gap-2 hover:opacity-80 transition-all duration-200 transform hover:scale-105 active:scale-95"
              >
                <Heart 
                  size={20} 
                  className={post.isLiked ? "fill-red-500 text-red-500" : "text-gray-300"} 
                />
                <span className="text-gray-300">{post.likes}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VictoryWall;