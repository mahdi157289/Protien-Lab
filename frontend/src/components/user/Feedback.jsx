import { useState } from 'react';
import { Send } from 'lucide-react';
import api from '../../config/api'; // Assuming this is the correct path to your API utility
import { useAuth } from '../../contexts/AuthContext'; // Adjust the import path as needed

const Feedback = () => {
  const [suggestion, setSuggestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const { user } = useAuth(); // Get user from auth context

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if user is logged in
    if (!user) {
      setError('Please log in to submit feedback');
      return;
    }

    // Clear previous errors
    setError('');

    // Validate input
    if (!suggestion.trim()) {
      setError('Feedback cannot be empty');
      return;
    }

    try {
      setLoading(true);
      
      // Send feedback to backend
      await api.post('/users/feedback', { message: suggestion });
      
      setLoading(false);
      setSubmitted(true);

      // Reset form after success
      setTimeout(() => {
        setSuggestion('');
        setSubmitted(false);
      }, 2000);

    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Failed to submit feedback');
    }
  };

  return (
    <div className="w-full px-4 py-8">
      <div className="p-8 mx-auto bg-dark max-w-7xl rounded-3xl">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <h2 className="text-3xl font-bold md:text-center md:text-4xl">
            Share Your <span className="text-primary">Ideas</span>
            <br className="md:hidden" /> With Us
          </h2>
          
          <form onSubmit={handleSubmit} className="flex flex-col w-full gap-4 sm:flex-row md:w-full">
            <input
              type="text"
              name="feedback"
              id="feedback"
              value={suggestion}
              onChange={(e) => {
                setSuggestion(e.target.value);
                setError(''); // Clear error when user starts typing
              }}
              placeholder="Type your Suggestion here.."
              className="flex-grow px-4 py-3 text-white border-none bg-secondary placeholder-accent rounded-xl focus:ring-2 focus:ring-primary focus:outline-none"
            />
            <button
              type="submit"
              disabled={!suggestion.trim() || loading || submitted}
              className={`w-full sm:w-auto px-6 py-3 rounded-xl font-medium text-white transition-all duration-200
                ${submitted ? 'bg-green-500' : 'bg-primary hover:bg-opacity-80'}
                disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap flex items-center justify-center gap-2`}
            >
              {loading ? 'Sending...' : submitted ? 'Sent!' : <>
                <Send className="w-5 h-5" /> Send Suggestion
              </>}
            </button>
          </form>
        </div>
        
        {error && (
          <div className="mt-4 text-center text-primary">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default Feedback;