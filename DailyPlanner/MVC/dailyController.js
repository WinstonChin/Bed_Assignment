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
                SELECT ml.LogID, m.MoodName, ml.Note, ml.LogTimestamp
                FROM MoodLogs ml
                JOIN Moods m ON ml.MoodID = m.MoodID
                WHERE ml.UserID = @userId
                ORDER BY ml.LogTimestamp DESC
            `);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// POST mood log
const logMood = async (req, res) => {
    try {
        const { userId, moodId, note, logTimestamp } = req.body;
        const pool = await sql.connect(db);
        await pool.request()
            .input('userId', sql.Int, userId)
            .input('moodId', sql.Int, moodId)
            .input('note', sql.Text, note)
            .input('logTimestamp', sql.DateTime, new Date(logTimestamp))
            .query(`
                INSERT INTO MoodLogs (UserID, MoodID, LogTimestamp, Note)
                VALUES (@userId, @moodId, @logTimestamp, @note)
                `);
        res.json({ message: 'Mood logged successfully.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// DELETE a mood log by ID
const deleteMoodLog = async (req, res) => {
  try {
    const { id } = req.params;

    const pool = await sql.connect(db);
    await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM MoodLogs WHERE LogID = @id');

    res.json({ message: "Mood log deleted." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//UPDATE A MOOD LOG by ID
const updateMoodLog = async (req, res) => {
  try {
    const { id } = req.params;
    const { moodId, note } = req.body;

    const pool = await sql.connect(db);
    await pool.request()
      .input('id', sql.Int, id)
      .input('moodId', sql.Int, moodId)
      .input('note', sql.Text, note)
      .query(`
        UPDATE MoodLogs
        SET MoodID = @moodId,
            Note = @note
        WHERE LogID = @id
      `);

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




