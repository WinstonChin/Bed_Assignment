const Joi = require('joi');

const validatePanicButton = (req, res, next) => {
  const schema = Joi.object({
    userId: Joi.number().integer().required(),
    name: Joi.string().required(),
    location: Joi.string().required(),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }
  next();
};

module.exports = {
  validatePanicButton,
};
