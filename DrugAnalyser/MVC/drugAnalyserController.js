const axios = require('axios');

async function analyzeDrugs(req, res) {
  const medications = req.body.medications;
  if (!medications || !Array.isArray(medications) || medications.length === 0) {
    return res.status(400).json({ error: 'No medications provided' });
  }

  const name = medications[0]; // Analyze only first medication for now
  const url = `https://api.fda.gov/drug/label.json?search=openfda.generic_name:"${encodeURIComponent(name)}"&limit=1`;

  try {
    const response = await axios.get(url);
    const results = response.data.results;

    if (!results || results.length === 0) {
      return res.json({ effects: [], warnings: '', precautions: '' });
    }

    const drug = results[0];
    // Try to get adverse reactions, warnings, and precautions
    const effectsText = Array.isArray(drug.adverse_reactions)
      ? drug.adverse_reactions.join(' ')
      : (drug.adverse_reactions || '');

    const warningsText = Array.isArray(drug.warnings)
      ? drug.warnings.join(' ')
      : (drug.warnings || '');

    const precautionsText = Array.isArray(drug.precautions)
      ? drug.precautions.join(' ')
      : (drug.precautions || '');

    // split into sentences for easier reading
    const sentences = effectsText.split(/[.]/).map(s => s.trim()).filter(Boolean);

    res.json({
      effects: sentences,
      warnings: warningsText,
      precautions: precautionsText
    });
  } catch (err) {
    console.error('OpenFDA error:', err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to retrieve drug data' });
  }
}

module.exports = {
  analyzeDrugs
};
