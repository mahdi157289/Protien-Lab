const Feedback = require('../models/Feedback');

exports.createFeedback = async (req, res) => {
  try {
    const feedback = new Feedback({
      user: req.user._id,
      message: req.body.message
    });

    const createdFeedback = await feedback.save();
    res.status(201).json(createdFeedback);
  } catch (error) {
    res.status(500).json({ message: 'Error creating feedback' });
  }
};