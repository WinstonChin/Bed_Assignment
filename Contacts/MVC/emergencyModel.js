// Emergency/MVC/emergencyModel.js
const sql = require('mssql');
const db = require('../../dbConfig');

const fetchEmergencyInfo = async (userId) => {
  const pool = await sql.connect(db);
  const result = await pool.request()
    .input('userId', sql.Int, userId)
    .query('SELECT * FROM EmergencyInfo WHERE UserID = @userId');
  return result.recordset[0] || null;
};

const insertEmergencyInfo = async (data) => {
  const pool = await sql.connect(db);
  await pool.request()
    .input('userId', sql.Int, data.userId)
    .input('bloodType', sql.VarChar(3), data.bloodType)
    .input('allergies', sql.Text, data.allergies)
    .input('medicalConditions', sql.Text, data.medicalConditions)
    .input('emergencyContactName', sql.VarChar(100), data.emergencyContactName)
    .input('emergencyContactPhone', sql.VarChar(20), data.emergencyContactPhone)
    .query(`
      INSERT INTO EmergencyInfo
      (UserID, BloodType, Allergies, MedicalConditions, EmergencyContactName, EmergencyContactPhone)
      VALUES (@userId, @bloodType, @allergies, @medicalConditions, @emergencyContactName, @emergencyContactPhone)
    `);
};

const updateEmergencyInfo = async (data) => {
  const pool = await sql.connect(db);
  await pool.request()
    .input('userId', sql.Int, data.userId)
    .input('bloodType', sql.VarChar(3), data.bloodType)
    .input('allergies', sql.Text, data.allergies)
    .input('medicalConditions', sql.Text, data.medicalConditions)
    .input('emergencyContactName', sql.VarChar(100), data.emergencyContactName)
    .input('emergencyContactPhone', sql.VarChar(20), data.emergencyContactPhone)
    .query(`
      UPDATE EmergencyInfo
      SET BloodType = @bloodType,
          Allergies = @allergies,
          MedicalConditions = @medicalConditions,
          EmergencyContactName = @emergencyContactName,
          EmergencyContactPhone = @emergencyContactPhone,
          LastUpdated = GETDATE()
      WHERE UserID = @userId
    `);
};

module.exports = {
  fetchEmergencyInfo,
  insertEmergencyInfo,
  updateEmergencyInfo
};
