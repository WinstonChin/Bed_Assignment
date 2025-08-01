const {
  fetchMoodsByUser,
  insertMood,
  deleteMood,
  updateMood
} = require('./dailyModel');

// GET
const getMoodLogs = async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await fetchMoodsByUser(userId);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST
const logMood = async (req, res) => {
  try {
    const { userId, moodId, note, logTimestamp } = req.body;
    await insertMood(userId, moodId, note, logTimestamp);
    res.json({ message: "Mood logged successfully." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE
const deleteMoodLog = async (req, res) => {
  try {
    const { id } = req.params;
    await deleteMood(id);
    res.json({ message: "Mood log deleted." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT
const updateMoodLog = async (req, res) => {
  try {
    const { id } = req.params;
    const { moodId, note } = req.body;
    await updateMood(id, moodId, note);
    res.json({ message: "Mood log updated." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getMoodLogs,
  logMood,
  deleteMoodLog,
  updateMoodLog
};






