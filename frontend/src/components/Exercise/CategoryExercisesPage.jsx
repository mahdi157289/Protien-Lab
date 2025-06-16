import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../config/api';
import PropTypes from "prop-types";
import { Loader } from 'lucide-react';
import { useTranslation } from "react-i18next";

const CategoryExercisesPage = () => {
  const { category } = useParams();
  const navigate = useNavigate();
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const { data } = await api.get(`/users/exercises/category/${category}`);
        setExercises(data);
      } catch (error) {
        console.error('Error fetching exercises:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchExercises();
  }, [category]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen ">
      <div className="px-4 py-12 mx-auto max-w-7xl">
        <h1 className="mb-8 text-4xl font-bold text-center #40ee45">{category}</h1>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {exercises.map((exercise) => (
            <ExerciseCard
              key={exercise._id}
              exercise={exercise}
              onClick={() => navigate(`/exercises/${exercise._id}`)}
              t={t}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const ExerciseCard = ({ exercise, onClick, t }) => (
  <div className="flex flex-col overflow-hidden rounded-lg bg-dark">
    <img
      src={`${import.meta.env.VITE_IMAGE_URL}/uploads/exercises/${exercise.image}`}
      alt={exercise.name}
      className="object-cover w-full h-48"
    />
    <div className="flex flex-col flex-grow p-4">
      <h3 className="mb-2 text-lg font-semibold text-white">{exercise.name}</h3>
      <button
        onClick={onClick}
        className="px-4 py-2 mt-auto text-white transition-colors bg-green-500 rounded-md hover:bg-green-600"
      >
        {t('exercise_view_details')}
      </button>
    </div>
  </div>
);

ExerciseCard.propTypes = {
  exercise: PropTypes.shape({
    name: PropTypes.string,
    image: PropTypes.string,
  }).isRequired,
  onClick: PropTypes.func,
  t: PropTypes.func,
};

export default CategoryExercisesPage;