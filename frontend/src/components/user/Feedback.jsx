import { useState } from 'react';
import { Send } from 'lucide-react';

const Feedback = () => {
  const [suggestion, setSuggestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!suggestion.trim()) return;

    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
    setSubmitted(true);

    // Reset form after success
    setTimeout(() => {
      setSuggestion('');
      setSubmitted(false);
    }, 2000);
  };

  return (
    <div className="w-full px-4 py-8">
      <div className="p-8 mx-auto bg-dark max-w-7xl rounded-3xl">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <h2 className="text-3xl font-bold md:text-center md:text-4xl">
            Share Your <span className="text-red-500">Ideas</span>
            <br className="md:hidden" /> With Us
          </h2>

          <form onSubmit={handleSubmit} className="flex flex-col w-full gap-4 sm:flex-row md:w-full">
            <input
              type="text"
              value={suggestion}
              onChange={(e) => setSuggestion(e.target.value)}
              placeholder="Type your Suggestion here.."
              className="flex-grow px-4 py-3 text-white border-none bg-secondary placeholder-accent rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!suggestion.trim() || loading || submitted}
              className={`w-full sm:w-auto px-6 py-3 rounded-xl font-medium text-white transition-all duration-200
                ${submitted ? 'bg-green-500' : 'bg-red-500 hover:bg-red-600'}
                disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap flex items-center justify-center gap-2`}
            >
              {loading ? 'Sending...' : submitted ? 'Sent!' : <>
                <Send className="w-5 h-5" /> Send Suggestion
              </>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Feedback;