import { useState } from 'react';

const WorkoutPlanner = () => {
  const [workoutPlans, setWorkoutPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [formData, setFormData] = useState({
    age: '',
    gender: 'Select Gender',
    height: '',
    weight: '',
    goal: 'Lose Weight',
    medicalConditions: 'Injury/Recovery'
  });

  const exercises = [
    {
      id: 1,
      name: "Dumbbell Lateral Raise",
      sets: 2,
      reps: "8-10",
      rest: "60 sec"
    },
    {
      id: 2,
      name: "Seated Dumbbell Press",
      sets: 3,
      reps: "8-10",
      rest: "60 sec"
    },
    {
      id: 3,
      name: "Military Press",
      sets: 2,
      reps: "10-12",
      rest: "45 sec"
    },
    {
      id: 4,
      name: "Cable Face Pull",
      sets: 3,
      reps: "8-10",
      rest: "60 sec"
    },
    {
      id: 5,
      name: "Seated Arnold Press",
      sets: 2,
      reps: "10-12",
      rest: "45 sec"
    },
    {
      id: 6,
      name: "Leg Extension",
      sets: 3,
      reps: "10-12",
      rest: "60 sec"
    }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreatePlan = () => {
    const newPlan = {
      id: workoutPlans.length + 1,
      ...formData,
      exercises: exercises
    };
    setWorkoutPlans(prev => [...prev, newPlan]);
    setFormData({
      age: '',
      gender: 'Select Gender',
      height: '',
      weight: '',
      goal: 'Lose Weight',
      medicalConditions: 'Injury/Recovery'
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-6">
      <div className="max-w-7xl w-full grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Panel - Create Plan Form */}
        <div className="bg-dark rounded-lg p-6">
          <h2 className="text-red-500 text-lg mb-6">Create Your Workout Plan</h2>
          
          <div className="mb-6">
            <h3 className="text-red-500 text-sm mb-4">Personal Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-200 text-sm mb-2">Age</label>
                <input 
                  type="text"
                  name="age"
                  value={formData.age}
                  onChange={handleInputChange}
                  className="w-full bg-secondary border border-gray-700 rounded p-2 text-gray-200"
                />
              </div>
              <div>
                <label className="block text-200 text-sm mb-2">Gender</label>
                <select 
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="w-full bg-secondary border border-gray-700 rounded p-2 text-200 appearance-none"
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
                <label className="block text-200 text-sm mb-2">Height (cm)</label>
                <input 
                  type="text"
                  name="height"
                  value={formData.height}
                  onChange={handleInputChange}
                  className="w-full bg-secondary border border-gray-700 rounded p-2 text-gray-200"
                />
              </div>
              <div>
                <label className="block text-200 text-sm mb-2">Weight (kg)</label>
                <input 
                  type="text"
                  name="weight"
                  value={formData.weight}
                  onChange={handleInputChange}
                  className="w-full bg-secondary border border-gray-700 rounded p-2 text-gray-200"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-200 text-sm mb-2">Goal</label>
              <select 
                name="goal"
                value={formData.goal}
                onChange={handleInputChange}
                className="w-full bg-secondary border border-gray-700 rounded p-2 text-gray-200 appearance-none"
              >
                <option>Lose Weight</option>
                <option>Build Muscle</option>
                <option>Improve Fitness</option>
              </select>
            </div>
            <div>
              <label className="block text-200 text-sm mb-2">Medical Conditions</label>
              <select 
                name="medicalConditions"
                value={formData.medicalConditions}
                onChange={handleInputChange}
                className="w-full bg-secondary border border-gray-700 rounded p-2 text-gray-200 appearance-none"
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
        <div className="bg-dark rounded-lg p-6">
          {workoutPlans.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-400">You currently don't have workout plans</p>
            </div>
          ) : (
            <div className="space-y-4">
              {workoutPlans.map(plan => (
                <div key={plan.id} className="flex justify-between items-center bg-secondary rounded-lg p-4">
                  <span className="text-gray-200">Workout Plan {plan.id}</span>
                  <button 
                    onClick={() => setSelectedPlan(plan.id)}
                    className="bg-red-500 px-4 py-1 rounded text-sm hover:bg-red-600 text-white"
                  >
                    View
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Section - Exercise Details */}
      {selectedPlan && (
        <div className="bg-dark rounded-lg p-8 mt-10 max-w-7xl w-full min-h-[700px]">
          <h3 className="text-2xl font-semibold mb-8 text-gray-200">
            Workout Plan {selectedPlan}
          </h3>
          <div className="space-y-6">
            {exercises.map((exercise, index) => (
              <div key={exercise.id} className="border-b border-gray-700 pb-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-red-500 text-sm">Exercise {index + 1}</p>
                    <h4 className="font-medium text-gray-200">{exercise.name}</h4>
                    <button className="text-red-500 text-sm mt-1">
                      View Details &gt;
                    </button>
                  </div>
                  <div className="flex gap-6 text-sm text-right">
                    <div>
                      <br />
                      <p className="font-bold text-gray-200">{exercise.sets}</p>
                      <p className="text-gray-400">Sets</p>
                    </div>
                    <div>
                      <br />
                      <p className="font-bold text-gray-200">{exercise.reps}</p>
                      <p className="text-gray-400">Reps</p>
                    </div>
                    <div>
                      <br />
                      <p className="font-bold text-gray-200">{exercise.rest}</p>
                      <p className="text-gray-400">Rest</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkoutPlanner;
