import { useState, useEffect, useRef } from 'react';
import { Info, Play, BookOpen, CheckCircle } from 'lucide-react';
import api from '../../config/api';

const ExerciseDetailModal = ({ exercise, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-60">
      <div className="w-full max-w-md p-6 rounded-lg shadow-2xl bg-dark">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-red-500">{exercise.name}</h3>
          <button 
            onClick={onClose} 
            className="text-gray-400 transition-colors hover:text-white"
          >
            ✕
          </button>
        </div>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <BookOpen className="text-red-500" size={20} />
            <p className="text-gray-300">Category: {exercise.category}</p>
          </div>
          <div className="flex items-center gap-3">
            <Info className="text-red-500" size={20} />
            <p className="text-gray-300">Muscle Group: {exercise.muscleGroup || 'Not specified'}</p>
          </div>
          <div className="flex items-center gap-3">
            <Play className="text-red-500" size={20} />
            <p className="text-gray-300">Recommended: 3 Sets, 10-12 Reps</p>
          </div>
          <a 
            href={`/exercises/${exercise._id}`}
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-center w-full py-2 text-white transition-colors bg-red-500 rounded hover:bg-red-600"
          >
            <CheckCircle className="mr-2" size={20} />
            View Exercise Details
          </a>
        </div>
      </div>
    </div>
  );
};

const WorkoutPlanner = () => {
  const [workoutPlans, setWorkoutPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [formData, setFormData] = useState({
    age: '',
    gender: 'Select Gender',
    height: '',
    weight: '',
    goal: 'Lose Weight',
    medicalConditions: 'Injury/Recovery'
  });
  const [formErrors, setFormErrors] = useState({});
  const [planToDelete, setPlanToDelete] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const detailsRef = useRef(null);

  useEffect(() => {
    const fetchWorkoutPlans = async () => {
      try {
        const response = await api.get('/users/workouts');
        setWorkoutPlans(response.data);
      } catch (error) {
        console.error('Failed to fetch workout plans:', error);
      }
    };
    fetchWorkoutPlans();
  }, []);

  useEffect(() => {
    if (selectedPlan && detailsRef.current) {
      detailsRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedPlan]);

  const validateForm = () => {
    const errors = {};

    // Validate Age
    if (!formData.age.trim()) {
      errors.age = 'Age is required';
    } else if (isNaN(formData.age) || parseInt(formData.age) <= 0) {
      errors.age = 'Please enter a valid age';
    }

    // Validate Gender
    if (formData.gender === 'Select Gender') {
      errors.gender = 'Gender is required';
    }

    // Validate Height
    if (!formData.height.trim()) {
      errors.height = 'Height is required';
    } else if (isNaN(formData.height) || parseInt(formData.height) <= 0) {
      errors.height = 'Please enter a valid height';
    }

    // Validate Weight
    if (!formData.weight.trim()) {
      errors.weight = 'Weight is required';
    } else if (isNaN(formData.weight) || parseInt(formData.weight) <= 0) {
      errors.weight = 'Please enter a valid weight';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear specific error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = {...prev};
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleCreatePlan = async () => {
    if (validateForm()) {
      try {
        const creationResponse = await api.post('/users/workouts/generate', formData);
        const { data: fullPlan } = await api.get(`/users/workouts/${creationResponse.data._id}`);
        
        setWorkoutPlans(prev => [...prev, fullPlan]);
        
        // Reset form
        setFormData({
          age: '',
          gender: 'Select Gender',
          height: '',
          weight: '',
          goal: 'Lose Weight',
          medicalConditions: 'Injury/Recovery'
        });
        setFormErrors({});
      } catch (error) {
        console.error('Failed to create workout plan:', error);
      }
    }
  };

  const handleDeletePlan = async () => {
    if (!planToDelete) return;

    try {
      await api.delete(`/users/workouts/${planToDelete}`);
      setWorkoutPlans(prev => prev.filter(plan => plan._id !== planToDelete));
      if (selectedPlan === planToDelete) {
        setSelectedPlan(null);
        setSelectedDay(null);
      }
    } catch (error) {
      console.error('Failed to delete workout plan:', error);
    } finally {
      setShowDeleteModal(false);
      setPlanToDelete(null);
    }
  };

  const selectedPlanDetails = workoutPlans.find(plan => plan._id === selectedPlan);

  return (
    <div className="flex flex-col items-center min-h-screen p-6">
      {/* Left Panel - Create Plan Form */}
      <div className="grid w-full grid-cols-1 gap-6 max-w-7xl md:grid-cols-2">
        <div className="p-6 rounded-lg bg-dark">
          <h2 className="mb-6 text-lg text-red-500">Create Your Workout Plan</h2>
          
          <div className="mb-6">
            <h3 className="mb-4 text-sm text-red-500">Personal Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-2 text-sm text-200">Age</label>
                <input 
                  type="text"
                  name="age"
                  value={formData.age}
                  onChange={handleInputChange}
                  className={`w-full p-2 text-gray-200 border rounded bg-secondary ${
                    formErrors.age ? 'border-red-500' : 'border-gray-700'
                  }`}
                />
                {formErrors.age && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.age}</p>
                )}
              </div>
              <div>
                <label className="block mb-2 text-sm text-200">Gender</label>
                <select 
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className={`w-full p-2 border rounded appearance-none bg-secondary text-200 ${
                    formErrors.gender ? 'border-red-500' : 'border-gray-700'
                  }`}
                >
                  <option>Select Gender</option>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
                {formErrors.gender && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.gender}</p>
                )}
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="mb-4 text-sm text-red-500">Health Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-2 text-sm text-200">Height (cm)</label>
                <input 
                  type="text"
                  name="height"
                  value={formData.height}
                  onChange={handleInputChange}
                  className={`w-full p-2 text-gray-200 border rounded bg-secondary ${
                    formErrors.height ? 'border-red-500' : 'border-gray-700'
                  }`}
                />
                {formErrors.height && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.height}</p>
                )}
              </div>
              <div>
                <label className="block mb-2 text-sm text-200">Weight (kg)</label>
                <input 
                  type="text"
                  name="weight"
                  value={formData.weight}
                  onChange={handleInputChange}
                  className={`w-full p-2 text-gray-200 border rounded bg-secondary ${
                    formErrors.weight ? 'border-red-500' : 'border-gray-700'
                  }`}
                />
                {formErrors.weight && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.weight}</p>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block mb-2 text-sm text-200">Goal</label>
              <select 
                name="goal"
                value={formData.goal}
                onChange={handleInputChange}
                className="w-full p-2 text-gray-200 border border-gray-700 rounded appearance-none bg-secondary"
              >
                <option>Lose Weight</option>
                <option>Build Muscle</option>
                <option>Improve Fitness</option>
              </select>
            </div>
            <div>
              <label className="block mb-2 text-sm text-200">Medical Conditions</label>
              <select 
                name="medicalConditions"
                value={formData.medicalConditions}
                onChange={handleInputChange}
                className="w-full p-2 text-gray-200 border border-gray-700 rounded appearance-none bg-secondary"
              >
                <option>Injury/Recovery</option>
                <option>None</option>
                <option>Other</option>
              </select>
            </div>
          </div>

          <button 
            onClick={handleCreatePlan}
            className="w-full py-2 text-white transition-colors bg-red-500 rounded hover:bg-red-600"
          >
            Create Plan
          </button>
        </div>

        {/* Right Panel - Workout Plans List */}
        <div className="p-6 rounded-lg bg-dark">
          {workoutPlans.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-400">You currently don't have workout plans</p>
            </div>
          ) : (
            <div className="space-y-1">
              {workoutPlans.map((plan, index) => (
                <div key={plan._id} className="flex items-center justify-between p-4 rounded-lg bg-secondary">
                  <span className="text-200">Workout Plan {index + 1}</span>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        setSelectedPlan(plan._id);
                        setSelectedDay(plan.days?.[0] || null);
                      }}
                      className="px-4 py-1 text-sm text-white bg-red-500 rounded hover:bg-red-600"
                    >
                      View
                    </button>
                    <button 
                      onClick={() => {
                        setPlanToDelete(plan._id);
                        setShowDeleteModal(true);
                      }}
                      className="px-4 py-1 text-sm text-white bg-gray-700 rounded hover:bg-gray-800"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Workout Plan Details Section */}
      {selectedPlanDetails && (
        <div ref={detailsRef} className="w-full p-8 mt-10 rounded-lg bg-dark max-w-7xl">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-semibold text-gray-200">
              {selectedPlanDetails.name}
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Info size={16} />
              <span>Personalized Workout Plan</span>
            </div>
          </div>
          
          {/* Day Selection Row */}
          <div className="flex mb-6 space-x-4 overflow-x-auto">
            {selectedPlanDetails.days?.map((day, index) => (
              <button
                key={index}
                onClick={() => setSelectedDay(day)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedDay === day 
                    ? 'bg-red-500 text-white' 
                    : 'bg-secondary text-gray-300 hover:bg-gray-700'
                }`}
              >
                Day {day.day}
              </button>
            ))}
          </div>

          {/* Exercises Display */}
          {selectedDay && (
            <div className="p-6 border border-gray-700 rounded-lg shadow-md bg-secondary">
              <h4 className="flex items-center mb-4 text-lg font-semibold text-red-500">
                <span className="flex items-center justify-center w-8 h-8 mr-3 text-white bg-red-500 rounded-full">
                  {selectedDay.day}
                </span>
                Workout Details
              </h4>
              <div className="space-y-4">
                {selectedDay.exercises?.map((exercise, exerciseIndex) => (
                  <div 
                    key={exerciseIndex} 
                    className="flex items-center justify-between p-4 transition-colors rounded-lg bg-dark hover:bg-gray-800"
                  >
                    <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-10 h-10 text-white bg-red-500 rounded-full">
                        {exerciseIndex + 1}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-200">{exercise.name}</h4>
                        <p className="text-sm text-gray-400">{exercise.category}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="font-bold text-gray-200">3 Sets</p>
                        <p className="text-sm text-gray-400">10-12 Reps</p>
                      </div>
                      <button 
                        onClick={() => setSelectedExercise(exercise)}
                        className="px-4 py-2 text-sm text-white transition-colors bg-red-500 rounded hover:bg-red-600"
                      >
                        View Exercise
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="w-full max-w-md p-6 rounded-lg bg-dark">
            <h3 className="mb-4 text-xl font-semibold text-gray-200">Delete Workout Plan</h3>
            <p className="mb-6 text-gray-400">
              Are you sure you want to delete this workout plan? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-sm text-gray-200 bg-gray-700 rounded hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleDeletePlan}
                className="px-4 py-2 text-sm text-white bg-red-500 rounded hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Exercise Detail Modal */}
      {selectedExercise && (
        <ExerciseDetailModal 
          exercise={selectedExercise} 
          onClose={() => setSelectedExercise(null)} 
        />
      )}
    </div>
  );
};

export default WorkoutPlanner;