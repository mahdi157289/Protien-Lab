const Feedback = require('../models/Feedback');

exports.getAllFeedbacks = async (req, res) => {
    try {
      const feedbacks = await Feedback.find()
        .populate('user', 'firstName lastName email');
      res.json(feedbacks);
    } catch (error) {
      console.error('Feedback Fetch Error:', error); // Add detailed error logging
      res.status(500).json({
        message: 'Error fetching feedbacks',
        error: error.message // Include error details for debugging
      });
    }
};