import { useState, useEffect, useRef } from 'react';
import { Clock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../config/api';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();

  useEffect(() => {
    if (isAuthenticated) {
      fetchUserDietPlans();
    }
  }, [isAuthenticated]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.age) {
      newErrors.age = t('diet_error_age_required');
    } else if (isNaN(formData.age) || formData.age < 10 || formData.age > 100) {
      newErrors.age = t('diet_error_age_valid');
    }

    if (formData.gender === 'Select Gender') {
      newErrors.gender = t('diet_error_gender_required');
    }

    if (!formData.height) {
      newErrors.height = t('diet_error_height_required');
    } else if (isNaN(formData.height) || formData.height < 120 || formData.height > 250) {
      newErrors.height = t('diet_error_height_valid');
    }

    if (!formData.weight) {
      newErrors.weight = t('diet_error_weight_required');
    } else if (isNaN(formData.weight) || formData.weight < 30 || formData.weight > 300) {
      newErrors.weight = t('diet_error_weight_valid');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const fetchUserDietPlans = async () => {
    try {
      const response = await api.get('/api/diet-plans/all');
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
      const response = await api.post('/api/diet-plans/generate', formData);
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
      const response = await api.get(`/api/diet-plans/${planId}`);
      setSelectedPlan(response.data.data);
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
        await api.delete(`/api/diet-plans/${planToDelete}`);
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
                  {t('diet_delete_title')}
                </h3>
                <p className="mb-6 ">
                  {t('diet_delete_confirm')}
                </p>
                <div className="flex justify-center gap-10">
                <button
                    onClick={() => setShowDeleteModal(false)}
                    className="px-8 py-2 transition border rounded-lg text-primary bg-secondary hover:bg-dark border-primary"
                >
                    {t('diet_cancel')}
                </button>
                <button
                    onClick={handleDeletePlan}
                    className="px-8 py-2 transition border rounded-lg border-primary bg-primary hover:bg-green-600"
                >
                    {t('diet_delete')}
                </button>
                </div>
            </div>
          </div>
      </div>
      )}

      <div className="grid w-full grid-cols-1 gap-6 max-w-7xl md:grid-cols-2">
        {/* Left Panel - Create Plan Form */}
        <div className="p-6 rounded-lg bg-dark">
          <h2 className="mb-6 text-lg #40ee45">{t('diet_create_title')}</h2>

          <div className="mb-6">
            <h3 className="mb-4 text-sm #40ee45">{t('diet_personal_profile')}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-2 text-sm text">{t('diet_age')}</label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleInputChange}
                  className={`w-full p-2 text-gray-200 border rounded bg-secondary ${
                    errors.age ? 'border-green-500' : 'border-gray-700'
                  }`}
                />
                {errors.age && (
                  <p className="mt-1 text-xs #40ee45">{errors.age}</p>
                )}
              </div>
              <div>
                <label className="block mb-2 text-sm text-200">{t('diet_gender')}</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className={`w-full p-2 border rounded appearance-none bg-secondary text-200 ${
                    errors.gender ? 'border-green-500' : 'border-gray-700'
                  }`}
                >
                  <option>{t('diet_select_gender')}</option>
                  <option>{t('diet_gender_male')}</option>
                  <option>{t('diet_gender_female')}</option>
                </select>
                {errors.gender && (
                  <p className="mt-1 text-xs #40ee45">{errors.gender}</p>
                )}
              </div>
              <div>
                <label className="block mb-2 text-sm text-200">{t('diet_height')}</label>
                <input
                  type="number"
                  name="height"
                  value={formData.height}
                  onChange={handleInputChange}
                  className={`w-full p-2 border rounded bg-secondary text-200 ${
                    errors.height ? 'border-green-500' : 'border-gray-700'
                  }`}
                />
                {errors.height && (
                  <p className="mt-1 text-xs #40ee45">{errors.height}</p>
                )}
              </div>
              <div>
                <label className="block mb-2 text-sm text-200">{t('diet_weight')}</label>
                <input
                  type="number"
                  name="weight"
                  value={formData.weight}
                  onChange={handleInputChange}
                  className={`w-full p-2 border rounded bg-secondary text-200 ${
                    errors.weight ? 'border-green-500' : 'border-gray-700'
                  }`}
                />
                {errors.weight && (
                  <p className="mt-1 text-xs #40ee45">{errors.weight}</p>
                )}
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="mb-4 text-sm #40ee45">{t('diet_lifestyle_goals')}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-2 text-sm text-200">{t('diet_activity_level')}</label>
                <select
                  name="activityLevel"
                  value={formData.activityLevel}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-700 rounded appearance-none bg-secondary text-200"
                >
                  <option>{t('diet_activity_sedentary')}</option>
                  <option>{t('diet_activity_moderate')}</option>
                  <option>{t('diet_activity_active')}</option>
                </select>
              </div>
              <div>
                <label className="block mb-2 text-sm text-200">{t('diet_goal')}</label>
                <select
                  name="goal"
                  value={formData.goal}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-700 rounded appearance-none bg-secondary text-200"
                >
                  <option>{t('diet_goal_loss')}</option>
                  <option>{t('diet_goal_gain')}</option>
                  <option>{t('diet_goal_maintain')}</option>
                </select>
              </div>
            </div>
          </div>

          <button
            onClick={handleCreatePlan}
            disabled={isSubmitting}
            className={`w-full py-2 text-white transition-colors rounded ${
              isSubmitting 
                ? 'bg-green-400 cursor-not-allowed' 
                : 'bg-green-500 hover:bg-green-600'
            }`}
          >
            {isSubmitting ? t('diet_creating_plan') : t('diet_create_btn')}
          </button>

          {Object.keys(errors).length > 0 && (
            <div className="p-3 mt-4 text-sm #40ee45 border border-green-500 rounded">
              {t('diet_fix_errors')}
            </div>
          )}
        </div>

        {/* Right Panel - Diet Plans List */}
        <div className="p-6 rounded-lg bg-dark">
          {dietPlans.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-400">{t('diet_no_plans')}</p>
            </div>
          ) : (
            <div className="space-y-1">
              {dietPlans.map((plan, index) => (
                <div key={plan._id} className="flex items-center justify-between p-4 rounded-lg bg-secondary">
                  <span className="text-200">{t('diet_plan')} {index + 1}</span>
                  <div>
                    <button
                      onClick={() => handleViewPlan(plan._id)}
                      className="px-4 py-2 text-sm text-white rounded bg-primary "
                    >
                      {t('diet_view')}
                    </button>
                    <button
                      onClick={() => openDeleteModal(plan._id)}
                      className="px-4 py-2 ml-2 text-sm text-white bg-gray-700 rounded "
                    >
                      {t('diet_delete')}
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
          <h2 className="mb-6 text-2xl font-semibold">{t('diet_meal_plan_details')}</h2>

          {/* Meal Cards */}
          <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-3">
            {Object.entries(selectedPlan.dietPlanId.meals).map(([key, meal]) => {
              const mealTimings = {
                breakfast: t('diet_meal_time_breakfast'),
                lunch: t('diet_meal_time_lunch'),
                dinner: t('diet_meal_time_dinner')
              };

              return (
                <div key={key} className="flex flex-col rounded-lg bg-dark">
                  <div className="flex-1 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold">{meal.title}</h3>
                      <div className="flex items-center text-primary/80">
                        <Clock className="w-4 h-4 mr-1" />
                        <span className="text-sm">{meal.items.length} {t('diet_items')}</span>
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
                      {t('diet_recommended_timing', { time: mealTimings[key.toLowerCase()] })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Nutrition Summary */}
          <div className="p-6 rounded-lg bg-dark">
            <h3 className="mb-6 text-2xl font-semibold text-center">{t('diet_nutrition_summary')}</h3>
            <div className="grid grid-cols-2 gap-6 py-2 rounded-lg md:grid-cols-4 bg-primary/20">
              <div className="text-center">
                <p className="text-accent/80">{t('diet_calories')}</p>
                <p className="mt-2 text-2xl font-semibold">{selectedPlan.dietPlanId.nutritionSummary.calories}</p>
              </div>
              <div className="text-center">
                <p className="text-accent/80">{t('diet_protein')}</p>
                <p className="mt-2 text-2xl font-semibold">{selectedPlan.dietPlanId.nutritionSummary.protein}</p>
              </div>
              <div className="text-center">
                <p className="text-accent/80">{t('diet_carbs')}</p>
                <p className="mt-2 text-2xl font-semibold">{selectedPlan.dietPlanId.nutritionSummary.carbs}</p>
              </div>
              <div className="text-center">
                <p className="text-accent/80">{t('diet_fats')}</p>
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