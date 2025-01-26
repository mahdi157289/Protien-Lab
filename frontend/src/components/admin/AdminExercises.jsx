import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import axios from 'axios';

const CATEGORIES = [
  'Abs Exercises', 'Chest Exercises', 'Biceps Exercises', 
  'Forearm Exercises', 'Triceps Exercises', 'Calf Exercises', 
  'Glute Exercises', 'Hamstring Exercises', 'Quad Exercises', 
  'Lats Exercises', 'Lower Back Exercises', 'Upper Back Exercises'
];

const ConfirmModal = ({ isOpen, onClose, onConfirm, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="p-6 text-center rounded-lg bg-dark">
        <p className="mb-4 text-accent">{message}</p>
        <div className="flex justify-center space-x-4">
          <button 
            onClick={onConfirm} 
            className="px-4 py-2 text-white rounded bg-primary hover:bg-opacity-90"
          >
            Confirm
          </button>
          <button 
            onClick={onClose} 
            className="px-4 py-2 rounded bg-secondary text-accent hover:bg-opacity-80"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

const AdminExercises = () => {
  const { token } = useAdminAuth();
  const [exercises, setExercises] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    youtubeLink: '',
    image: null,
    categoryImage: null
  });
  const [editingExercise, setEditingExercise] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    fetchExercises();
  }, [selectedCategory]);

  const fetchExercises = async () => {
    try {
      const url = selectedCategory 
        ? `/api/admin/exercises/category/${selectedCategory}` 
        : '/api/admin/exercises';
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setExercises(response.data);
    } catch (error) {
      console.error('Error fetching exercises:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: files ? files[0] : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formPayload = new FormData();
    Object.keys(formData).forEach(key => {
      if (formData[key]) formPayload.append(key, formData[key]);
    });

    try {
      if (editingExercise) {
        await axios.put(`/api/admin/exercises/${editingExercise._id}`, formPayload, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
      } else {
        await axios.post('/api/admin/exercises', formPayload, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
      }
      fetchExercises();
      resetForm();
    } catch (error) {
      console.error('Error saving exercise:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/admin/exercises/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchExercises();
      setConfirmDelete(null);
    } catch (error) {
      console.error('Error deleting exercise:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      youtubeLink: '',
      image: null,
      categoryImage: null
    });
    setEditingExercise(null);
  };

  const handleEdit = (exercise) => {
    setEditingExercise(exercise);
    setFormData({
      name: exercise.name,
      category: exercise.category,
      youtubeLink: exercise.youtubeLink,
      image: null,
      categoryImage: null
    });
  };

  return (
    <div className="min-h-screen p-6 bg-secondary text-accent">
      <ConfirmModal
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => handleDelete(confirmDelete)}
        message="Are you sure you want to delete this exercise?"
      />

      <div className="mx-auto max-w-7xl">
        <h1 className="mb-6 text-3xl font-bold text-accent">Exercise Management</h1>
        
        <div className="grid gap-6 md:grid-cols-2">
          {/* Exercise Form */}
          <div className="p-6 rounded-lg bg-dark">
            <h2 className="mb-4 text-xl">
              {editingExercise ? 'Edit Exercise' : 'Add New Exercise'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Exercise Name"
                className="w-full p-2 rounded bg-secondary text-accent"
                required
              />
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full p-2 rounded bg-secondary text-accent"
                required
              >
                <option value="">Select Category</option>
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <input
                type="text"
                name="youtubeLink"
                value={formData.youtubeLink}
                onChange={handleInputChange}
                placeholder="YouTube Tutorial Link"
                className="w-full p-2 rounded bg-secondary text-accent"
                required
              />
              <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
                <div className="w-full sm:w-1/2">
                  <label className="block mb-2">Exercise Image</label>
                  <input
                    type="file"
                    name="image"
                    onChange={handleInputChange}
                    accept="image/*"
                    className="w-full p-2 rounded bg-secondary text-accent"
                    required={!editingExercise}
                  />
                </div>
                <div className="w-full sm:w-1/2">
                  <label className="block mb-2">Category Image</label>
                  <input
                    type="file"
                    name="categoryImage"
                    onChange={handleInputChange}
                    accept="image/*"
                    className="w-full p-2 rounded bg-secondary text-accent"
                    required={!editingExercise}
                  />
                </div>
              </div>
              <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
                <button
                  type="submit"
                  className="w-full p-2 text-white rounded bg-primary hover:bg-opacity-90"
                >
                  {editingExercise ? 'Update Exercise' : 'Add Exercise'}
                </button>
                {editingExercise && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="w-full p-2 rounded bg-secondary text-accent hover:bg-opacity-80"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Exercise List */}
          <div className="space-y-4">
            <div className="flex mb-4 space-x-4">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full p-2 rounded bg-dark text-accent"
              >
                <option value="">All Categories</option>
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {exercises.map(exercise => (
                <div 
                  key={exercise._id} 
                  className="flex flex-col items-center justify-between p-4 space-y-2 rounded-lg bg-dark sm:flex-row sm:space-y-0"
                >
                  <div className="flex items-center space-x-4">
                    <img 
                      src={`${import.meta.env.VITE_IMAGE_URL}/uploads/exercises/${exercise.image}`}
                      alt={exercise.name} 
                      className="object-cover w-16 h-16 rounded"
                    />
                    <div>
                      <h3 className="font-semibold text-accent">{exercise.name}</h3>
                      <p className="text-sm text-gray-400">{exercise.category}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(exercise)}
                      className="p-2 text-white rounded bg-primary hover:bg-opacity-90"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setConfirmDelete(exercise._id)}
                      className="p-2 text-white bg-red-600 rounded hover:bg-opacity-90"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminExercises;