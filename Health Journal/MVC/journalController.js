const journalModel = require('./journalModel');
const journalSchema = require('./journalValidation');

// GET ALL ENTRIES FOR LOGGED-IN USER
async function GetAllEntries(req, res) {
const userId = 1; // Hardcoded default user


  try {
    const entries = await journalModel.GetAllEntriesByUser(userId);
    res.json(entries);
  } catch (error) {
    console.error('GetAllEntries error:', error);
    res.status(500).json({ error: 'Failed to retrieve health journal entries' });
  }
}

// GET SINGLE ENTRY BY ID
async function GetEntryById(req, res) {
  try {
    const userId = 1; // or req.user.id if using auth
    const id = parseInt(req.params.id);

    const entry = await journalModel.GetEntryById(id, userId);

    if (!entry) {
      return res.status(404).json({ error: 'Entry not found' });
    }

    res.json(entry);
  } catch (err) {
    console.error('GetEntryById error:', err);
    res.status(500).json({ error: 'Failed to fetch entry' });
  }
}


// CREATE ENTRY
async function CreateEntry(req, res) {
  const userId = 1; // Hardcoded default user


  const { error, value } = journalSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  try {
    await journalModel.CreateEntry({ ...value, user_id: userId });
    res.status(201).json({ message: 'Health journal entry created' });
  } catch (err) {
    console.error('CreateEntry error:', err);
    res.status(500).json({ error: 'Failed to create entry' });
  }
}

// UPDATE ENTRY
async function UpdateEntry(req, res) {
  const userId = 1; // Hardcoded default user


  const { error, value } = journalSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  try {
    const id = parseInt(req.params.id);
    const updated = await journalModel.UpdateEntry(id, userId, value);
    if (!updated) return res.status(404).json({ error: 'Entry not found or not authorized' });

    res.json({ message: 'Entry updated', entry: updated });
  } catch (err) {
    console.error('UpdateEntry error:', err);
    res.status(500).json({ error: 'Failed to update entry' });
  }
}

// DELETE ENTRY
async function DeleteEntry(req, res) {
const userId = 1; // Hardcoded default user


  try {
    const id= parseInt(req.params.id);
    const deleted = await journalModel.DeleteEntry(id, userId);
    if (!deleted) return res.status(404).json({ error: 'Entry not found or not authorized' });

    res.json({ message: 'Entry deleted' });
  } catch (err) {
    console.error('DeleteEntry error:', err);
    res.status(500).json({ error: 'Failed to delete entry' });
  }
}

module.exports = {
  GetAllEntries,
  GetEntryById,
  CreateEntry,
  UpdateEntry,
  DeleteEntry
};