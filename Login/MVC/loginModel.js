const sql = require("mssql");
const db = require('../../dbConfig');

async function findUserByEmail(email) {
  await sql.connect(db);
  const result = await sql.query`SELECT * FROM Users WHERE email = ${email}`;
  return result.recordset[0];
}

async function getUserById(id) {
  const result = await sql.query`
    SELECT name, email, profilePicUrl FROM Users WHERE id = ${id}
  `;
  return result.recordset[0];
}

async function updateUser(id, name, email, profilePicUrl) {
  await sql.query`
    UPDATE Users SET
      name = ${name},
      email = ${email},
      profilePicUrl = ${profilePicUrl}
    WHERE id = ${id}
  `;
}

async function deleteUser(id) {
  await sql.query`
    DELETE FROM Users WHERE id = ${id}
  `;
}

module.exports = { findUserByEmail,
  getUserById,
  updateUser,
  deleteUser,
 };
