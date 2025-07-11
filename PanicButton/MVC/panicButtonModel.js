// This file would define the schema for the Panic Button emergency records
const sql = require('mssql');
const db = require('../../dbConfig');

const createTable = async () => {
  const pool = await sql.connect(db);
  await pool.request().query(`
    IF NOT EXISTS (SELECT * FROM sysobjects WHERE name = 'Emergencies' AND xtype = 'U')
    CREATE TABLE Emergencies (
      EmergencyId INT IDENTITY(1,1) PRIMARY KEY,
      UserId INT,
      Name NVARCHAR(255),
      Location NVARCHAR(255),
      Status NVARCHAR(50) DEFAULT 'Ongoing',
      Timestamp DATETIME DEFAULT GETDATE()
    )
  `);
};

module.exports = {
  createTable,
};
