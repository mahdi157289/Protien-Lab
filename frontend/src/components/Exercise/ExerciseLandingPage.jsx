import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../config/api';
import PropTypes from "prop-types";
import { Loader } from 'lucide-react';
import exerciseLandingImg from '../../assets/images/exercise/exercise_landing.jpg';
import { useTranslation } from "react-i18next";

const ExerciseLandingPage = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }} className="min-h-screen">
      {/* Hero Section */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }} className="relative h-[500px]">
        <div className="absolute inset-0">
          <img src={exerciseLandingImg} alt="Hero background" className="object-cover w-full h-full" />
          <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        </div>
        <motion.div  initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
        className="container relative flex items-center h-full px-4 mx-auto">
          <h1 className="text-primary mx-auto text-4xl font-bold md:text-6xl max-w-7xl">
            {t('exercise_landing_title')}
          </h1>
        </motion.div>
      </motion.div>

      {/* Categories Grid */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.5 }} className="px-4 py-16 mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => (
            <CategoryCard
              key={category.name}
              category={category}
              onClick={() => navigate(`/exercises/category/${encodeURIComponent(category.name)}`)}
              t={t}
            />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

const CategoryCard = ({ category, onClick, t }) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.9 }} 
    animate={{ opacity: 1, scale: 1 }} 
    transition={{ duration: 0.8 }} 
    whileHover={{ scale: 1.05 }} 
    className="overflow-hidden transition-transform bg-dark rounded-2xl"
  >
    <div className="aspect-[4/3] relative">
      <img src={`${import.meta.env.VITE_IMAGE_URL}/uploads/exercises/${category.image}`} alt={category.name} className="object-cover w-full h-full" />
    </div>
    <div className="p-6 text-center">
      <h3 className="mb-3 text-xl font-semibold text-white">{category.name}</h3>
      <motion.button 
        onClick={onClick} 
        whileHover={{ scale: 1.05 }} 
        className="w-full py-2 text-white transition-colors bg-green-500 rounded-lg hover:bg-green-600"
      >
        {t('exercise_view_exercises')}
      </motion.button>
    </div>
  </motion.div>
);

CategoryCard.propTypes = {
  category: PropTypes.shape({
    name: PropTypes.string,
    image: PropTypes.string,
  }).isRequired,
  onClick: PropTypes.func,
  t: PropTypes.func,
};

export default ExerciseLandingPage;