const Joi = require('joi');

const healthJournalSchema = Joi.object({
  entry_date: Joi.date().required(), // 'YYYY-MM-DD' format expected
  pain_level: Joi.number()
    .integer()
    .min(0)
    .max(10)
    .required(),
  pain_location: Joi.string()
    .max(50)
    .allow('', null)
    .required(), // still required if field exists in table, but can be blank
  symptoms: Joi.string()
    .max(100)
    .required(),
  notes: Joi.string()
    .max(500)
    .required()
});

module.exports = healthJournalSchema;