const sql = require('mssql');
const dbConfig = require('../../dbConfig');

// GET ALL APPOINTMENTS
async function GetAllAppointments() {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = "SELECT id, clinic, purpose, time FROM Appointments";
    const result = await connection.request().query(query);
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

// GET APPOINTMENT BY ID
async function GetAppointmentById(id) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = "SELECT * FROM Appointments WHERE id = @id";
    const request = connection.request();
    request.input("id", sql.Int, id);
    const result = await request.query(query);

    if (result.recordset.length === 0) {
      return null;
    }

    return result.recordset[0];
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

// CREATE APPOINTMENT
async function CreateAppointment(appointmentData) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = "INSERT INTO Appointments (clinic, purpose, time) VALUES (@clinic, @purpose, @time)";
    const request = connection.request();
    request.input("clinic", sql.VarChar, appointmentData.clinic);
    request.input("purpose", sql.VarChar, appointmentData.purpose);
    request.input("time", sql.DateTime, appointmentData.time);
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

// UPDATE APPOINTMENT
async function updateAppointment(id, { clinic, purpose, time }) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = "UPDATE Appointments SET clinic = @clinic, purpose = @purpose, time = @time WHERE id = @id";
    const request = connection.request();
    request.input("id", sql.Int, id);
    request.input("clinic", sql.VarChar, clinic);
    request.input("purpose", sql.VarChar, purpose);
    request.input("time", sql.DateTime, time);
    const result = await request.query(query);

    if (result.rowsAffected[0] === 0) {
      return null;
    }

    return await GetAppointmentById(id);
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

// DELETE APPOINTMENT
async function deleteAppointment(id) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = "DELETE FROM Appointments WHERE id = @id";
    const request = connection.request();
    request.input("id", sql.Int, id);
    const result = await request.query(query);

    if (result.rowsAffected[0] === 0) {
      return null;
    }

    return true;
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

module.exports = {
  GetAllAppointments,
  GetAppointmentById,
  CreateAppointment,
  updateAppointment,
  deleteAppointment,
};
