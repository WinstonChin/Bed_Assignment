const sql = require('mssql');
const db = require('../../dbConfig');

// GET emergency info for a user
const getEmergencyInfo = async (req, res) => {
    try {
        const { userId } = req.params;
        const pool = await sql.connect(db);
        const result = await pool.request()
            .input('userId', sql.Int, userId)
            .query('SELECT * FROM EmergencyInfo WHERE UserID = @userId');
        res.json(result.recordset[0] || {});
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// INSERT or UPDATE emergency info
const upsertEmergencyInfo = async (req, res) => {
    try {
        const {
            userId,
            bloodType,
            allergies,
            medicalConditions,
            emergencyContactName,
            emergencyContactPhone
        } = req.body;

        const pool = await sql.connect(db);

        const check = await pool.request()
            .input('userId', sql.Int, userId)
            .query('SELECT * FROM EmergencyInfo WHERE UserID = @userId');

        if (check.recordset.length > 0) {
            // Update
            await pool.request()
                .input('userId', sql.Int, userId)
                .input('bloodType', sql.VarChar(3), bloodType)
                .input('allergies', sql.Text, allergies)
                .input('medicalConditions', sql.Text, medicalConditions)
                .input('emergencyContactName', sql.VarChar(100), emergencyContactName)
                .input('emergencyContactPhone', sql.VarChar(20), emergencyContactPhone)
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
            res.json({ message: "Emergency info updated successfully." });
        } else {
            // Insert
            await pool.request()
                .input('userId', sql.Int, userId)
                .input('bloodType', sql.VarChar(3), bloodType)
                .input('allergies', sql.Text, allergies)
                .input('medicalConditions', sql.Text, medicalConditions)
                .input('emergencyContactName', sql.VarChar(100), emergencyContactName)
                .input('emergencyContactPhone', sql.VarChar(20), emergencyContactPhone)
                .query(`
                    INSERT INTO EmergencyInfo
                    (UserID, BloodType, Allergies, MedicalConditions, EmergencyContactName, EmergencyContactPhone)
                    VALUES (@userId, @bloodType, @allergies, @medicalConditions, @emergencyContactName, @emergencyContactPhone)
                `);
            res.json({ message: "Emergency info saved successfully." });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    getEmergencyInfo,
    upsertEmergencyInfo
};
