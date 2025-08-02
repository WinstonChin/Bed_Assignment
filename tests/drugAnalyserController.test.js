const axios = require('axios');
const { analyzeDrugs } = require('../DrugAnalyser/MVC/drugAnalyserController');

// Mock axios
jest.mock('axios');

describe('Drug Analyser Controller', () => {
  let req, res;

  beforeEach(() => {
    req = { body: { medications: ['paracetamol'] } };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  test('returns 400 if no medications provided', async () => {
    req.body.medications = [];
    await analyzeDrugs(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'No medications provided' });
  });

  test('returns empty effects if no results from API', async () => {
    axios.get.mockResolvedValueOnce({ data: { results: [] } });
    await analyzeDrugs(req, res);
    expect(res.json).toHaveBeenCalledWith({ effects: [], warnings: '', precautions: '' });
  });

  test('returns effects, warnings, and precautions if present', async () => {
    axios.get.mockResolvedValueOnce({
      data: {
        results: [{
          adverse_reactions: ['Headache. Dizziness.'],
          warnings: ['Do not use with alcohol.'],
          precautions: ['Consult doctor if pregnant.']
        }]
      }
    });
    await analyzeDrugs(req, res);
    expect(res.json).toHaveBeenCalledWith({
      effects: ['Headache', 'Dizziness'],
      warnings: 'Do not use with alcohol.',
      precautions: 'Consult doctor if pregnant.'
    });
  });

  test('handles API errors gracefully', async () => {
    axios.get.mockRejectedValueOnce(new Error('API error'));
    await analyzeDrugs(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Failed to retrieve drug data' });
  });
});