// Emergency/MVC/emergencyController.js
const {
  fetchEmergencyInfo,
  insertEmergencyInfo,
  updateEmergencyInfo
} = require('./emergencyModel');

const getEmergencyInfo = async (req, res) => {
  try {
    const { userId } = req.params;
    const info = await fetchEmergencyInfo(userId);
    res.json(info || {});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const upsertEmergencyInfo = async (req, res) => {
  try {
    const data = req.body;
    const existing = await fetchEmergencyInfo(data.userId);

    if (existing) {
      await updateEmergencyInfo(data);
      res.json({ message: "Emergency info updated successfully." });
    } else {
      await insertEmergencyInfo(data);
      res.json({ message: "Emergency info saved successfully." });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getEmergencyInfo,
  upsertEmergencyInfo
};
