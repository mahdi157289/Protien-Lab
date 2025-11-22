import { useState } from 'react';
import { Send } from 'lucide-react';
import api from '../../config/api';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import SectionDivider from '../common/SectionDivider';

const Feedback = () => {
  const [suggestion, setSuggestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const { user } = useAuth();
  const { t } = useTranslation();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      setError(t('feedback_login_required'));
      return;
    }

    setError('');

    if (!suggestion.trim()) {
      setError(t('feedback_empty_error'));
      return;
    }

    try {
      setLoading(true);
      await api.post('/users/feedback', { message: suggestion });
      setLoading(false);
      setSubmitted(true);

      setTimeout(() => {
        setSuggestion('');
        setSubmitted(false);
      }, 2000);

    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || t('feedback_submit_error'));
    }
  };

  return (
    <div className="w-full px-4 py-8">
      <div className="p-8 mx-auto bg-dark max-w-7xl rounded-3xl">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="w-full">
          <h2 className="text-3xl font-bold md:text-center md:text-4xl font-orbitron">
            {t('feedback_title_1')} <span className="text-primary">{t('feedback_title_2')}</span>
            <br className="md:hidden" /> {t('feedback_title_3')}
          </h2>
          <SectionDivider align="left" className="md:flex md:justify-center" />
          </div>
          
          <form onSubmit={handleSubmit} className="flex flex-col w-full gap-4 sm:flex-row md:w-full">
            <input
              type="text"
              name="feedback"
              id="feedback"
              value={suggestion}
              onChange={(e) => {
                setSuggestion(e.target.value);
                setError('');
              }}
              placeholder={t('feedback_placeholder')}
              className="flex-grow px-4 py-3 text-white border-none bg-secondary placeholder-accent rounded-xl focus:ring-2 focus:ring-primary focus:outline-none font-source-sans"
            />
            <button
              type="submit"
              disabled={!suggestion.trim() || loading || submitted}
              className={`w-full sm:w-auto px-6 py-3 rounded-xl font-medium text-white transition-all duration-200 font-source-sans
                ${submitted ? 'bg-green-500' : 'bg-primary hover:bg-opacity-80'}
                disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap flex items-center justify-center gap-2`}
            >
              {loading
                ? t('feedback_sending')
                : submitted
                  ? t('feedback_sent')
                  : <>
                      <Send className="w-5 h-5" /> {t('feedback_send_btn')}
                    </>
              }
            </button>
          </form>
        </div>
        
        {error && (
          <div className="mt-4 text-center text-primary font-source-sans">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default Feedback;