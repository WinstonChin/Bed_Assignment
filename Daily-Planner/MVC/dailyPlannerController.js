const dailyPlannerModel = require("./dailyPlannerModel");

async function getAllActivities(req, res) {
  try {
    const userId = req.user.userId;
    const activities = await dailyPlannerModel.GetAllActivities(userId);
    res.status(200).json(activities);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch activities" });
  }
}

async function getActivityById(req, res) {
  try {
    const userId = req.user.userId;
    const id = parseInt(req.params.id, 10);
    const activity = await dailyPlannerModel.getActivityById(id, userId);
    if (!activity) return res.status(404).json({ error: "Activity not found or unauthorized" });
    res.status(200).json(activity);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch activity" });
  }
}

async function createActivity(req, res) {
  try {
    const userId = req.user.userId;
    const { startTime, endTime, activity } = req.body;
    await dailyPlannerModel.CreateActivity({ userId, startTime, endTime, activity });
    res.status(201).json({ message: "Activity added" });
  } catch (error) {
    res.status(500).json({ error: "Failed to create activity" });
  }
}

async function updateActivity(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    const userId = req.user.userId;
    const { startTime, endTime, activity } = req.body;
    const updated = await dailyPlannerModel.updateActivity(id, { userId, startTime, endTime, activity });
    if (!updated) return res.status(404).json({ error: "Activity not found or unauthorized" });
    res.status(200).json({ message: "Activity updated" });
  } catch (error) {
    res.status(500).json({ error: "Failed to update activity" });
  }
}

async function deleteActivity(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    const userId = req.user.userId;
    const deleted = await dailyPlannerModel.deleteActivity(id, userId);
    if (!deleted) return res.status(404).json({ error: "Activity not found or unauthorized" });
    res.status(200).json({ message: "Activity deleted" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete activity" });
  }
}

module.exports = {
  getAllActivities,
  getActivityById,
  createActivity,
  updateActivity,
  deleteActivity,
};
