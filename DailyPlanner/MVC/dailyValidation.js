//davian planner//
const Joi = require("joi");


const plannerSchema = Joi.object({
  user_id: Joi.number().integer().required(),
  activity: Joi.string().min(3).max(100).required(),
  start_time: Joi.string().pattern(/^([0-1]\d|2[0-3]):([0-5]\d)$/).required().label("Start Time"),
  end_time: Joi.string().pattern(/^([0-1]\d|2[0-3]):([0-5]\d)$/).required().label("End Time"),
  status: Joi.string().valid("pending", "completed", "missed").required(),
});


function validatePlanner(req, res, next) {
  const { error } = plannerSchema.validate(req.body, { abortEarly: false });
  if (error) {
    const message = error.details.map((d) => d.message).join(", ");
    return res.status(400).json({ error: message });
  }
  next();
}


function validatePlannerId(req, res, next) {
  const id = parseInt(req.params.id);
  if (isNaN(id) || id <= 0) {
    return res.status(400).json({ error: "Invalid planner entry ID" });
  }
  next();
}


module.exports = {
  validatePlanner,
  validatePlannerId,
};
//