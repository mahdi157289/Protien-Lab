import { motion } from 'framer-motion';
import { Plus, List, Loader } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import dashboardWorkoutImage from '../../assets/images/dashobard/ud-workout.jpg';
import dashboardDietImage from '../../assets/images/dashobard/ud-diet.jpg';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleNavigateToWorkout = () => {
    navigate('/workouts');
  };

  const handleNavigateToDiet = () => {
    navigate('/diet-plan');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1 }}
      className="min-h-[calc(100vh-4rem)]"
    >
      <div className="px-6 pt-8">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="flex items-center justify-between mb-8"
          >
            <div>
              <h1 className="mb-2 text-3xl font-bold md:text-4xl">
                {t('dashboard_welcome')}, <span className="text-primary">{user?.firstName}!</span>
              </h1>
              <p>{t('dashboard_manage_customize')}</p>
            </div>
          </motion.div>

          {/* Main Grid */}
          <div className="grid gap-8 md:grid-cols-2">
            {/* Workout Section */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1 }}
              className="overflow-hidden bg-dark rounded-2xl"
            >
              <div className="relative h-[50vh] md:h-[60vh] lg:h-[65vh] overflow-hidden">
                <img
                  src={dashboardWorkoutImage}
                  alt={t('dashboard_workout_alt')}
                  className="object-cover w-full h-full brightness-50"
                />
                <div className="absolute inset-0 flex flex-col justify-between p-6 bg-gradient-to-t from-dark/90">
                  <h2 className="mb-4 text-3xl font-bold text-accent/30">{t('dashboard_workout_title')}</h2>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="flex flex-col gap-4 sm:flex-row"
                  >
                    <button
                      onClick={handleNavigateToWorkout}
                      className="flex items-center max-w-xs gap-2 px-6 py-3 mx-auto transition-colors rounded-xl bg-primary hover:bg-green-600 sm:max-w-none sm:mx-0"
                    >
                      <Plus className="w-5 h-5" />
                      {t('dashboard_create_workout')}
                    </button>
                    <button
                      onClick={handleNavigateToWorkout}
                      className="flex items-center max-w-xs gap-2 px-6 py-3 mx-auto transition-colors rounded-xl bg-secondary hover:bg-dark sm:max-w-none sm:mx-0"
                    >
                      <List className="w-5 h-5" />
                      {t('dashboard_your_plans')}
                    </button>
                  </motion.div>
                </div>
              </div>
            </motion.div>

            {/* Diet Section */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="overflow-hidden rounded-2xl"
            >
              <div className="relative h-[50vh] md:h-[60vh] lg:h-[65vh] overflow-hidden">
                <img
                  src={dashboardDietImage}
                  alt={t('dashboard_diet_alt')}
                  className="object-cover w-full h-full brightness-50"
                />
                <div className="absolute inset-0 flex flex-col justify-between p-6 bg-gradient-to-t from-dark/90">
                  <h2 className="mb-4 text-3xl font-bold text-accent/30">{t('dashboard_diet_title')}</h2>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="flex flex-col gap-4 sm:flex-row"
                  >
                    <button
                      onClick={handleNavigateToDiet}
                      className="flex items-center max-w-xs gap-2 px-6 py-3 mx-auto transition-colors bg-green-500 rounded-xl hover:bg-green-600 sm:max-w-none sm:mx-0"
                    >
                      <Plus className="w-5 h-5" />
                      {t('dashboard_create_diet')}
                    </button>
                    <button
                      onClick={handleNavigateToDiet}
                      className="flex items-center max-w-xs gap-2 px-6 py-3 mx-auto transition-colors rounded-xl bg-secondary hover:bg-dark sm:max-w-none sm:mx-0"
                    >
                      <List className="w-5 h-5" />
                      {t('dashboard_your_plans')}
                    </button>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Dashboard;