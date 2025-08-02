const Joi = require('joi');

const healthJournalSchema = Joi.object({
  entry_date: Joi.date().iso().required(),
  pain_level: Joi.number().integer().min(0).max(10).required(),
  pain_location: Joi.string().max(50).allow('', null).required(),
  symptoms: Joi.string().max(100).required(),
  notes: Joi.string().max(500).required()
}).unknown(true); // <-- add this

module.exports = healthJournalSchema;