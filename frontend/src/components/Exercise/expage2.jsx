import React from 'react';

const exerciseData = [
  {
    id: 1,
    title: 'Dumbbell Lateral Raise',
    image: '/src/assets/images/Exercises/sholderpres.png',
  },
  {
    id: 2,
    title: 'Military Press',
    image: '/src/assets/images/Exercises/sholderpres.png',
  },
  {
    id: 3,
    title: 'Bent Over Dumbbell Reverse Fly',
    image: '/src/assets/images/Exercises/sholderpres.png',
  },
  {
    id: 4,
    title: 'Seated Arnold Press',
    image: '/src/assets/images/Exercises/sholderpres.png',
  },
  {
    id: 5,
    title: 'Standing Dumbbell Shoulder Press',
    image: '/src/assets/images/Exercises/sholderpres.png',
  },
  {
    id: 6,
    title: 'Seated Dumbbell Press',
    image: '/src/assets/images/Exercises/sholderpres.png',
  },
  {
    id: 7,
    title: 'Seated Barbell Shoulder Press',
    image: '/src/assets/images/Exercises/sholderpres.png',
  },
  {
    id: 8,
    title: 'Seated Dumbbell Lateral Raise',
    image: '/src/assets/images/Exercises/sholderpres.png',
  },
  {
    id: 9,
    title: 'Cable Face Pull',
    image: '/src/assets/images/Exercises/sholderpres.png',
  },
];

const ShoulderExercises = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
   

      {/* Hero Section */}
      <div className="relative h-64 bg-gray-800 mb-12">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url("/src/assets/images/Exercises/pexels-olly-3837757.png")' }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-50" />
        </div>
        <div className="relative h-full flex items-center justify-center">
          <h1 className="text-5xl font-bold text-red-500">Shoulder Press Exercises</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 pb-12">
        <h2 className="text-2xl font-bold mb-8">BEST SHOULDER EXERCISES</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exerciseData.map((exercise) => (
            <ExerciseCard
              key={exercise.id}
              title={exercise.title}
              image={exercise.image}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const NavLink = ({ text, active }) => (
  <a
    href="#"
    className={`text-sm ${
      active ? 'text-red-500' : 'text-gray-300 hover:text-white'
    }`}
  >
    {text}
  </a>
);

const ExerciseCard = ({ title, image }) => (
  <div className="bg-gray-800 rounded-lg overflow-hidden flex flex-col items-center">
    <img
      src={image}
      alt={title}
      className="w-full h-48 object-cover"
    />
    <div className="p-4 flex flex-col items-center">
      <h3 className="text-lg font-semibold mb-3 text-center">{title}</h3>
      <button className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors">
        View Exercise
      </button>
    </div>
  </div>
);

export default ShoulderExercises;