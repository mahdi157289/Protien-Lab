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
    <div className="min-h-screen flex flex-col items-center p-6">
      <div className="max-w-7xl w-full grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Panel - Create Plan Form */}
        <div className="bg-dark rounded-lg p-6">
          <h2 className="text-red-500 text-lg mb-6">Create Your Diet Plan</h2>
          
          <div className="mb-6">
            <h3 className="text-red-500 text-sm mb-4">Personal Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text text-sm mb-2">Age</label>
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
                  className="w-full bg-secondary border border-gray-700 rounded p-2 text-200"
                />
              </div>
              <div>
                <label className="block text-200 text-sm mb-2">Weight (kg)</label>
                <input 
                  type="text"
                  name="weight"
                  value={formData.weight}
                  onChange={handleInputChange}
                  className="w-full bg-secondary border border-gray-700 rounded p-2 text-200"
                />
              </div>
            </div>
          </div>

          <div className="mb-6">
            <div>
              <label className="block text-200 text-sm mb-2">Goal</label>
              <select 
                name="goal"
                value={formData.goal}
                onChange={handleInputChange}
                className="w-full bg-secondary border border-gray-700 rounded p-2 text-200 appearance-none"
              >
                <option>Lose Weight</option>
                <option>Gain Weight</option>
                <option>Maintain Weight</option>
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

        {/* Right Panel - Diet Plans List */}
        <div className="bg-dark rounded-lg p-6">
          {dietPlans.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-400">You currently don't have diet plans</p>
            </div>
          ) : (
            <div className="space-y-4">
              {dietPlans.map(plan => (
                <div key={plan.id} className="flex justify-between items-center bg-secondary rounded-lg p-4">
                  <span className="text-200">Diet Plan {plan.id}</span>
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

      {/* Bottom Section - Meal Plan Details */}
      {selectedPlan && (
        <div className="max-w-7xl w-full mt-8 ">
          <h2 className="text-2xl font-semibold mb-6">Your Meal Plan Details</h2>
          
          {/* Meal Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {Object.entries(sampleMealPlan).map(([key, meal]) => (
              <div key={key} className="bg-dark rounded-lg overflow-hidden">
                <div className="p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-semibold">{meal.title}</h3>
                    <div className="flex items-center text-gray-500">
                      <Clock className="w-4 h-4 mr-1" />
                      <span className="text-sm">{meal.items.length} items</span>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {meal.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-700">→ {item.name}</span>
                        <span className="text-500">{item.amount}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-gray-800 p-3 mt-2">
                  <p className="text-gray-500 text-sm">
                    Recommended timing: {meal.timing}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Nutrition Summary */}
          <div className="bg-dark rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-6">Daily Nutrition Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <p className="text-gray-500">Calories</p>
                <p className="text-2xl font-semibold mt-2">{nutritionSummary.calories}</p>
              </div>
              <div className="text-center">
                <p className="text-gray-500">Protein</p>
                <p className="text-2xl font-semibold mt-2">{nutritionSummary.protein}</p>
              </div>
              <div className="text-center">
                <p className="text-gray-500">Carbs</p>
                <p className="text-2xl font-semibold mt-2">{nutritionSummary.carbs}</p>
              </div>
              <div className="text-center">
                <p className="text-gray-500">Fats</p>
                <p className="text-2xl font-semibold mt-2">{nutritionSummary.fats}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DietPlanner;