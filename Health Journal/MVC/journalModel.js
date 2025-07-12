const sql = require('mssql');
const dbConfig = require('../../dbConfig');

// GET ALL JOURNAL ENTRIES FOR A USER
async function GetAllEntriesByUser(userId) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = `
      SELECT * FROM HealthJournal
      WHERE user_id = @userId
      ORDER BY entry_date DESC
    `;
    const request = connection.request();
    request.input('userId', sql.Int, userId);
    const result = await request.query(query);
    return result.recordset;
  } catch (error) {
    console.error("Database error (GetAllEntriesByUser):", error);
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

// GET SINGLE JOURNAL ENTRY BY ID
async function GetEntryById(id, userId) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = `
      SELECT * FROM HealthJournal
      WHERE id = @id AND user_id = @userId
    `;
    const request = connection.request();
    request.input("id", sql.Int, id);
    request.input("userId", sql.Int, userId);
    const result = await request.query(query);

    if (result.recordset.length === 0) {
      return null;
    }

    return result.recordset[0];
  } catch (error) {
    console.error("Database error (GetEntryById):", error);
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

// CREATE JOURNAL ENTRY
async function CreateEntry(data) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = `
      INSERT INTO HealthJournal (user_id, entry_date, pain_level, pain_location, symptoms, notes)
      VALUES (@user_id, @entry_date, @pain_level, @pain_location, @symptoms, @notes)
    `;
    const request = connection.request();
    request.input("user_id", sql.Int, data.user_id);
    request.input("entry_date", sql.Date, data.entry_date);
    request.input("pain_level", sql.TinyInt, data.pain_level);
    request.input("pain_location", sql.VarChar(50), data.pain_location);
    request.input("symptoms", sql.VarChar(100), data.symptoms);
    request.input("notes", sql.VarChar(500), data.notes);
    await request.query(query);
  } catch (error) {
    console.error("CreateEntry error:", error);
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

// UPDATE JOURNAL ENTRY
async function UpdateEntry(id, userId, data) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = `
      UPDATE HealthJournal
      SET entry_date = @entry_date,
          pain_level = @pain_level,
          pain_location = @pain_location,
          symptoms = @symptoms,
          notes = @notes
      WHERE id = @id AND user_id = @userId
    `;
    const request = connection.request();
    request.input("id", sql.Int, id);
    request.input("userId", sql.Int, userId);
    request.input("entry_date", sql.Date, data.entry_date);
    request.input("pain_level", sql.TinyInt, data.pain_level);
    request.input("pain_location", sql.VarChar(50), data.pain_location);
    request.input("symptoms", sql.VarChar(100), data.symptoms);
    request.input("notes", sql.VarChar(500), data.notes);
    const result = await request.query(query);

    if (result.rowsAffected[0] === 0) {
      return null;
    }

    return await GetEntryById(id, userId);
  } catch (error) {
    console.error("UpdateEntry error:", error);
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

// DELETE JOURNAL ENTRY
async function DeleteEntry(id, userId) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = `
      DELETE FROM HealthJournal
      WHERE id = @id AND user_id = @userId
    `;
    const request = connection.request();
    request.input("id", sql.Int, id);
    request.input("userId", sql.Int, userId);
    const result = await request.query(query);

    if (result.rowsAffected[0] === 0) {
      return null;
    }

    return true;
  } catch (error) {
    console.error("DeleteEntry error:", error);
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
  GetAllEntriesByUser,
  GetEntryById,
  CreateEntry,
  UpdateEntry,
  DeleteEntry
};
