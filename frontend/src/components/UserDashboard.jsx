import { Plus, List } from 'lucide-react';
import dashboardWorkoutImage from '../assets/ud-workout.jpg';
import dashboardDietImage from '../assets/ud-diet.jpg';

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gray-900">
      <div className="px-6 py-8">
        <div className="mx-auto max-w-7xl">
          <h1 className="mb-2 text-3xl font-bold text-white md:text-4xl">
            Welcome to BodySync, <span className="text-red-500">Upali!</span>
          </h1>
          <p className="mb-8 text-gray-400">Manage and customize your workout and diet plans</p>
0
          {/* Main Grid */}
          <div className="grid gap-8 mb-12 md:grid-cols-2">
            {/* Workout Section */}
            <div className="overflow-hidden bg-gray-800 rounded-2xl">
              <div className="relative h-48 overflow-hidden">
                <img
                  src={dashboardWorkoutImage}
                  alt="Workout"
                  className="object-cover w-full h-full brightness-50"
                />
                <div className="absolute inset-0 flex flex-col justify-end p-6 bg-gradient-to-t from-gray-900/90">
                  <h2 className="mb-4 text-2xl font-bold text-white">Workout Plans</h2>
                  <div className="flex gap-4">
                    <button className="flex items-center gap-2 px-4 py-2 text-white transition-colors bg-red-500 hover:bg-red-600 rounded-xl">
                      <Plus className="w-5 h-5" />
                      Create Workout
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 text-white transition-colors bg-gray-700 hover:bg-gray-600 rounded-xl">
                      <List className="w-5 h-5" />
                      Your Plan
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Diet Section */}
            <div className="overflow-hidden bg-gray-800 rounded-2xl">
              <div className="relative h-48 overflow-hidden">
                <img
                  src={dashboardDietImage}
                  alt="Diet"
                  className="object-cover w-full h-full brightness-50"
                />
                <div className="absolute inset-0 flex flex-col justify-end p-6 bg-gradient-to-t from-gray-900/90">
                  <h2 className="mb-4 text-2xl font-bold text-white">Diet Plans</h2>
                  <div className="flex gap-4">
                    <button className="flex items-center gap-2 px-4 py-2 text-white transition-colors bg-green-500 hover:bg-green-600 rounded-xl">
                      <Plus className="w-5 h-5" />
                      Create Diet
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 text-white transition-colors bg-gray-700 hover:bg-gray-600 rounded-xl">
                      <List className="w-5 h-5" />
                      Your Plan
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