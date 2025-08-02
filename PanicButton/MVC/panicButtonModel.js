const sql = require("mssql");
const dbConfig = require("../../dbConfig");

async function GetAllEmergencies(userId) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = `
  SELECT * FROM Emergencies
  WHERE userId = @userId AND Status = 'Ongoing'
`;
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

async function getEmergencyById(id, userId) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = "SELECT * FROM Emergencies WHERE EmergencyId = @id AND userId = @userId";
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

async function CreateEmergency({ userId, name, location }) {
  let connection;
  try {
    console.log("🔥 Creating emergency:", userId, name, location); // Debug
    connection = await sql.connect(dbConfig);

    const query = `
      INSERT INTO Emergencies (userId, Name, Location, Status, CreatedAt, UpdatedAt)
      VALUES (@userId, @name, @location, 'Ongoing', GETDATE(), GETDATE())
    `;
    const request = connection.request();
    request.input("userId", sql.Int, userId);
    request.input("name", sql.NVarChar, name);
    request.input("location", sql.NVarChar, location);

    await request.query(query);
  } catch (error) {
    console.error("CreateEmergency error:", error);
    throw error;
  } finally {
    if (connection) await connection.close().catch(console.error);
  }
}



async function updateEmergency(id, { userId, status }) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = `
      UPDATE Emergencies
      SET Status = @status
      WHERE EmergencyId = @id AND userId = @userId
    `;
    const request = connection.request();
    request.input("id", sql.Int, id);
    request.input("userId", sql.Int, userId);
    request.input("status", sql.NVarChar, status);
    const result = await request.query(query);
    return result.rowsAffected[0] > 0;
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  } finally {
    if (connection) await connection.close().catch(console.error);
  }
}


async function deleteEmergency(id, userId) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = "DELETE FROM Emergencies WHERE EmergencyId = @id AND userId = @userId";
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
  GetAllEmergencies,
  getEmergencyById,
  CreateEmergency,
  updateEmergency,
  deleteEmergency,
};

