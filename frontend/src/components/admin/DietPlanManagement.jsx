import { useState, useEffect } from 'react';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { Plus, X, Edit, Trash2 } from 'lucide-react';
import { Loader } from 'lucide-react';

const DietPlanManagement = () => {
  const { token } = useAdminAuth();
  const [dietPlans, setDietPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState({isOpen: false,planId: null});
  const [formData, setFormData] = useState({
    name: '',
    type: 'Weight Loss',
    calorieRange: { min: '', max: '' },
    activityLevel: 'Moderate',
    meals: {
      breakfast: { title: 'Breakfast', items: [] },
      lunch: { title: 'Lunch', items: [] },
      dinner: { title: 'Dinner', items: [] }
    },
    nutritionSummary: {
      calories: '',
      protein: '',
      carbs: '',
      fats: ''
    },
    isActive: true
  });

  useEffect(() => {
    fetchDietPlans();
  }, []);

  const fetchDietPlans = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/diet-plans`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setDietPlans(data.data);
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching diet plans:', error);
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = currentPlan
        ? `${import.meta.env.VITE_API_URL}/api/admin/diet-plans/${currentPlan._id}`
        : `${import.meta.env.VITE_API_URL}/admin/diet-plans`;
      const method = currentPlan ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        fetchDietPlans();
        setShowModal(false);
        resetForm();
      }
    } catch (error) {
      console.error('Error saving diet plan:', error);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmation.planId) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/diet-plans/${deleteConfirmation.planId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        fetchDietPlans();
        setDeleteConfirmation({ isOpen: false, planId: null });
      }
    } catch (error) {
      console.error('Error deleting diet plan:', error);
    }
  };

  const handleAddMealItem = (mealType) => {
    setFormData(prev => ({
      ...prev,
      meals: {
        ...prev.meals,
        [mealType]: {
          ...prev.meals[mealType],
          items: [
            ...prev.meals[mealType].items,
            { name: '', amount: '' }
          ]
        }
      }
    }));
  };

  const handleRemoveMealItem = (mealType, index) => {
    setFormData(prev => ({
      ...prev,
      meals: {
        ...prev.meals,
        [mealType]: {
          ...prev.meals[mealType],
          items: prev.meals[mealType].items.filter((_, i) => i !== index)
        }
      }
    }));
  };

  const handleMealItemChange = (mealType, index, field, value) => {
    setFormData(prev => ({
      ...prev,
      meals: {
        ...prev.meals,
        [mealType]: {
          ...prev.meals[mealType],
          items: prev.meals[mealType].items.map((item, i) =>
            i === index ? { ...item, [field]: value } : item
          )
        }
      }
    }));
  };

  const handleEdit = (plan) => {
    setCurrentPlan(plan);
    setFormData(plan);
    setShowModal(true);
  };

  const resetForm = () => {
    setCurrentPlan(null);
    setFormData({
      name: '',
      type: 'Weight Loss',
      calorieRange: { min: '', max: '' },
      activityLevel: 'Moderate',
      meals: {
        breakfast: { title: 'Breakfast', items: [] },
        lunch: { title: 'Lunch', items: [] },
        dinner: { title: 'Dinner', items: [] }
      },
      nutritionSummary: {
        calories: '',
        protein: '',
        carbs: '',
        fats: ''
      },
      isActive: true
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-5rem)] p-6 ">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold ">Diet Plans Management</h1>
          <button
            onClick={() => {resetForm();setShowModal(true);}}
            className="flex items-center px-4 py-3 rounded-lg bg-primary hover:bg-green-600"
          >
            <span className="mr-2"><Plus className="w-5 h-5" /></span>
            Add New Diet Plan
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {dietPlans.map((plan) => (
            <div key={plan._id} className="p-6 rounded-lg bg-dark">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">{plan.name}</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(plan)}
                    className="p-2 text-yellow-500 rounded-full hover:bg-yellow-500/10"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirmation({ isOpen: true, planId: plan._id })}
                    className="p-2 rounded-full text-primary hover:bg-primary/10"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <p>Type: {plan.type}</p>
                <p>Calories: {plan.calorieRange.min} - {plan.calorieRange.max}</p>
                <p>Activity Level: {plan.activityLevel}</p>
              </div>
            </div>
          ))}
        </div>

        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-80">
            <div className="w-full max-w-2xl max-h-[80vh] overflow-y-auto p-6 rounded-xl bg-dark">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold ">
                  {currentPlan ? 'Edit Diet Plan' : 'Create New Diet Plan'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className=" hover:bg-green-600"
                >
                  <X className="w-7 h-7" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block mb-2 text-sm ">Name</label>
                    <input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full p-2 border rounded border-accent/50 bg-secondary focus:border-accent focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block mb-2 text-sm ">Type</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full p-2 border rounded border-accent/50 bg-secondary focus:border-accent focus:outline-none"
                    >
                      <option>Weight Loss</option>
                      <option>Weight Gain</option>
                      <option>Maintenance</option>
                    </select>
                  </div>

                  <div>
                    <label className="block mb-1 text-sm ">Activity Level</label>
                    <select
                      value={formData.activityLevel}
                      onChange={(e) => setFormData({ ...formData, activityLevel: e.target.value })}
                      className="w-full p-2 border rounded border-accent/50 bg-secondary focus:border-accent focus:outline-none"
                    >
                      <option>Active</option>
                      <option>Moderate</option>
                      <option>Sedentary</option>
                    </select>
                  </div>

                  <div>
                    <label className="block mb-2 text-sm ">Min Calories</label>
                    <input
                      type="number"
                      value={formData.calorieRange.min}
                      onChange={(e) => setFormData({
                        ...formData,
                        calorieRange: { ...formData.calorieRange, min: e.target.value }
                      })}
                      className="w-full p-2 border rounded border-accent/50 bg-secondary focus:border-accent focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block mb-2 text-sm ">Max Calories</label>
                    <input
                      type="number"
                      value={formData.calorieRange.max}
                      onChange={(e) => setFormData({
                        ...formData,
                        calorieRange: { ...formData.calorieRange, max: e.target.value }
                      })}
                      className="w-full p-2 border rounded border-accent/50 bg-secondary focus:border-accent focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                    {Object.entries(formData.meals).map(([mealType, meal]) => (
                    <div key={mealType} className="p-4 rounded-lg bg-secondary">
                        <h3 className="mb-1 text-lg font-medium capitalize ">{mealType}</h3>

                        {meal.items.map((item, index) => (
                        <div key={index} className="flex gap-2 mb-2">
                            <input
                            value={item.name}
                            onChange={(e) => handleMealItemChange(mealType, index, 'name', e.target.value)}
                            placeholder="Food item"
                            className="flex-1 p-2 border rounded border-accent/50 bg-secondary focus:border-accent focus:outline-none"
                            />
                            <input
                            value={item.amount}
                            onChange={(e) => handleMealItemChange(mealType, index, 'amount', e.target.value)}
                            placeholder="Amount"
                            className="w-32 p-2 border rounded border-accent/50 bg-secondary focus:border-accent focus:outline-none"
                            />
                            <button
                            type="button"
                            onClick={() => handleRemoveMealItem(mealType, index)}
                            className="px-2 text-primary hover:text-opacity-80"
                            >
                            <X className="w-6 h-6" />
                            </button>
                        </div>
                        ))}

                        <button
                        type="button"
                        onClick={() => handleAddMealItem(mealType)}
                        className="mt-1 text-sm text-primary hover:text-opacity-80"
                        >
                        + Add Item
                        </button>
                    </div>
                    ))}
                </div>

                <div className="mt-4">
                  <h3 className="mb-2 text-lg font-medium">Nutrition Summary</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(formData.nutritionSummary).map(([key, value]) => (
                      <div key={key}>
                        <label className="block mb-2 text-sm capitalize ">{key}</label>
                        <input
                          value={value}
                          onChange={(e) => setFormData({
                            ...formData,
                            nutritionSummary: {
                              ...formData.nutritionSummary,
                              [key]: e.target.value
                            }
                          })}
                          className="w-full p-2 border rounded border-accent/50 bg-secondary focus:border-accent focus:outline-none"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-2 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-8 py-2 transition border rounded-lg text-primary bg-secondary hover:bg-dark border-primary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-8 py-2 transition border rounded-lg border-primary bg-primary hover:bg-green-600"
                  >
                    {currentPlan ? 'Update' : 'Create'} Diet Plan
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
      {deleteConfirmation.isOpen && (
        <div className="fixed inset-0 flex items-center justify-center p-4 bg-black bg-opacity-80">
            <div className="w-full max-w-md p-6 rounded-lg bg-dark">
            <div className="text-center">
                <h3 className="mb-2 text-lg font-semibold text-center">
                Delete Diet Plan
                </h3>
                <p className="mb-6 text-center">
                Are you sure you want to delete this diet plan? This action cannot be undone.
                </p>
                <div className="flex justify-center gap-10">
                <button
                    onClick={() => setDeleteConfirmation({ isOpen: false, planId: null })}
                    className="px-8 py-2 transition border rounded-lg text-primary bg-secondary hover:bg-dark border-primary"
                >
                    Cancel
                </button>
                <button
                    onClick={handleDelete}
                    className="px-8 py-2 transition border rounded-lg border-primary bg-primary hover:bg-green-600"
                >
                    Delete
                </button>
                </div>
            </div>
            </div>
        </div>
        )}
    </div>
  );
};

export default DietPlanManagement;