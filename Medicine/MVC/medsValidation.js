const Joi = require("joi");

const medSchema = Joi.object({
  medicine: Joi.string().min(1).max(100).required(),
  datetime: Joi.date().iso().required(),
});

function validateDate(req, res, next) {
  const { error } = medSchema.validate(req.body, { abortEarly: false });
  if (error) {
    const errorMessage = error.details.map((d) => d.message).join(", ");
    return res.status(400).json({ error: errorMessage });
  }
  next();
}

function validateDateID(req, res, next) {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id) || id <= 0) {
    return res.status(400).json({ error: "Invalid medication ID. Must be a positive number." });
  }
  next();
}

module.exports = {
  validateDate,
  validateDateID,
};