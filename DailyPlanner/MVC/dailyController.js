// ==================== Coen's Mood Tracker ====================

const sql = require('mssql');
const db = require('../../dbConfig');

// GET mood logs
const getMoodLogs = async (req, res) => {
    try {
        const { userId } = req.params;
        const pool = await sql.connect(db);
        const result = await pool.request()
            .input('userId', sql.Int, userId)
            .query(`
                SELECT m.MoodName, ml.Note, ml.LogDate 
                FROM MoodLogs ml
                JOIN Moods m ON ml.MoodID = m.MoodID
                WHERE ml.UserID = @userId
                ORDER BY ml.LogDate DESC
            `);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// POST mood log
const logMood = async (req, res) => {
    try {
        const { userId, moodId, note, logDate } = req.body;
        const pool = await sql.connect(db);
        await pool.request()
            .input('userId', sql.Int, userId)
            .input('moodId', sql.Int, moodId)
            .input('note', sql.Text, note)
            .input('logDate', sql.Date, logDate)
            .query(`
                INSERT INTO MoodLogs (UserID, MoodID, LogDate, Note)
                VALUES (@userId, @moodId, @logDate, @note)
            `);
        res.json({ message: 'Mood logged successfully.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    getMoodLogs,
    logMood
};

//davian//
const plannerModel = require("../models/plannerModel");


// Get all entries
async function getAllPlannerEntries(req, res) {
  try {
    const userId = parseInt(req.params.userId);
    const entries = await plannerModel.getAllPlannerEntries(userId);
    res.json(entries);
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ error: "Error retrieving planner entries" });
  }
}


// Get one entry
async function getPlannerEntryById(req, res) {
  try {
    const id = parseInt(req.params.id);
    const entry = await plannerModel.getPlannerEntryById(id);
    if (!entry) {
      return res.status(404).json({ error: "Planner entry not found" });
    }
    res.json(entry);
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ error: "Error retrieving planner entry" });
  }
}


// Create entry
async function createPlannerEntry(req, res) {
  try {
    const newEntry = await plannerModel.createPlannerEntry(req.body);
    res.status(201).json(newEntry);
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ error: "Error creating planner entry" });
  }
}


// Update planner entry
async function updatePlannerEntry(req, res) {
  try {
    const id = parseInt(req.params.id);
    const updatedEntry = await plannerModel.updatePlannerEntry(id, req.body);
    if (!updatedEntry) {
      return res.status(404).json({ error: "Planner entry not found" });
    }
    res.json(updatedEntry);
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ error: "Error updating planner entry" });
  }
}


// Delete planner entry
async function deletePlannerEntry(req, res) {
  try {
    const id = parseInt(req.params.id);
    await plannerModel.deletePlannerEntry(id);
    res.status(200).json({ message: "Planner entry deleted successfully" });
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ error: "Error deleting planner entry" });
  }
}


module.exports = {
  getAllPlannerEntries,
  getPlannerEntryById,
  createPlannerEntry,
  updatePlannerEntry,
  deletePlannerEntry,
};

