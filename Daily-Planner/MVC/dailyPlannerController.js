const sql = require('mssql');
const db = require('../../dbConfig');

const getAllActivities = async (req, res) => {
  try {
    const { userId } = req.params;
    const pool = await sql.connect(db);
    const result = await pool.request()
      .input('userId', sql.Int, userId)
      .query('SELECT * FROM DailyPlanner WHERE UserId = @userId ORDER BY StartTime');
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error retrieving activities.');
  }
};

const createActivity = async (req, res) => {
  try {
    const { userId, startTime, endTime, activity } = req.body;
    const pool = await sql.connect(db);
    const result = await pool.request()
      .input('userId', sql.Int, userId)
      .input('startTime', sql.NVarChar, startTime)
      .input('endTime', sql.NVarChar, endTime)
      .input('activity', sql.NVarChar, activity)
      .query('INSERT INTO DailyPlanner (UserId, StartTime, EndTime, Activity) VALUES (@userId, @startTime, @endTime, @activity)');
    res.status(201).send('Activity created successfully');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error creating activity.');
  }
};

const updateActivityStatus = async (req, res) => {
  try {
    const { activityId, status } = req.body;
    const pool = await sql.connect(db);
    const result = await pool.request()
      .input('activityId', sql.Int, activityId)
      .input('status', sql.NVarChar, status)
      .query('UPDATE DailyPlanner SET Status = @status WHERE ActivityId = @activityId');
    res.status(200).send('Activity status updated successfully');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error updating activity status.');
  }
};

module.exports = {
  getAllActivities,
  createActivity,
  updateActivityStatus,
};
