import{ useState, useEffect } from 'react';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import axios from 'axios';
import { RefreshCw, Loader } from 'lucide-react';

const AdminFeedbackPage = () => {
  const { token } = useAdminAuth();
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/admin/feedback`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFeedbacks(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch feedbacks');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, [token]);

  return (
    <div className="min-h-screen p-6 bg-secondary">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-accent">User Feedbacks</h1>
          <button 
            onClick={fetchFeedbacks}
            className="p-2 transition rounded bg-primary text-accent hover:bg-opacity-80"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
            <div className="flex items-center justify-center h-screen">
              <Loader className="animate-spin text-primary" size={40} />
            </div>
        ) : error ? (
          <div className="text-primary">{error}</div>
        ) : (
          <div className="space-y-4">
            {feedbacks.length === 0 ? (
              <div className="py-10 text-center text-accent">No feedbacks found</div>
            ) : (
              feedbacks.map((feedback) => (
                <div 
                  key={feedback._id} 
                  className="p-4 rounded-lg shadow-md bg-dark"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-accent">
                        {feedback.user.firstName} {feedback.user.lastName}
                      </h3>
                      <p className="text-sm text-accent opacity-70">
                        {feedback.user.email}
                      </p>
                    </div>
                    <span className="text-sm opacity-50 text-accent">
                      {new Date(feedback.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="mt-3 text-accent">{feedback.message}</p>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminFeedbackPage;