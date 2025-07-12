const panicButtonModel = require("./panicButtonModel");

async function getAllEmergencies(req, res) {
  try {
    const userId = req.user.userId;
    const emergencies = await panicButtonModel.GetAllEmergencies(userId);
    res.status(200).json(emergencies);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch emergencies" });
  }
}

async function getEmergencyById(req, res) {
  try {
    const userId = req.user.userId;
    const id = parseInt(req.params.id, 10);
    const emergency = await panicButtonModel.getEmergencyById(id, userId);
    if (!emergency) return res.status(404).json({ error: "Emergency not found or unauthorized" });
    res.status(200).json(emergency);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch emergency" });
  }
}

async function createEmergency(req, res) {
  try {
    const userId = req.user.userId;
    const { name, location } = req.body;
    await panicButtonModel.CreateEmergency({ userId, name, location });
    res.status(201).json({ message: "Emergency triggered" });
  } catch (error) {
    res.status(500).json({ error: "Failed to trigger emergency" });
  }
}

async function updateEmergency(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    const userId = req.user.userId;
    const { status } = req.body;
    const updated = await panicButtonModel.updateEmergency(id, { userId, status });
    if (!updated) return res.status(404).json({ error: "Emergency not found or unauthorized" });
    res.status(200).json({ message: "Emergency status updated" });
  } catch (error) {
    res.status(500).json({ error: "Failed to update emergency" });
  }
}

async function deleteEmergency(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    const userId = req.user.userId;
    const deleted = await panicButtonModel.deleteEmergency(id, userId);
    if (!deleted) return res.status(404).json({ error: "Emergency not found or unauthorized" });
    res.status(200).json({ message: "Emergency deleted" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete emergency" });
  }
}

module.exports = {
  getAllEmergencies,
  getEmergencyById,
  createEmergency,
  updateEmergency,
  deleteEmergency,
};
