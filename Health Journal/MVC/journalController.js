const fs = require('fs');
const path = require('path'); // <-- Move this up!
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
const journalModel = require('./journalModel');
const journalSchema = require('./journalValidation');
const multer = require('multer');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: function (req, file, cb) {
    // Use timestamp + original name for uniqueness
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});
const upload = multer({ storage: storage });

const symptomData = {
  "fever,cough,sore throat": {
    "conditions": ["Flu", "COVID-19", "Common Cold"],
    "recommendation": "It may be a viral infection. Monitor your temperature and stay hydrated. If symptoms persist for more than 3 days or worsen, consult a general practitioner."
  },
  "headache,blurred vision,nausea": {
    "conditions": ["Migraine", "Concussion", "High Blood Pressure"],
    "recommendation": "These symptoms could indicate a migraine or something more serious like high blood pressure. Avoid bright lights and loud sounds. If symptoms persist or vision gets worse, see a doctor."
  },
  "chest pain,shortness of breath,lightheadedness": {
    "conditions": ["Heart Attack", "Angina"],
    "recommendation": "These symptoms may be signs of a serious heart condition. Call emergency services immediately and do not attempt to move or walk too much."
  },
  "joint pain,stiffness,fatigue": {
    "conditions": ["Osteoarthritis", "Rheumatoid Arthritis"],
    "recommendation": "These are common signs of arthritis. Try to keep joints warm and avoid overuse. Book an appointment with your doctor for diagnosis and long-term management."
  },
  "fatigue,frequent urination,thirst": {
    "conditions": ["Diabetes", "Kidney Disorder"],
    "recommendation": "These could be early signs of diabetes or kidney issues. Avoid sugary drinks, stay hydrated, and make an appointment for a blood test or screening soon."
  },
  "loss of appetite,weight loss,fatigue": {
    "conditions": ["Cancer", "Thyroid Disorder", "Depression"],
    "recommendation": "Unexplained weight loss and tiredness can be caused by several conditions. Please see a doctor promptly for a full health screening."
  },
  "itchy eyes,sneezing,runny nose": {
    "conditions": ["Allergic Rhinitis", "Common Cold"],
    "recommendation": "These are often signs of allergies or a mild cold. Rest and consider using over-the-counter antihistamines. If symptoms persist for more than 5 days, consult a GP."
  },
  "back pain,stiffness,numbness": {
    "conditions": ["Herniated Disc", "Sciatica"],
    "recommendation": "This may be nerve-related back pain. Avoid heavy lifting and prolonged sitting. See a doctor or physiotherapist for evaluation."
  },
  "dizziness,blurred vision,weakness": {
    "conditions": ["Low Blood Pressure", "Stroke", "Diabetes"],
    "recommendation": "These symptoms could be due to blood sugar or circulation problems. Sit down immediately and avoid walking. Contact a healthcare provider if symptoms continue."
  },
  "abdominal pain,diarrhea,nausea": {
    "conditions": ["Gastroenteritis", "Food Poisoning"],
    "recommendation": "You may have a stomach infection or food poisoning. Drink plenty of fluids. Seek medical help if diarrhea lasts more than 2 days or includes blood."
  },
  "shortness of breath,swollen ankles,fatigue": {
    "conditions": ["Congestive Heart Failure", "COPD"],
    "recommendation": "These symptoms may indicate heart or lung problems. Avoid physical exertion and arrange to see your doctor for an urgent evaluation."
  },
  "rash,itchiness,swelling": {
    "conditions": ["Allergic Reaction", "Eczema", "Insect Bite"],
    "recommendation": "Apply anti-itch cream and avoid scratching. If swelling worsens or breathing is affected, call emergency services immediately."
  },
  "persistent cough,weight loss,night sweats": {
    "conditions": ["Tuberculosis", "Lung Cancer"],
    "recommendation": "These may be signs of a chronic lung issue. It’s important to visit a healthcare facility as soon as possible for screening and a chest X-ray."
  },
  "confusion,speech difficulty,one-sided weakness": {
    "conditions": ["Stroke"],
    "recommendation": "These are signs of a stroke. Call emergency services immediately. Do not wait — urgent treatment is critical to reduce long-term damage."
  },
  "depression,insomnia,loss of interest": {
    "conditions": ["Depression", "Anxiety Disorder"],
    "recommendation": "These signs point to a mental health issue. Reach out to a trusted friend or caregiver. Speak with a GP or counselor — support is available and effective treatments exist."
  }
};

function analyzeSymptoms(inputSymptoms) {
  const inputArr = inputSymptoms
    .toLowerCase()
    .split(',')
    .map(s => s.trim());

  // Try exact match first
  for (const key in symptomData) {
    const keyArr = key.toLowerCase().split(',').map(s => s.trim()).sort();
    if (inputArr.length === keyArr.length &&
        inputArr.slice().sort().every((v, i) => v === keyArr[i])) {
      return symptomData[key];
    }
  }

  // Try partial match (at least 1 symptom overlap)
  for (const key in symptomData) {
    const keyArr = key.toLowerCase().split(',').map(s => s.trim());
    const overlap = keyArr.filter(sym => inputArr.includes(sym));
    if (overlap.length >= 1) {
      return symptomData[key];
    }
  }

  return null;
}
async function SearchEntries(req, res) {
  try {
    const { date, pain_level, symptoms } = req.query;
    const userId = req.user.id;

    const results = await journalModel.SearchEntries({ userId, date, pain_level, symptoms });
    // Always return an array, even if empty
    const entriesWithPhoto = results.map(entry => ({
      ...entry,
      photo_url: entry.photo ? `/uploads/${entry.photo}` : null
    }));
    res.json(entriesWithPhoto);
  } catch (err) {
    console.error('SearchEntries error:', err);
    res.status(500).json({ error: 'Failed to search entries' });
  }
}
// GET ALL ENTRIES
async function GetAllEntries(req, res) {
  try {
    const userId = req.user.id; // or req.user.id if you standardized
    const entries = await journalModel.getAllEntries(userId);
    // Add photo_url for each entry if photo exists
    const entriesWithPhoto = entries.map(entry => ({
      ...entry,
      photo_url: entry.photo ? `/uploads/${entry.photo}` : null
    }));
    res.json(entriesWithPhoto);
  } catch (error) {
    console.error('GetAllEntries error:', error);
    res.status(500).json({ error: 'Failed to retrieve health journal entries' });
  }
}

// GET SINGLE ENTRY BY ID
async function GetEntryById(req, res) {
  try {
    const userId = req.user.userId;
    const id = parseInt(req.params.id);

    const entry = await journalModel.GetEntryById(id, userId);

    if (!entry) {
      return res.status(404).json({ error: 'Entry not found' });
    }

    // Add photo_url if photo exists
    entry.photo_url = entry.photo ? `/uploads/${entry.photo}` : null;

    res.json(entry);
  } catch (err) {
    console.error('GetEntryById error:', err);
    res.status(500).json({ error: 'Failed to fetch entry' });
  }
}

// CREATE ENTRY (with photo upload)
async function CreateEntry(req, res) {
  console.log('DEBUG req.user:', req.user);
  const userId = req.user.id;

  // If using multer, req.body fields are strings, req.file is the uploaded file
  let entryData;
  if (req.file) {
    // If photo uploaded, use req.body and req.file
    entryData = {
      ...req.body,
      photo: req.file.filename,
      user_id: userId
    };
  } else {
    entryData = {
      ...req.body,
      user_id: userId
    };
  }

  // Validate (convert pain_level to number)
  entryData.pain_level = parseInt(entryData.pain_level);

const { error, value } = journalSchema.validate(entryData);
if (error) {
  console.error('Validation error:', error.details[0].message); // Add this for debugging
  return res.status(400).json({ error: error.details[0].message });
}

  // Analyze symptoms
  const match = analyzeSymptoms(value.symptoms);

  const finalEntryData = {
    ...value,
    photo: entryData.photo || null,
    conditions: match?.conditions || [],
    recommendation: match?.recommendation || ''
  };

  try {
    await journalModel.CreateEntry(finalEntryData);
    res.status(201).json({
      message: 'Health journal entry created',
      data: finalEntryData,
      analysis: match || { conditions: [], recommendation: "No matching symptoms found." }
    });
  } catch (err) {
  console.error('CreateEntry error:', err);
  res.status(500).json({ error: err.message || 'Failed to create entry' });
}
}

// UPDATE ENTRY (with photo upload)
async function UpdateEntry(req, res) {
  const userId = req.user.id;

  let entryData;
  if (req.file) {
    entryData = {
      ...req.body,
      photo: req.file.filename,
      user_id: userId
    };
  } else {
    entryData = {
      ...req.body,
      user_id: userId
    };
  }
  entryData.pain_level = parseInt(entryData.pain_level);

  const { error, value } = journalSchema.validate(entryData);
  if (error) return res.status(400).json({ error: error.details[0].message });

  try {
    const id = parseInt(req.params.id);
    const updated = await journalModel.UpdateEntry(id, userId, value, entryData.photo);
    if (!updated) return res.status(404).json({ error: 'Entry not found or not authorized' });

    res.json({ message: 'Entry updated', entry: updated });
  } catch (err) {
    console.error('UpdateEntry error:', err);
    res.status(500).json({ error: 'Failed to update entry' });
  }
}

// DELETE ENTRY
async function DeleteEntry(req, res) {
    const userId = req.user.id;

  try {
    const id = parseInt(req.params.id);
    const deleted = await journalModel.DeleteEntry(id, userId);
    if (!deleted) return res.status(404).json({ error: 'Entry not found or not authorized' });

    res.json({ message: 'Entry deleted' });
  } catch (err) {
    console.error('DeleteEntry error:', err);
    res.status(500).json({ error: 'Failed to delete entry' });
  }
}

// Export multer upload for use in routes
module.exports = {
  SearchEntries,
  GetAllEntries,
  GetEntryById,
  CreateEntry,
  UpdateEntry,
  DeleteEntry,
  upload // <-- export multer upload middleware
};