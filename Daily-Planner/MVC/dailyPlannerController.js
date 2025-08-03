const {
  CreateActivity,
  GetAllActivities,
  getActivityById,
  updateActivity,
  updateActivityStatus,
  deleteActivity
} = require("./dailyPlannerModel");

async function getAllActivities(req, res) {
  try {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) return res.status(400).json({ error: "Invalid userId" });

    const activities = await GetAllActivities(userId);
    console.log("Activities returned:", activities);
    res.status(200).json(activities);
  } catch (error) {
    console.error("getAllActivities error:", error);
    res.status(500).json({ error: "Failed to fetch activities" });
  }
}

async function getActivityByIdHandler(req, res) {
  try {
    const userId = req.user.userId;
    const id = parseInt(req.params.id, 10);
    const activity = await getActivityById(id, userId);
    if (!activity) return res.status(404).json({ error: "Activity not found or unauthorized" });
    res.status(200).json(activity);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch activity" });
  }
}

async function createActivity(req, res) {
  try {
    const { userId, startTime, endTime, activity, status } = req.body;
    await CreateActivity({ userId, startTime, endTime, activity, status });
    res.status(201).json({ message: "Activity added" });
  } catch (error) {
    console.error("createActivity error:", error);
    res.status(500).json({ error: "Failed to create activity" });
  }
}

async function updateActivityDetails(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    const { userId } = req.user;
    const { startTime, endTime, activity } = req.body;

    const success = await updateActivity(id, { userId, startTime, endTime, activity });
    if (!success) return res.status(404).json({ error: "Activity not found or unauthorized" });

    res.status(200).json({ message: "Activity updated" });
  } catch (error) {
    console.error("updateActivity error:", error);
    res.status(500).json({ error: "Update failed" });
  }
}

async function updateActivityStatusHandler(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    const { status } = req.body;

    console.log("Request to update status:", id, status);

    if (!status) return res.status(400).json({ error: "Missing status" });

    const success = await updateActivityStatus(id, status);
    if (!success) return res.status(404).json({ error: "Activity not found" });

    res.status(200).json({ message: "Status updated" });
  } catch (error) {
    console.error("updateActivityStatus error:", error);
    res.status(500).json({ error: "Update failed" });
  }
}

async function deleteActivityHandler(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    console.log("Request to delete:", id);

    const success = await deleteActivity(id);
    if (!success) return res.status(404).json({ error: "Activity not found" });

    res.status(200).json({ message: "Deleted" });
  } catch (error) {
    console.error("deleteActivity error:", error);
    res.status(500).json({ error: "Delete failed" });
  }
}

module.exports = {
  getAllActivities,
  getActivityById: getActivityByIdHandler,
  createActivity,
  updateActivity: updateActivityDetails,
  deleteActivity: deleteActivityHandler
};
