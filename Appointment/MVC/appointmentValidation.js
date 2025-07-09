const Joi = require("joi");

const appointmentSchema = Joi.object({
  clinic: Joi.string().min(1).max(100).required().messages({
    "string.base": "Clinic name must be a string.",
    "string.empty": "Clinic name is required.",
    "string.min": "Clinic name must be at least 1 character.",
    "string.max": "Clinic name must be at most 100 characters.",
    "any.required": "Clinic name is required."
  }),
  purpose: Joi.string().min(1).max(255).required().messages({
    "string.base": "Purpose must be a string.",
    "string.empty": "Purpose is required.",
    "string.min": "Purpose must be at least 1 character.",
    "string.max": "Purpose must be at most 255 characters.",
    "any.required": "Purpose is required."
  }),
  time: Joi.date().iso().required().messages({
    "date.base": "Time must be a valid date.",
    "date.format": "Time must be in ISO format.",
    "any.required": "Time is required."
  }),
});

function validateAppointment(req, res, next) {
  const { error } = appointmentSchema.validate(req.body, { abortEarly: false });
  if (error) {
    const errorMessage = error.details.map(d => d.message).join(", ");
    return res.status(400).json({ error: errorMessage });
  }
  next();
}

function validateAppointmentID(req, res, next) {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id) || id <= 0) {
    return res.status(400).json({ error: "Invalid appointment ID. Must be a positive number." });
  }
  next();
}

module.exports = {
  validateAppointment,
  validateAppointmentID,
};
