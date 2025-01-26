import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../config/api';

const CategoryExercisesPage = () => {
  const { category } = useParams();
  const navigate = useNavigate();
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);

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
    return <div className="flex items-center justify-center min-h-screen bg-gray-900">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="px-4 py-12 mx-auto max-w-7xl">
        <h1 className="mb-8 text-4xl font-bold text-center text-red-500">{category}</h1>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {exercises.map((exercise) => (
            <ExerciseCard
              key={exercise._id}
              exercise={exercise}
              onClick={() => navigate(`/exercises/${exercise._id}`)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const ExerciseCard = ({ exercise, onClick }) => (
  <div className="flex flex-col overflow-hidden bg-gray-800 rounded-lg">
    <img
      src={`${import.meta.env.VITE_IMAGE_URL}/uploads/exercises/${exercise.image}`}
      alt={exercise.name}
      className="object-cover w-full h-48"
    />
    <div className="flex flex-col flex-grow p-4">
      <h3 className="mb-2 text-lg font-semibold text-white">{exercise.name}</h3>
      <button
        onClick={onClick}
        className="px-4 py-2 mt-auto text-white transition-colors bg-red-500 rounded-md hover:bg-red-600"
      >
        View Details
      </button>
    </div>
  </div>
);

export default CategoryExercisesPage;