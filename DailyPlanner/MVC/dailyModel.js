//davian planner//
const sql = require("mssql");
const dbConfig = require("../dbconfig");


// Get all planner entries for a user
async function getAllPlannerEntries(userId) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const result = await connection
      .request()
      .input("userId", sql.Int, userId)
      .query("SELECT * FROM Planner WHERE user_id = @userId");
    return result.recordset;
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  } finally {
    if (connection) await connection.close();
  }
}


// Get a planner entry by ID
async function getPlannerEntryById(id) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const result = await connection
      .request()
      .input("id", sql.Int, id)
      .query("SELECT * FROM Planner WHERE id = @id");
    return result.recordset[0] || null;
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  } finally {
    if (connection) await connection.close();
  }
}


// Create a planner entry
async function createPlannerEntry(entry) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const result = await connection
      .request()
      .input("user_id", sql.Int, entry.user_id)
      .input("activity", sql.NVarChar, entry.activity)
      .input("start_time", sql.Time, entry.start_time)
      .input("end_time", sql.Time, entry.end_time)
      .input("status", sql.NVarChar, entry.status)
      .query(`
        INSERT INTO Planner (user_id, activity, start_time, end_time, status)
        VALUES (@user_id, @activity, @start_time, @end_time, @status);
        SELECT SCOPE_IDENTITY() AS id;
      `);
    const newId = result.recordset[0].id;
    return await getPlannerEntryById(newId);
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  } finally {
    if (connection) await connection.close();
  }
}


// Update planner entry by ID
async function updatePlannerEntry(id, data) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    await connection
      .request()
      .input("id", sql.Int, id)
      .input("activity", sql.NVarChar, data.activity)
      .input("start_time", sql.Time, data.start_time)
      .input("end_time", sql.Time, data.end_time)
      .input("status", sql.NVarChar, data.status)
      .query(`
        UPDATE Planner
        SET activity = @activity,
            start_time = @start_time,
            end_time = @end_time,
            status = @status
        WHERE id = @id
      `);
    return await getPlannerEntryById(id);
  } catch (error) {
    throw error;
  } finally {
    if (connection) await connection.close();
  }
}


// Delete planner entry by ID
async function deletePlannerEntry(id) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    await connection
      .request()
      .input("id", sql.Int, id)
      .query("DELETE FROM Planner WHERE id = @id");
  } catch (error) {
    throw error;
  } finally {
    if (connection) await connection.close();
  }
}


module.exports = {
  getAllPlannerEntries,
  getPlannerEntryById,
  createPlannerEntry,
  updatePlannerEntry,
  deletePlannerEntry,
};
//