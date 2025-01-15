import { Plus, List } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import dashboardWorkoutImage from '../assets/images/dashobard/ud-workout.jpg';
import dashboardDietImage from '../assets/images/dashobard/ud-diet.jpg';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {

  const { user } = useAuth();
  const navigate = useNavigate();

  const handleNavigateToWorkout = () => {
    navigate('/workouts');
  };

  const handleNavigateToDiet = () => {
    navigate('/diet-plan');
  };

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      <div className="px-6 pt-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="mb-2 text-3xl font-bold md:text-4xl">
                Welcome to BodySync, <span className="text-primary">{user?.firstName}!</span>
              </h1>
              <p className="">Manage and customize your workout and diet plans</p>
            </div>
          </div>

          {/* Main Grid */}
          <div className="grid gap-8 md:grid-cols-2">
            {/* Workout Section */}
            <div className="overflow-hidden bg-dark rounded-2xl">
              <div className="relative h-[50vh] md:h-[60vh] lg:h-[65vh] overflow-hidden">
                <img
                  src={dashboardWorkoutImage}
                  alt="Workout"
                  className="object-cover w-full h-full brightness-50"
                />
                <div className="absolute inset-0 flex flex-col justify-between p-6 bg-gradient-to-t from-dark/90">
                  <h2 className="mb-4 text-3xl font-bold text-accent/30">Workout Plans</h2>
                  <div className="flex flex-col gap-4 sm:flex-row">
                    <button
                      onClick={handleNavigateToWorkout}
                      className="flex items-center max-w-xs gap-2 px-6 py-3 mx-auto transition-colors rounded-xl bg-primary hover:bg-red-600 sm:max-w-none sm:mx-0"
                    >
                      <Plus className="w-5 h-5" />
                      Create Workout
                    </button>
                    <button
                      onClick={handleNavigateToWorkout}
                      className="flex items-center max-w-xs gap-2 px-6 py-3 mx-auto transition-colors rounded-xl bg-secondary hover:bg-dark sm:max-w-none sm:mx-0"
                    >
                      <List className="w-5 h-5" />
                      Your Plans
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Diet Section */}
            <div className="overflow-hidden rounded-2xl">
              <div className="relative h-[50vh] md:h-[60vh] lg:h-[65vh] overflow-hidden">
                <img
                  src={dashboardDietImage}
                  alt="Diet"
                  className="object-cover w-full h-full brightness-50"
                />
                <div className="absolute inset-0 flex flex-col justify-between p-6 bg-gradient-to-t from-dark/90">
                  <h2 className="mb-4 text-3xl font-bold text-accent/30">Diet Plans</h2>
                  <div className="flex flex-col gap-4 sm:flex-row">
                    <button
                      onClick={handleNavigateToDiet}
                      className="flex items-center max-w-xs gap-2 px-6 py-3 mx-auto transition-colors bg-green-500 rounded-xl hover:bg-green-600 sm:max-w-none sm:mx-0"
                    >
                      <Plus className="w-5 h-5" />
                      Create Diet
                    </button>
                    <button
                      onClick={handleNavigateToDiet}
                      className="flex items-center max-w-xs gap-2 px-6 py-3 mx-auto transition-colors rounded-xl bg-secondary hover:bg-dark sm:max-w-none sm:mx-0"
                    >
                      <List className="w-5 h-5" />
                      Your Plans
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;