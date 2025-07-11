const validateEmergencyInfo = (req, res, next) => {
    const { bloodType, emergencyContactName, emergencyContactPhone } = req.body;

    if (!bloodType || !emergencyContactName || !emergencyContactPhone) {
        return res.status(400).json({ error: "Required fields are missing." });
    }

    next();
};

module.exports = { validateEmergencyInfo };
