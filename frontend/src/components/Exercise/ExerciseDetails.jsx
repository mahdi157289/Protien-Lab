import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../config/api';

const ExerciseDetailPage = () => {
  const { id } = useParams();
  const [exercise, setExercise] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const fetchExercise = async () => {
      try {
        const { data } = await api.get(`/users/exercises/${id}`);
        setExercise(data);
      } catch (error) {
        console.error('Error fetching exercise:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchExercise();
  }, [id]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen bg-dark">Loading...</div>;
  }

  if (!exercise) {
    return <div className="flex items-center justify-center min-h-screen bg-dark">Exercise not found</div>;
  }

  const getYouTubeEmbedId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const videoId = getYouTubeEmbedId(exercise.youtubeLink);

  return (
    <div className="min-h-screen text-white ">
      <div className="px-4 py-8 mx-auto max-w-7xl">
        <h1 className="mb-4 text-4xl font-bold text-center">{exercise.category}</h1>
        <h2 className="mb-8 text-3xl font-bold text-center text-red-500">{exercise.name}</h2>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="p-6 bg-dark rounded-lg">
              <div className="relative overflow-hidden bg-black rounded-lg aspect-video">
                {isPlaying ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                    title="Exercise Video"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  ></iframe>
                ) : (
                  <>
                    <img
                      src={`${import.meta.env.VITE_IMAGE_URL}/uploads/exercises/${exercise.image}`}
                      alt="Exercise"
                      className="object-cover w-full h-full"
                    />
                    <button
                      onClick={() => setIsPlaying(true)}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      <div className="flex items-center justify-center w-16 h-16 bg-red-500 rounded-full">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-8 h-8 text-white"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M5 3l14 9-14 9V3z" />
                        </svg>
                      </div>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="p-6 bg-dark rounded-lg">
              <h3 className="mb-4 text-2xl font-bold">Exercise Details</h3>
              <p className="mb-4 text-gray-300">{exercise.description}</p>
              <div className="mt-4">
                <h4 className="mb-2 text-lg font-semibold">Target Muscles</h4>
                <p className="text-gray-400">{exercise.category}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExerciseDetailPage;