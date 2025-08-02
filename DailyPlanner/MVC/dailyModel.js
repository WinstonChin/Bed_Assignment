// Mood/MVC/moodModel.js
const sql = require('mssql');
const db = require('../../dbConfig');

// Get all mood logs for a user
const fetchMoodsByUser = async (userId) => {
  const pool = await sql.connect(db);
  return await pool.request()
    .input('userId', sql.Int, userId)
    .query(`
      SELECT ml.LogID, m.MoodName, ml.Note, ml.LogTimestamp
      FROM MoodLogs ml
      JOIN Moods m ON ml.MoodID = m.MoodID
      WHERE ml.UserID = @userId
      ORDER BY ml.LogTimestamp DESC
    `);
};

// Insert a new mood log
const insertMood = async (userId, moodId, note, logTimestamp) => {
  const pool = await sql.connect(db);
  return await pool.request()
    .input('userId', sql.Int, userId)
    .input('moodId', sql.Int, moodId)
    .input('note', sql.Text, note)
    .input('logTimestamp', sql.DateTime, logTimestamp)
    .query(`
      INSERT INTO MoodLogs (UserID, MoodID, Note, LogTimestamp)
      VALUES (@userId, @moodId, @note, @logTimestamp)
    `);
};

// Delete a mood log
const deleteMood = async (logId) => {
  const pool = await sql.connect(db);
  return await pool.request()
    .input('id', sql.Int, logId)
    .query('DELETE FROM MoodLogs WHERE LogID = @id');
};

// Update a mood log
const updateMood = async (logId, moodId, note) => {
  const pool = await sql.connect(db);
  return await pool.request()
    .input('id', sql.Int, logId)
    .input('moodId', sql.Int, moodId)
    .input('note', sql.Text, note)
    .query(`
      UPDATE MoodLogs
      SET MoodID = @moodId, Note = @note
      WHERE LogID = @id
    `);
};

module.exports = {
  fetchMoodsByUser,
  insertMood,
  deleteMood,
  updateMood
};
