const sql = require("mssql");
const dbConfig = require("../../dbConfig");

async function GetAllDates(userId) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = "SELECT id, medicine, datetime FROM Medicine WHERE userId = @userId";
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

async function getDateById(id, userId) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = "SELECT * FROM Medicine WHERE id = @id AND userId = @userId";
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

async function CreateDate({ medicine, datetime, userId }) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = "INSERT INTO Medicine (medicine, datetime, userId) VALUES (@medicine, @datetime, @userId)";
    const request = connection.request();
    request.input("medicine", sql.VarChar, medicine);
    request.input("datetime", sql.DateTime, datetime);
    request.input("userId", sql.Int, userId);
    await request.query(query);
  } catch (error) {
    console.error("CreateDate error:", error);
    throw error;
  } finally {
    if (connection) await connection.close().catch(console.error);
  }
}

async function updateDate(id, { medicine, datetime, userId }) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query =
      "UPDATE Medicine SET medicine = @medicine, datetime = @datetime WHERE id = @id AND userId = @userId";
    const request = connection.request();
    request.input("id", sql.Int, id);
    request.input("medicine", sql.VarChar, medicine);
    request.input("datetime", sql.DateTime, datetime);
    request.input("userId", sql.Int, userId);
    const result = await request.query(query);
    return result.rowsAffected[0] > 0;
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  } finally {
    if (connection) await connection.close().catch(console.error);
  }
}

async function deleteDate(id, userId) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = "DELETE FROM Medicine WHERE id = @id AND userId = @userId";
    const request = connection.request();
    request.input("id", sql.Int, id);
    request.input("userId", sql.Int, userId);
    const result = await request.query(query);
    return result.rowsAffected[0] > 0;
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  } finally {
    if (connection) await connection.close().catch(console.error);
  }
}

module.exports = {
  GetAllDates,
  getDateById,
  CreateDate,
  updateDate,
  deleteDate,
};
