const medsModel = require("./medsModel");

async function getAllDates(req, res) {
  try {
    const userId = req.user.userId;
    const meds = await medsModel.GetAllDates(userId);
    res.status(200).json(meds);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch meds" });
  }
}

async function getDateById(req, res) {
  try {
    const userId = req.user.userId;
    const id = parseInt(req.params.id, 10);
    const med = await medsModel.getDateById(id, userId);
    if (!med) return res.status(404).json({ error: "Reminder not found or unauthorized" });
    res.status(200).json(med);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch reminder" });
  }
}

async function createDate(req, res) {
  try {
    const userId = req.user.userId;
    const { medicine, datetime } = req.body;
    await medsModel.CreateDate({ medicine, datetime, userId });
    res.status(201).json({ message: "Reminder added" });
  } catch (error) {
    res.status(500).json({ error: "Failed to create reminder" });
  }
}

async function updateDate(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    const userId = req.user.userId;
    const { medicine, datetime } = req.body;
    const updated = await medsModel.updateDate(id, { medicine, datetime, userId });
    if (!updated) return res.status(404).json({ error: "Reminder not found or unauthorized" });
    res.status(200).json({ message: "Reminder updated" });
  } catch (error) {
    res.status(500).json({ error: "Failed to update reminder" });
  }
}

async function deleteDate(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    const userId = req.user.userId;
    const deleted = await medsModel.deleteDate(id, userId);
    if (!deleted) return res.status(404).json({ error: "Reminder not found or unauthorized" });
    res.status(200).json({ message: "Reminder deleted" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete reminder" });
  }
}

module.exports = {
  getAllDates,
  getDateById,
  createDate,
  updateDate,
  deleteDate,
};
