import { useState, useEffect, useRef } from 'react';
import { Info, Play, BookOpen, CheckCircle } from 'lucide-react';
import api from '../../config/api';
import { useTranslation } from 'react-i18next';

const ExerciseDetailModal = ({ exercise, onClose }) => {
  const { t } = useTranslation();
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-60">
      <div className="w-full max-w-md p-6 rounded-lg shadow-2xl bg-dark">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold #40ee45">{exercise.name}</h3>
          <button 
            onClick={onClose} 
            className="text-gray-400 transition-colors hover:text-white"
          >
            ✕
          </button>
        </div>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <BookOpen className="#40ee45" size={20} />
            <p className="text-gray-300">{t('workout_category')}: {exercise.category}</p>
          </div>
          <div className="flex items-center gap-3">
            <Play className="#40ee45" size={20} />
            <p className="text-gray-300">{t('workout_recommended')}</p>
          </div>
          <a 
            href={`/exercises/${exercise._id}`}
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-center w-full py-2 text-white transition-colors bg-green-500 rounded hover:bg-green-600"
          >
            <CheckCircle className="mr-2" size={20} />
            {t('workout_view_exercise_details')}
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
  const { t } = useTranslation();

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

    if (!formData.age.trim()) {
      errors.age = t('workout_error_age_required');
    } else if (isNaN(formData.age) || parseInt(formData.age) <= 0) {
      errors.age = t('workout_error_age_valid');
    }

    if (formData.gender === 'Select Gender') {
      errors.gender = t('workout_error_gender_required');
    }

    if (!formData.height.trim()) {
      errors.height = t('workout_error_height_required');
    } else if (isNaN(formData.height) || parseInt(formData.height) <= 0) {
      errors.height = t('workout_error_height_valid');
    }

    if (!formData.weight.trim()) {
      errors.weight = t('workout_error_weight_required');
    } else if (isNaN(formData.weight) || parseInt(formData.weight) <= 0) {
      errors.weight = t('workout_error_weight_valid');
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
          <h2 className="mb-6 text-lg #40ee45">{t('workout_create_title')}</h2>
          
          <div className="mb-6">
            <h3 className="mb-4 text-sm #40ee45">{t('workout_personal_info')}</h3>
          <div className="grid grid-cols-2 gap-4">
              <div>
              <label className="block mb-2 text-sm text-white">{t('workout_age')}</label>
                <input 
                  type="text"
                  name="age"
                  value={formData.age}
                  onChange={handleInputChange}
                  className={`w-full p-2 text-gray-200 border rounded bg-secondary ${
                    formErrors.age ? 'border-green-500' : 'border-gray-700'
                  }`}
                />
                {formErrors.age && (
                  <p className="mt-1 text-sm #40ee45">{formErrors.age}</p>
                )}
              </div>
              <div>
                <label className="block mb-2 text-sm text-white">{t('workout_gender')}</label>
                <select 
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className={`w-full p-2 border rounded appearance-none bg-secondary text-200 ${
                    formErrors.gender ? 'border-red-500' : 'border-gray-700'
                  }`}
                >
                  <option>{t('workout_select_gender')}</option>
                  <option>{t('workout_gender_male')}</option>
                  <option>{t('workout_gender_female')}</option>
                  <option>{t('workout_gender_other')}</option>
                </select>
                {formErrors.gender && (
                  <p className="mt-1 text-sm #40ee45">{formErrors.gender}</p>
                )}
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="mb-4 text-sm #40ee45">{t('workout_health_info')}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-2 text-sm text-white">{t('workout_height')}</label>
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
                  <p className="mt-1 text-sm #40ee45">{formErrors.height}</p>
                )}
              </div>
              <div>
                <label className="block mb-2 text-sm text-white">{t('workout_weight')}</label>
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
                  <p className="mt-1 text-sm #40ee45">{formErrors.weight}</p>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block mb-2 text-sm text-white">{t('workout_goal')}</label>
              <select 
                name="goal"
                value={formData.goal}
                onChange={handleInputChange}
                className="w-full p-2 text-gray-200 border border-gray-700 rounded appearance-none bg-secondary"
              >
                <option>{t('workout_goal_lose_weight')}</option>
                <option>{t('workout_goal_build_muscle')}</option>
                <option>{t('workout_goal_improve_fitness')}</option>
              </select>
            </div>
            <div>
              <label className="block mb-2 text-sm text-white">{t('workout_medical_conditions')}</label>
              <select 
                name="medicalConditions"
                value={formData.medicalConditions}
                onChange={handleInputChange}
                className="w-full p-2 text-gray-200 border border-gray-700 rounded appearance-none bg-secondary"
              >
                <option>{t('workout_medical_injury')}</option>
                <option>{t('workout_medical_none')}</option>
                <option>{t('workout_medical_other')}</option>
              </select>
            </div>
          </div>

          <button 
            onClick={handleCreatePlan}
            className="w-full py-2 text-white transition-colors bg-green-500 rounded hover:bg-green-600"
          >
            {t('workout_create_btn')}
          </button>
        </div>

        {/* Right Panel - Workout Plans List */}
        <div className="p-6 rounded-lg bg-dark">
          {workoutPlans.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-400">{t('workout_no_plans')}</p>
            </div>
          ) : (
            <div className="space-y-1">
              {workoutPlans.map((plan, index) => (
                <div key={plan._id} className="flex items-center justify-between p-4 rounded-lg bg-secondary">
                  <span className="text-white">{t('workout_plan')} {index + 1}</span>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        setSelectedPlan(plan._id);
                        setSelectedDay(plan.days?.[0] || null);
                      }}
                      className="px-4 py-2 text-sm text-white bg-green-500 rounded hover:bg-green-600"
                    >
                      {t('workout_view')}
                    </button>
                    <button 
                      onClick={() => {
                        setPlanToDelete(plan._id);
                        setShowDeleteModal(true);
                      }}
                      className="px-4 py-1 text-sm text-white bg-gray-700 rounded hover:bg-gray-800"
                    >
                      {t('workout_delete')}
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
            <h3 className="text-2xl font-semibold text-white">
              {selectedPlanDetails.name}
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Info size={16} />
              <span>{t('workout_personalized')}</span>
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
                    ? 'bg-green-500 text-white' 
                    : 'bg-secondary text-white hover:bg-secondary/60'
                }`}
              >
                {t('workout_day')} {day.day}
              </button>
            ))}
          </div>

          {/* Exercises Display */}
          {selectedDay && (
            <div className="p-6 border border-gray-700 rounded-lg shadow-md bg-secondary">
              <h4 className="flex items-center mb-4 text-lg font-semibold text-white">
                <span className="flex items-center justify-center w-8 h-8 mr-3 text-white bg-green-500 rounded-full">
                  {selectedDay.day}
                </span>
                {t('workout_details')}
              </h4>
              <div className="space-y-4">
                {selectedDay.exercises?.map((exercise, exerciseIndex) => (
                  <div 
                    key={exerciseIndex} 
                    className="flex items-center justify-between p-4 transition-colors rounded-lg bg-dark hover:bg-dark/60"
                  >
                    <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-10 h-10 text-white bg-green-500 rounded-full">
                        {exerciseIndex + 1}
                      </div>
                      <div>
                        <h4 className="font-medium text-white">{exercise.name}</h4>
                        <p className="text-sm text-white/80">{exercise.category}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="font-bold text-white">{t('workout_sets')}</p>
                        <p className="text-sm text-white/80">{t('workout_reps')}</p>
                      </div>
                      <button 
                        onClick={() => setSelectedExercise(exercise)}
                        className="px-4 py-2 text-sm text-white transition-colors bg-green-500 rounded hover:bg-green-600"
                      >
                        {t('workout_view_exercise')}
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
            <h3 className="mb-4 text-xl font-semibold text-center text-accent">{t('workout_delete_title')}</h3>
            <p className="mb-6 text-center text-accent/80">
              {t('workout_delete_confirm')}
            </p>
            <div className="flex justify-center gap-10">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-8 py-2 transition border rounded-lg text-primary bg-secondary hover:bg-dark border-primary"
              >
                {t('workout_cancel')}
              </button>
              <button
                onClick={handleDeletePlan}
                className="px-8 py-2 transition border rounded-lg border-primary bg-primary hover:bg-green-600"
              >
                {t('workout_delete')}
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