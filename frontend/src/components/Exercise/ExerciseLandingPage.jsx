// src/pages/ExercisesLanding.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../config/api';
import PropTypes from "prop-types";

const ExerciseLandingPage = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await api.get('/users/exercises/categories');
        setCategories(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen ">Loading...</div>;
  }

  return (
    <div className="min-h-screen ">
      {/* Hero Section */}
      <div className="relative h-[500px]">
        <div className="absolute inset-0">
          <img
            src="/src/assets/images/Exercises/karsten-winegeart-0Wra5YYVQJE-unsplash.jpg"
            alt="Hero background"
            className="object-cover w-full h-full"
          />
          <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        </div>
        <div className="container relative flex items-center h-full px-4 mx-auto">
          <h1 className="mx-auto text-4xl font-bold text-red-500 md:text-6xl max-w-7xl">
            Ready To Make a Change ?
          </h1>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="px-4 py-16 mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <CategoryCard
              key={category.name}
              category={category}
              onClick={() => navigate(`/exercises/category/${encodeURIComponent(category.name)}`)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const CategoryCard = ({ category, onClick }) => (
  <div className="overflow-hidden transition-transform bg-dark rounded-2xl hover:transform hover:scale-105">
    <div className="aspect-[4/3] relative">
      <img
        src={`${import.meta.env.VITE_IMAGE_URL}/uploads/exercises/${category.image}`}
        alt={category.name}
        className="object-cover w-full h-full"
      />
    </div>
    <div className="p-6 text-center">
      <h3 className="mb-3 text-xl font-semibold text-white">{category.name}</h3>
      <button 
        onClick={onClick}
        className="w-full py-2 text-white transition-colors bg-red-500 rounded-lg hover:bg-red-600"
      >
        View Exercises
      </button>
    </div>
  </div>
);

CategoryCard.propTypes = {
  category: PropTypes.shape({
    name: PropTypes.string,
    image: PropTypes.string,
  }).isRequired,
  onClick: PropTypes.func,
};

export default ExerciseLandingPage;