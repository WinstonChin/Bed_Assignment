// This file would define the schema for activities in the Daily Planner
const sql = require('mssql');
const db = require('../../dbConfig');

const createTable = async () => {
  const pool = await sql.connect(db);
  await pool.request().query(`
    IF NOT EXISTS (SELECT * FROM sysobjects WHERE name = 'DailyPlanner' AND xtype = 'U')
    CREATE TABLE DailyPlanner (
      ActivityId INT IDENTITY(1,1) PRIMARY KEY,
      UserId INT,
      StartTime NVARCHAR(255),
      EndTime NVARCHAR(255),
      Activity NVARCHAR(255),
      Status NVARCHAR(50) DEFAULT 'Pending'
    )
  `);
};

module.exports = {
  createTable,
};
