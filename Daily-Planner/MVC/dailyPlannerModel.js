const sql = require("mssql");
const dbConfig = require("../../dbConfig");

async function GetAllActivities(userId) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = "SELECT * FROM DailyPlanner WHERE userId = @userId";
    const request = connection.request();
    request.input("userId", sql.Int, userId);
    const result = await request.query(query);
    return result.recordset;
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  } finally {
    if (connection) await connection.close().catch(console.error);
  }
}



async function getActivityById(id, userId) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = "SELECT * FROM DailyPlanner WHERE ActivityId = @id AND userId = @userId";
    const request = connection.request();
    request.input("id", sql.Int, id);
    request.input("userId", sql.Int, userId);
    const result = await request.query(query);
    return result.recordset[0] || null;
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  } finally {
    if (connection) await connection.close().catch(console.error);
  }
}

async function CreateActivity({ userId, startTime, endTime, activity, status }) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = `
      INSERT INTO DailyPlanner (userId, StartTime, EndTime, Activity, Status)
      VALUES (@userId, @startTime, @endTime, @activity, @status)
    `;
    const request = connection.request();
    request.input("userId", sql.Int, userId);
    request.input("startTime", sql.NVarChar, startTime);
    request.input("endTime", sql.NVarChar, endTime);
    request.input("activity", sql.NVarChar, activity);
    request.input("status", sql.NVarChar, status);
    await request.query(query);
  } catch (error) {
    console.error("CreateActivity error:", error);
    throw error;
  } finally {
    if (connection) await connection.close().catch(console.error);
  }
}




async function updateActivity(id, { userId, startTime, endTime, activity }) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query =
      "UPDATE DailyPlanner SET StartTime = @startTime, EndTime = @endTime, Activity = @activity WHERE ActivityId = @id AND userId = @userId";
    const request = connection.request();
    request.input("id", sql.Int, id);
    request.input("userId", sql.Int, userId);
    request.input("startTime", sql.NVarChar, startTime);
    request.input("endTime", sql.NVarChar, endTime);
    request.input("activity", sql.NVarChar, activity);
    const result = await request.query(query);
    return result.rowsAffected[0] > 0;
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  } finally {
    if (connection) await connection.close().catch(console.error);
  }
}

async function updateActivityStatus(id, status) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const request = connection.request();
    request.input("id", sql.Int, id);
    request.input("status", sql.NVarChar, status);
    const result = await request.query(`
      UPDATE DailyPlanner SET Status = @status WHERE ActivityId = @id
    `);
    return result.rowsAffected[0] > 0;
  } catch (error) {
    console.error("Update status error:", error);
    throw error;
  } finally {
    if (connection) await connection.close().catch(console.error);
  }
}


async function deleteActivity(id) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const request = connection.request();
    request.input("id", sql.Int, id);
    const result = await request.query(`
      DELETE FROM DailyPlanner WHERE ActivityId = @id
    `);
    return result.rowsAffected[0] > 0;
  } catch (error) {
    console.error("Delete activity error:", error);
    throw error;
  } finally {
    if (connection) await connection.close().catch(console.error);
  }
}
module.exports = {
  GetAllActivities,
  getActivityById,
  CreateActivity,
  updateActivity,
  deleteActivity,
  updateActivityStatus,
};
