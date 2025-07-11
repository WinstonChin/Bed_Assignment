const sql = require('mssql');
const db = require('../../dbConfig');

const triggerPanicButton = async (req, res) => {
  try {
    const { userId, name, location } = req.body;
    const pool = await sql.connect(db);
    const result = await pool.request()
      .input('userId', sql.Int, userId)
      .input('name', sql.NVarChar, name)
      .input('location', sql.NVarChar, location)
      .query('INSERT INTO Emergencies (UserId, Name, Location, Status) VALUES (@userId, @name, @location, "Ongoing")');
    
    res.status(200).send('Emergency triggered, help is on the way');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error triggering panic button.');
  }
};

module.exports = {
  triggerPanicButton,
};
