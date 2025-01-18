import { useState } from 'react';
import { ChevronDown, ChevronUp, Clock, Dumbbell, RotateCcw } from 'lucide-react';

const WorkoutPlanner = () => {
  const [workoutPlans, setWorkoutPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [expandedExercise, setExpandedExercise] = useState(null);
  const [formData, setFormData] = useState({
    age: '',
    gender: 'Select Gender',
    height: '',
    weight: '',
    goal: 'Lose Weight',
    medicalConditions: 'Injury/Recovery'
  });

  const exercises = [
    { id: 1, name: "Dumbbell Lateral Raise", sets: 2, reps: "8-10", rest: "60 sec" },
    { id: 2, name: "Seated Dumbbell Press", sets: 3, reps: "8-10", rest: "60 sec" },
    { id: 3, name: "Military Press", sets: 2, reps: "10-12", rest: "45 sec" },
    { id: 4, name: "Cable Face Pull", sets: 3, reps: "8-10", rest: "60 sec" },
    { id: 5, name: "Seated Arnold Press", sets: 2, reps: "10-12", rest: "45 sec" },
    { id: 6, name: "Leg Extension", sets: 3, reps: "10-12", rest: "60 sec" }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreatePlan = () => {
    const newPlan = {
      id: workoutPlans.length + 1,
      ...formData,
      exercises: exercises
    };
    setWorkoutPlans((prev) => [...prev, newPlan]);
    setFormData({
      age: '',
      gender: 'Select Gender',
      height: '',
      weight: '',
      goal: 'Lose Weight',
      medicalConditions: 'Injury/Recovery'
    });
  };

  const toggleExercise = (id) => {
    setExpandedExercise(expandedExercise === id ? null : id);
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-6 ">
      <div className="max-w-7xl w-full space-y-6">
        {/* Top Grid - Form and Plans */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Panel - Create Plan Form */}
          <div className="bg-[#1C1C1C] rounded-lg p-6">
            <h2 className="text-red-500 text-lg mb-6">Create Your Workout Plan</h2>
            
            <div className="mb-6">
              <h3 className="text-red-500 text-sm mb-4">Personal Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-2 text-gray-300">Age</label>
                  <input 
                    type="text"
                    name="age"
                    value={formData.age}
                    onChange={handleInputChange}
                    className="w-full bg-[#2A2A2A] border border-gray-700 rounded p-2 text-gray-200"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-2 text-gray-300">Gender</label>
                  <select 
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="w-full bg-[#2A2A2A] border border-gray-700 rounded p-2 text-gray-200"
                  >
                    <option>Select Gender</option>
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-red-500 text-sm mb-4">Health Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-2 text-gray-300">Height (cm)</label>
                  <input 
                    type="text"
                    name="height"
                    value={formData.height}
                    onChange={handleInputChange}
                    className="w-full bg-[#2A2A2A] border border-gray-700 rounded p-2 text-gray-200"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-2 text-gray-300">Weight (kg)</label>
                  <input 
                    type="text"
                    name="weight"
                    value={formData.weight}
                    onChange={handleInputChange}
                    className="w-full bg-[#2A2A2A] border border-gray-700 rounded p-2 text-gray-200"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm mb-2 text-gray-300">Goal</label>
                <select 
                  name="goal"
                  value={formData.goal}
                  onChange={handleInputChange}
                  className="w-full bg-[#2A2A2A] border border-gray-700 rounded p-2 text-gray-200"
                >
                  <option>Lose Weight</option>
                  <option>Build Muscle</option>
                  <option>Improve Fitness</option>
                </select>
              </div>
              <div>
                <label className="block text-sm mb-2 text-gray-300">Medical Conditions</label>
                <select 
                  name="medicalConditions"
                  value={formData.medicalConditions}
                  onChange={handleInputChange}
                  className="w-full bg-[#2A2A2A] border border-gray-700 rounded p-2 text-gray-200"
                >
                  <option>Injury/Recovery</option>
                  <option>None</option>
                  <option>Other</option>
                </select>
              </div>
            </div>

            <button 
              onClick={handleCreatePlan}
              className="w-full bg-red-500 text-white rounded py-2 hover:bg-red-600 transition-colors"
            >
              Create Plan
            </button>
          </div>

          {/* Right Panel - Workout Plans List */}
          <div className="bg-[#1C1C1C] rounded-lg p-6">
            <h2 className="text-red-500 text-lg mb-6">Your Workout Plans</h2>
            {workoutPlans.length === 0 ? (
              <div className="flex items-center justify-center h-full min-h-[200px]">
                <p className="text-gray-400">You currently don't have workout plans</p>
              </div>
            ) : (
              <div className="space-y-4">
                {workoutPlans.map(plan => (
                  <div key={plan.id} className="flex justify-between items-center bg-[#2A2A2A] rounded-lg p-4 hover:bg-[#333333] transition-colors">
                    <div className="flex flex-col">
                      <span className="text-gray-200">Workout Plan {plan.id}</span>
                      <span className="text-gray-400 text-sm">Goal: {plan.goal}</span>
                    </div>
                    <button 
                      onClick={() => setSelectedPlan(plan.id)}
                      className={`px-4 py-1 rounded text-sm transition-colors ${
                        selectedPlan === plan.id 
                          ? 'bg-red-600 text-white' 
                          : 'bg-red-500 hover:bg-red-600 text-white'
                      }`}
                    >
                      {selectedPlan === plan.id ? 'Selected' : 'View'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Section - Exercise Details */}
        {selectedPlan && (
          <div className="bg-[#1C1C1C] rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-red-500 text-xl font-semibold">Workout Plan {selectedPlan} - Exercises</h2>
              <div className="flex items-center space-x-4">
                <span className="text-gray-400 text-sm">Total Exercises: {exercises.length}</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {exercises.map((exercise) => (
                <div
                  key={exercise.id}
                  className="bg-[#2A2A2A] rounded-lg overflow-hidden transition-all duration-200 hover:bg-[#333333]"
                >
                  <div 
                    className="p-4 flex justify-between items-center cursor-pointer"
                    onClick={() => toggleExercise(exercise.id)}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="bg-red-500/10 p-2 rounded-lg">
                        <Dumbbell className="text-red-500" size={24} />
                      </div>
                      <span className="text-gray-200 font-medium">{exercise.name}</span>
                    </div>
                    {expandedExercise === exercise.id ? (
                      <ChevronUp className="text-gray-400" size={20} />
                    ) : (
                      <ChevronDown className="text-gray-400" size={20} />
                    )}
                  </div>
                  
                  {expandedExercise === exercise.id && (
                    <div className="px-4 pb-4 pt-2 border-t border-gray-700">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="flex items-center space-x-3 bg-[#222222] p-3 rounded-lg">
                          <RotateCcw className="text-red-500" size={18} />
                          <div className="flex flex-col">
                            <span className="text-gray-400 text-sm">Sets</span>
                            <span className="text-gray-200">{exercise.sets}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3 bg-[#222222] p-3 rounded-lg">
                          <Dumbbell className="text-red-500" size={18} />
                          <div className="flex flex-col">
                            <span className="text-gray-400 text-sm">Reps</span>
                            <span className="text-gray-200">{exercise.reps}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3 bg-[#222222] p-3 rounded-lg">
                          <Clock className="text-red-500" size={18} />
                          <div className="flex flex-col">
                            <span className="text-gray-400 text-sm">Rest</span>
                            <span className="text-gray-200">{exercise.rest}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkoutPlanner;