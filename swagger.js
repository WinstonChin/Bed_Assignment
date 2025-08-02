const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'BED Assignment API',
      version: '1.0.0',
      description: 'API documentation for Health Journal, Nutrition Lookup, Drug Analyser, Medicine, Login, Signup, etc.'
    },
    servers: [
      { url: 'http://localhost:3000' }
    ],
    components: {
      schemas: {
        HealthJournalEntry: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            user_id: { type: 'integer', example: 1 },
            entry_date: { type: 'string', format: 'date-time', example: '2025-08-02T14:00:00Z' },
            pain_level: { type: 'integer', minimum: 0, maximum: 10, example: 5 },
            pain_location: { type: 'string', example: 'knee' },
            symptoms: { type: 'string', example: 'swelling' },
            notes: { type: 'string', example: 'test note' },
            photo: { type: 'string', nullable: true, example: 'photo.jpg' },
            photo_url: { type: 'string', nullable: true, example: '/uploads/photo.jpg' }
          }
        }
        // Add more schemas here as needed
      }
    }
  },
  apis: [
    './Health Journal/MVC/*.js',
    './DrugAnalyser/MVC/*.js',
    './Nutrition Lookup/*.js',
    './Medicine/MVC/*.js',
    './Login/MVC/*.js',
    './SignUp/MVC/*.js',
    './app.js'
  ]
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = { swaggerUi, swaggerSpec };