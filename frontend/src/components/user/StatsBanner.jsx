import { useState, useEffect } from 'react';
import api from '../../config/api';
import { Loader } from "lucide-react";
import { useTranslation } from 'react-i18next';

const StatsBanner = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState({
    activeMembers: 1000,
    exercises: 30,
    successStories: 100,
    products: 20
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await api.get('/users');
        setStats({
          activeMembers: response.data.activeMembers,
          exercises: response.data.exercises,
          successStories: response.data.successStories,
          products: response.data.products
        });
        setError(null);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
        setError(t('stats_error'));
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const statsArray = [
    { number: `${stats.activeMembers}+`, label: t("active_members") },
    { number: `${stats.exercises}+`, label: t("exercises") },
    { number: `${stats.successStories}+`, label: t("success_stories") },
    { number: `${stats.products}+`, label: t("supplement_products") }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full pt-8 md:pt-16">
        <div className="px-2 py-2 mx-auto text-center #40ee45 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full pt-8 md:pt-16">
      <div className="px-2 py-2 mx-auto rounded-lg sm:rounded-xl md:rounded-2xl lg:rounded-full max-w-7xl bg-dark">
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-4">
          {statsArray.map((stat, index) => (
            <div
              key={index}
              className="flex items-center justify-center gap-3 px-2 py-4 rounded-lg sm:px-4 sm:py-6 md:px-6 md:py-8 sm:rounded-xl md:rounded-2xl lg:rounded-full bg-secondary"
            >
              <span className="text-xl font-bold sm:text-2xl md:text-3xl text-white">
                {stat.number}
              </span>
              <span className="text-base sm:text-lg md:text-xl text-white">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StatsBanner;