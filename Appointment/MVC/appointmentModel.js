const sql = require('mssql');
const dbConfig = require('../../dbConfig');

// GET ALL APPOINTMENTS for a specific user
async function GetAllAppointments(userId) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = "SELECT id, clinic, purpose, time FROM Appointments WHERE userId = @userId";
    const request = connection.request();
    request.input("userId", sql.Int, userId);
    const result = await request.query(query);
    return result.recordset;
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("Error closing connection:", err);
      }
    }
  }
}

// GET APPOINTMENT BY ID and userId
async function GetAppointmentById(id, userId) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = "SELECT * FROM Appointments WHERE id = @id AND userId = @userId";
    const request = connection.request();
    request.input("id", sql.Int, id);
    request.input("userId", sql.Int, userId);
    const result = await request.query(query);

    return result.recordset[0] || null;
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("Error closing connection:", err);
      }
    }
  }
}

// CREATE APPOINTMENT for user
async function CreateAppointment({ clinic, purpose, time, userId }) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = `
      INSERT INTO Appointments (clinic, purpose, time, userId)
      VALUES (@clinic, @purpose, @time, @userId)`;
    const request = connection.request();
    request.input("clinic", sql.VarChar, clinic);
    request.input("purpose", sql.VarChar, purpose);
    request.input("time", sql.DateTime, time);
    request.input("userId", sql.Int, userId);
    await request.query(query);
  } catch (error) {
    console.error("CreateAppointment error:", error);
    throw error;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("Error closing connection:", err);
      }
    }
  }
}

// UPDATE APPOINTMENT with user check
async function updateAppointment(id, { clinic, purpose, time, userId }) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = `
      UPDATE Appointments 
      SET clinic = @clinic, purpose = @purpose, time = @time 
      WHERE id = @id AND userId = @userId`;
    const request = connection.request();
    request.input("id", sql.Int, id);
    request.input("clinic", sql.VarChar, clinic);
    request.input("purpose", sql.VarChar, purpose);
    request.input("time", sql.DateTime, time);
    request.input("userId", sql.Int, userId);
    const result = await request.query(query);

    return result.rowsAffected[0] > 0;
  } catch (error) {
    console.error("updateAppointment error:", error);
    throw error;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("Error closing connection:", err);
      }
    }
  }
}

// DELETE APPOINTMENT with user check
async function deleteAppointment(id, userId) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = "DELETE FROM Appointments WHERE id = @id AND userId = @userId";
    const request = connection.request();
    request.input("id", sql.Int, id);
    request.input("userId", sql.Int, userId);
    const result = await request.query(query);

    return result.rowsAffected[0] > 0;
  } catch (error) {
    console.error("deleteAppointment error:", error);
    throw error;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("Error closing connection:", err);
      }
    }
  }
}

module.exports = {
  GetAllAppointments,
  GetAppointmentById,
  CreateAppointment,
  updateAppointment,
  deleteAppointment,
};
