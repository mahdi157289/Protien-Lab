import { useState, useEffect, useRef } from 'react';
import { Clock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../config/api';

const DietPlanner = () => {
  const [dietPlans, setDietPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [planToDelete, setPlanToDelete] = useState(null);
  const mealPlanDetailsRef = useRef(null);
  const [formData, setFormData] = useState({
    age: '',
    gender: 'Select Gender',
    height: '',
    weight: '',
    activityLevel: 'Sedentary',
    goal: 'Weight Loss'
  });
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      fetchUserDietPlans();
    }
  }, [isAuthenticated]);

  // All existing functions remain the same until handleViewPlan
  const validateForm = () => {
    const newErrors = {};

    if (!formData.age) {
      newErrors.age = 'Age is required';
    } else if (isNaN(formData.age) || formData.age < 10 || formData.age > 100) {
      newErrors.age = 'Please enter a valid age between 10 and 100';
    }

    if (formData.gender === 'Select Gender') {
      newErrors.gender = 'Please select a gender';
    }

    if (!formData.height) {
      newErrors.height = 'Height is required';
    } else if (isNaN(formData.height) || formData.height < 120 || formData.height > 250) {
      newErrors.height = 'Please enter a valid height between 120 and 250 cm';
    }

    if (!formData.weight) {
      newErrors.weight = 'Weight is required';
    } else if (isNaN(formData.weight) || formData.weight < 30 || formData.weight > 300) {
      newErrors.weight = 'Please enter a valid weight between 30 and 300 kg';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const fetchUserDietPlans = async () => {
    try {
      const response = await api.get('/diet-plans/all');
      setDietPlans(response.data.data.plans);
    } catch (error) {
      console.error('Error fetching diet plans:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleCreatePlan = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.post('/diet-plans/generate', formData);
      setDietPlans([...dietPlans, response.data.data]);
      setFormData({
        age: '',
        gender: 'Select Gender',
        height: '',
        weight: '',
        activityLevel: 'Sedentary',
        goal: 'Weight Loss'
      });
      setErrors({});
    } catch (error) {
      console.error('Error creating diet plan:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewPlan = async (planId) => {
    try {
      const response = await api.get(`/diet-plans/${planId}`);
      setSelectedPlan(response.data.data);
      // Smooth scroll to meal plan details after a short delay
      setTimeout(() => {
        mealPlanDetailsRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (error) {
      console.error('Error fetching diet plan details:', error);
    }
  };

  const handleDeletePlan = async () => {
    if (planToDelete) {
      try {
        await api.delete(`/diet-plans/${planToDelete}`);
        setDietPlans(dietPlans.filter(plan => plan._id !== planToDelete));
        if (selectedPlan && selectedPlan._id === planToDelete) {
          setSelectedPlan(null);
        }
      } catch (error) {
        console.error('Error deleting diet plan:', error);
      } finally {
        setShowDeleteModal(false);
        setPlanToDelete(null);
      }
    }
  };

  const openDeleteModal = (planId) => {
    setPlanToDelete(planId);
    setShowDeleteModal(true);
  };

  return (
    <div className="flex flex-col items-center min-h-[calc(100vh-5rem)] p-6">
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center p-4 bg-black bg-opacity-80">
          <div className="w-full max-w-md p-6 rounded-lg bg-dark">
            <div className="text-center">
                <h3 className="mb-2 text-lg font-semibold">
                Delete Diet Plan
                </h3>
                <p className="mb-6 ">
                Are you sure you want to delete this diet plan? This action cannot be undone.
                </p>
                <div className="flex justify-center gap-4">
                <button
                    onClick={() => setShowDeleteModal(false)}
                    className="px-4 py-2 rounded-lg bg-secondary hover:bg-opacity-90"
                >
                    Cancel
                </button>
                <button
                    onClick={handleDeletePlan}
                    className="px-4 py-2 rounded-lg bg-primary hover:bg-opacity-90"
                >
                    Delete
                </button>
                </div>
            </div>
          </div>
      </div>
      )}

      {/* Rest of the component remains the same until the diet plans list */}
      <div className="grid w-full grid-cols-1 gap-6 max-w-7xl md:grid-cols-2">
        {/* Left Panel - Create Plan Form */}
        <div className="p-6 rounded-lg bg-dark">
          {/* Form content remains exactly the same */}
          <h2 className="mb-6 text-lg text-red-500">Create Your Diet Plan</h2>

          <div className="mb-6">
            <h3 className="mb-4 text-sm text-red-500">Personal Profile</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-2 text-sm text">Age</label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleInputChange}
                  className={`w-full p-2 text-gray-200 border rounded bg-secondary ${
                    errors.age ? 'border-red-500' : 'border-gray-700'
                  }`}
                />
                {errors.age && (
                  <p className="mt-1 text-xs text-red-500">{errors.age}</p>
                )}
              </div>
              <div>
                <label className="block mb-2 text-sm text-200">Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className={`w-full p-2 border rounded appearance-none bg-secondary text-200 ${
                    errors.gender ? 'border-red-500' : 'border-gray-700'
                  }`}
                >
                  <option>Select Gender</option>
                  <option>Male</option>
                  <option>Female</option>
                </select>
                {errors.gender && (
                  <p className="mt-1 text-xs text-red-500">{errors.gender}</p>
                )}
              </div>
              <div>
                <label className="block mb-2 text-sm text-200">Height (cm)</label>
                <input
                  type="number"
                  name="height"
                  value={formData.height}
                  onChange={handleInputChange}
                  className={`w-full p-2 border rounded bg-secondary text-200 ${
                    errors.height ? 'border-red-500' : 'border-gray-700'
                  }`}
                />
                {errors.height && (
                  <p className="mt-1 text-xs text-red-500">{errors.height}</p>
                )}
              </div>
              <div>
                <label className="block mb-2 text-sm text-200">Weight (kg)</label>
                <input
                  type="number"
                  name="weight"
                  value={formData.weight}
                  onChange={handleInputChange}
                  className={`w-full p-2 border rounded bg-secondary text-200 ${
                    errors.weight ? 'border-red-500' : 'border-gray-700'
                  }`}
                />
                {errors.weight && (
                  <p className="mt-1 text-xs text-red-500">{errors.weight}</p>
                )}
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="mb-4 text-sm text-red-500">Lifestyle and Fitness Goals</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-2 text-sm text-200">Activity Level</label>
                <select
                  name="activityLevel"
                  value={formData.activityLevel}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-700 rounded appearance-none bg-secondary text-200"
                >
                  <option>Sedentary</option>
                  <option>Moderate</option>
                  <option>Active</option>
                </select>
              </div>
              <div>
                <label className="block mb-2 text-sm text-200">Goal</label>
                <select
                  name="goal"
                  value={formData.goal}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-700 rounded appearance-none bg-secondary text-200"
                >
                  <option>Weight Loss</option>
                  <option>Weight Gain</option>
                  <option>Maintenance</option>
                </select>
              </div>
            </div>
          </div>

          <button
            onClick={handleCreatePlan}
            disabled={isSubmitting}
            className={`w-full py-2 text-white transition-colors rounded ${
              isSubmitting 
                ? 'bg-red-400 cursor-not-allowed' 
                : 'bg-red-500 hover:bg-red-600'
            }`}
          >
            {isSubmitting ? 'Creating Plan...' : 'Create Plan'}
          </button>

          {Object.keys(errors).length > 0 && (
            <div className="p-3 mt-4 text-sm text-red-500 border border-red-500 rounded">
              Please fix the errors above before submitting.
            </div>
          )}
        </div>

        {/* Right Panel - Diet Plans List */}
        <div className="p-6 rounded-lg bg-dark">
          {dietPlans.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-400">You currently don&apos;t have diet plans</p>
            </div>
          ) : (
            <div className="space-y-1">
              {dietPlans.map((plan, index) => (
                <div key={plan._id} className="flex items-center justify-between p-4 rounded-lg bg-secondary">
                  <span className="text-200">Diet Plan {index + 1}</span>
                  <div>
                    <button
                      onClick={() => handleViewPlan(plan._id)}
                      className="px-4 py-2 text-sm text-white rounded bg-primary hover:bg-red-600"
                    >
                      View
                    </button>
                    <button
                      onClick={() => openDeleteModal(plan._id)}
                      className="px-4 py-2 ml-2 text-sm text-white rounded bg-gray-700 hover:bg-red-600"
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

      {/* Bottom Section - Meal Plan Details */}
      {selectedPlan && (
        <div ref={mealPlanDetailsRef} className="w-full mt-8 max-w-7xl">
          <h2 className="mb-6 text-2xl font-semibold">Your Meal Plan Details</h2>

          {/* Meal Cards */}
          <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-3">
            {Object.entries(selectedPlan.dietPlanId.meals).map(([key, meal]) => {
              const mealTimings = {
                breakfast: '8:00 AM',
                lunch: '1:00 PM',
                dinner: '8:00 PM'
              };

              return (
                <div key={key} className="flex flex-col rounded-lg bg-dark">
                  <div className="flex-1 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold">{meal.title}</h3>
                      <div className="flex items-center text-primary/80">
                        <Clock className="w-4 h-4 mr-1" />
                        <span className="text-sm">{meal.items.length} items</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {meal.items.map((item, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-700">→ {item.name}</span>
                          <span className="text-500">{item.amount}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="p-3 mt-auto rounded-lg bg-primary/20">
                    <p className="text-sm text-accent/80">
                      Recommended timing: {mealTimings[key.toLowerCase()]}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Nutrition Summary */}
          <div className="p-6 rounded-lg bg-dark">
            <h3 className="mb-6 text-2xl font-semibold text-center">Daily Nutrition Summary</h3>
            <div className="grid grid-cols-2 gap-6 py-2 rounded-lg md:grid-cols-4 bg-primary/20">
              <div className="text-center">
                <p className="text-accent/80">Calories</p>
                <p className="mt-2 text-2xl font-semibold">{selectedPlan.dietPlanId.nutritionSummary.calories}</p>
              </div>
              <div className="text-center">
                <p className="text-accent/80">Protein</p>
                <p className="mt-2 text-2xl font-semibold">{selectedPlan.dietPlanId.nutritionSummary.protein}</p>
              </div>
              <div className="text-center">
                <p className="text-accent/80">Carbs</p>
                <p className="mt-2 text-2xl font-semibold">{selectedPlan.dietPlanId.nutritionSummary.carbs}</p>
              </div>
              <div className="text-center">
                <p className="text-accent/80">Fats</p>
                <p className="mt-2 text-2xl font-semibold">{selectedPlan.dietPlanId.nutritionSummary.fats}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DietPlanner;