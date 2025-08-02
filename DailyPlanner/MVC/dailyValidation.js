const validateMoodLog = (req, res, next) => {
  const { userId, moodId, note, logTimestamp } = req.body;

  if (!userId || !moodId || !logTimestamp) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  // Ensure moodId is one of the allowed values (based on your emoji setup)
  const allowedMoodIds = [1, 2, 3, 4]; // 😊 😔 😠 😰
  if (!allowedMoodIds.includes(Number(moodId))) {
    return res.status(400).json({ error: "Invalid mood selected." });
  }

  // Optional: Check logTimestamp is a valid date
  const parsed = Date.parse(logTimestamp);
  if (isNaN(parsed)) {
    return res.status(400).json({ error: "Invalid timestamp format." });
  }

  next();
};

module.exports = { validateMoodLog };
