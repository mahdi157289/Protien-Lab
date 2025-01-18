const DietPlan = require('../models/DietPlan');

const adminDietPlanController = {
  // Create new diet plan
  createDietPlan: async (req, res) => {
    try {
      const newDietPlan = new DietPlan(req.body);
      await newDietPlan.save();
      res.status(201).json({
        success: true,
        message: "Diet plan created successfully",
        data: newDietPlan
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: "Failed to create diet plan",
        error: error.message
      });
    }
  },

  // Get all diet plans
  getAllDietPlans: async (req, res) => {
    try {
      const dietPlans = await DietPlan.find();
      res.status(200).json({
        success: true,
        count: dietPlans.length,
        data: dietPlans
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: "Failed to fetch diet plans",
        error: error.message
      });
    }
  },

  // Get single diet plan
  getDietPlan: async (req, res) => {
    try {
      const dietPlan = await DietPlan.findById(req.params.id);
      if (!dietPlan) {
        return res.status(404).json({
          success: false,
          message: "Diet plan not found"
        });
      }
      res.status(200).json({
        success: true,
        data: dietPlan
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: "Failed to fetch diet plan",
        error: error.message
      });
    }
  },

  // Update diet plan
  updateDietPlan: async (req, res) => {
    try {
      const dietPlan = await DietPlan.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );
      if (!dietPlan) {
        return res.status(404).json({
          success: false,
          message: "Diet plan not found"
        });
      }
      res.status(200).json({
        success: true,
        message: "Diet plan updated successfully",
        data: dietPlan
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: "Failed to update diet plan",
        error: error.message
      });
    }
  },

  // Delete diet plan
  deleteDietPlan: async (req, res) => {
    try {
      const dietPlan = await DietPlan.findByIdAndDelete(req.params.id);
      if (!dietPlan) {
        return res.status(404).json({
          success: false,
          message: "Diet plan not found"
        });
      }
      res.status(200).json({
        success: true,
        message: "Diet plan deleted successfully"
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: "Failed to delete diet plan",
        error: error.message
      });
    }
  }
};

module.exports = adminDietPlanController;