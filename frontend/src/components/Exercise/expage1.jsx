import React from 'react';
import { useNavigate } from 'react-router-dom';

const ExerciseCard = ({ title, description, image, onViewClick }) => (
  <div className="bg-gray-800 rounded-2xl overflow-hidden">
    <div className="aspect-[4/3] relative">
      <img
        src={image}
        alt={title}
        className="w-full h-full object-cover"
      />
    </div>
    <div className="p-6 text-center">
      <h3 className="text-white text-xl font-semibold mb-3">{title}</h3>
      <p className="text-gray-400 mb-4 text-sm">{description}</p>
      <button 
        onClick={onViewClick}
        className="bg-red-500 text-white w-full py-2 rounded-lg hover:bg-red-600 transition-colors"
      >
        View
      </button>
    </div>
  </div>
);

const ExerciseLandingPage = () => {
  const navigate = useNavigate();

  const exercises = [
    {
      title: "Stretches",
      description: "Discover stretches that enhance flexibility, reduce tension, and boost recovery.",
      image: "/src/assets/images/Exercises/pexels-allan-mas-5368930.jpg",
      route: "stretches"
    },
    {
      title: "Pushups",
      description: "Build strength, endurance, and confidence one rep at a time.",
      image: "/src/assets/images/Exercises/pexels-ivan-samkov-4162491.jpg",
      route: "pushups"
    },
    {
      title: "Pullups",
      description: "Master pull-ups and elevate your strength game—one bar at a time.",
      image: "/src/assets/images/Exercises/handsome-man-workout-activity-routine.jpg",
      route: "pullups"
    },
    {
      title: "Planks",
      description: "Stay still, get stronger—planks build more than just abs.",
      image: "/src/assets/images/Exercises/pexels-elly-fairytale-3823063.jpg",
      route: "planks"
    },
    {
      title: "Ab exercises",
      description: "Abs are made with reps, not shortcuts.",
      image: "/src/assets/images/Exercises/pexels-823sl-2294363.jpg",
      route: "abs"
    },
    {
      title: "Lower back",
      description: "Strengthen the core, support the spine—your back deserves it.",
      image: "/src/assets/images/Exercises/pexels-marcuschanmedia-18112395.jpg",
      route: "lower-back"
    },
    {
      title: "Squats",
      description: "Strong legs, strong foundation—drop it like a squat.",
      image: "/src/assets/images/Exercises/sporty-woman-doing-squats-muscular-fitness-woman-military-sportswear-isolated-white-wall-fitness-healthy-lifestyle-concept.jpg",
      route: "squats"
    },
    {
      title: "Lunges",
      description: "Step forward with strength, every lunge builds power",
      image: "/src/assets/images/Exercises/full-shot-smiley-woman-stretching.jpg",
      route: "lunges"
    },
    {
      title: "Calf and Glute",
      description: "Step up your game—strong calves, steady foundation.",
      image: "/src/assets/images/Exercises/pexels-amar-13965339.jpg",
      route: "calf-glute"
    },
    {
      title: "Shoulder Press",
      description: "Press to impress—build strong shoulders, one rep at a time.",
      image: "/src/assets/images/Exercises/pexels-alesiakozik-7289370.jpg",
      route: "shoulder-press"
    },
    {
      title: "Biceps",
      description: "Grow strong, flex harder—biceps that speak for themselves.",
      image: "/src/assets/images/Exercises/pexels-tima-miroshnichenko-5327478.jpg",
      route: "biceps"
    },
    {
      title: "Triceps",
      description: "Push, press, and sculpt—triceps that define strength.",
      image: "/src/assets/images/Exercises/young-adult-doing-indoor-sport-gym.jpg",
      route: "triceps"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Hero Section */}
      <div className="relative h-[500px]">
        <div className="absolute inset-0">
          <img
            src="/src/assets/images/Exercises/karsten-winegeart-0Wra5YYVQJE-unsplash.jpg"
            alt="Hero background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        </div>
        <div className="relative container mx-auto h-full flex items-center">
          <h1 className="text-red-500 text-6xl font-bold">Ready To Make a Change ?</h1>
        </div>
      </div>

      {/* Exercise Grid */}
      <div className="container mx-auto py-16 px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {exercises.map((exercise, index) => (
            <ExerciseCard
              key={index}
              title={exercise.title}
              description={exercise.description}
              image={exercise.image}
              onViewClick={() => navigate(`/exercises/${exercise.route}`)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExerciseLandingPage;