const Joi = require('joi');

const validateActivity = (req, res, next) => {
  const schema = Joi.object({
    userId: Joi.number().integer().required(),
    startTime: Joi.string().required(),
    endTime: Joi.string().required(),
    activity: Joi.string().required(),
    status: Joi.string().valid('pending', 'completed', 'missed').required(),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).send({ error: error.details[0].message });
  }
  next();
};

module.exports = {
  validateActivity,
};
