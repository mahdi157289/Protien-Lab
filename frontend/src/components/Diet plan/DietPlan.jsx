import { useState } from 'react';
import { Clock } from 'lucide-react';

const DietPlanner = () => {
  const [dietPlans, setDietPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [formData, setFormData] = useState({
    age: '',
    gender: 'Select Gender',
    height: '',
    weight: '',
    goal: 'Lose Weight'
  });

  const sampleMealPlan = {
    meal1: {
      title: 'Breakfast',
      timing: '8:00 AM',
      items: [
        { name: 'Red Rice', amount: '200g' },
        { name: 'Boiled Eggs', amount: '2' },
        { name: 'Vegetables', amount: '250g' },
        { name: 'Banana', amount: '1' }
        
      ]
    },
    meal2: {
      title: 'Lunch',
      timing: '1:00 PM',
      items: [
        { name: 'Red Rice', amount: '250g' },
        { name: 'Chicken Curry', amount: '150g' },
        { name: 'Dhal Curry', amount: '100g' },
        { name: 'Vegetables', amount: '100g' }
      ]
    },
    meal3: {
      title: 'Dinner',
      timing: '7:00 PM',
      items: [
        { name: 'String Hoppers', amount: '6 pieces' },
        { name: 'Fish Curry', amount: '150g' },
        { name: 'Streamed Vegetables', amount: '100g' },
        { name: 'Greek Yogurt', amount: '100g' }
      ]
    }
  };

  const nutritionSummary = {
    calories: '2100 kcal',
    protein: '95g',
    carbs: '240g',
    fats: '70g'
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreatePlan = () => {
    const newPlan = {
      id: dietPlans.length + 1,
      ...formData,
      meals: sampleMealPlan,
      nutrition: nutritionSummary
    };
    setDietPlans(prev => [...prev, newPlan]);
    setFormData({
      age: '',
      gender: 'Select Gender',
      height: '',
      weight: '',
      goal: 'Lose Weight'
    });
  };

  return (
    <div className="flex flex-col items-center min-h-screen p-6">
      <div className="grid w-full grid-cols-1 gap-6 max-w-7xl md:grid-cols-2">
        {/* Left Panel - Create Plan Form */}
        <div className="p-6 rounded-lg bg-dark">
          <h2 className="mb-6 text-lg text-red-500">Create Your Diet Plan</h2>
          
          <div className="mb-6">
            <h3 className="mb-4 text-sm text-red-500">Personal Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-2 text-sm text">Age</label>
                <input 
                  type="text"
                  name="age"
                  value={formData.age}
                  onChange={handleInputChange}
                  className="w-full p-2 text-gray-200 border border-gray-700 rounded bg-secondary"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm text-200">Gender</label>
                <select 
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-700 rounded appearance-none bg-secondary text-200"
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
            <h3 className="mb-4 text-sm text-red-500">Health Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-2 text-sm text-200">Height (cm)</label>
                <input 
                  type="text"
                  name="height"
                  value={formData.height}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-700 rounded bg-secondary text-200"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm text-200">Weight (kg)</label>
                <input 
                  type="text"
                  name="weight"
                  value={formData.weight}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-700 rounded bg-secondary text-200"
                />
              </div>
            </div>
          </div>

          <div className="mb-6">
            <div>
              <label className="block mb-2 text-sm text-200">Goal</label>
              <select 
                name="goal"
                value={formData.goal}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-700 rounded appearance-none bg-secondary text-200"
              >
                <option>Lose Weight</option>
                <option>Gain Weight</option>
                <option>Maintain Weight</option>
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

        {/* Right Panel - Diet Plans List */}
        <div className="p-6 rounded-lg bg-dark">
          {dietPlans.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-400">You currently don't have diet plans</p>
            </div>
          ) : (
            <div className="space-y-4">
              {dietPlans.map(plan => (
                <div key={plan.id} className="flex items-center justify-between p-4 rounded-lg bg-secondary">
                  <span className="text-200">Diet Plan {plan.id}</span>
                  <button 
                    onClick={() => setSelectedPlan(plan.id)}
                    className="px-4 py-1 text-sm text-white bg-red-500 rounded hover:bg-red-600"
                  >
                    View
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Section - Meal Plan Details */}
      {selectedPlan && (
        <div className="w-full mt-8 max-w-7xl ">
          <h2 className="mb-6 text-2xl font-semibold">Your Meal Plan Details</h2>
          
          {/* Meal Cards */}
          <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-3">
            {Object.entries(sampleMealPlan).map(([key, meal]) => (
              <div key={key} className="overflow-hidden rounded-lg bg-dark">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold">{meal.title}</h3>
                    <div className="flex items-center text-gray-500">
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
                <div className="p-3 mt-2 bg-gray-800">
                  <p className="text-sm text-gray-500">
                    Recommended timing: {meal.timing}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Nutrition Summary */}
          <div className="p-6 rounded-lg bg-dark">
            <h3 className="mb-6 text-xl font-semibold">Daily Nutrition Summary</h3>
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
              <div className="text-center">
                <p className="text-gray-500">Calories</p>
                <p className="mt-2 text-2xl font-semibold">{nutritionSummary.calories}</p>
              </div>
              <div className="text-center">
                <p className="text-gray-500">Protein</p>
                <p className="mt-2 text-2xl font-semibold">{nutritionSummary.protein}</p>
              </div>
              <div className="text-center">
                <p className="text-gray-500">Carbs</p>
                <p className="mt-2 text-2xl font-semibold">{nutritionSummary.carbs}</p>
              </div>
              <div className="text-center">
                <p className="text-gray-500">Fats</p>
                <p className="mt-2 text-2xl font-semibold">{nutritionSummary.fats}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DietPlanner;