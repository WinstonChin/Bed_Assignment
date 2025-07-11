const healthJournalModel = require('../Models/healthJournalModel');
const healthJournalSchema = require('../Validations/healthJournalValidation');

// GET ALL ENTRIES FOR LOGGED-IN USER
async function GetAllEntries(req, res) {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const entries = await healthJournalModel.GetAllEntriesByUser(userId);
    res.json(entries);
  } catch (error) {
    console.error('GetAllEntries error:', error);
    res.status(500).json({ error: 'Failed to retrieve health journal entries' });
  }
}

// GET SINGLE ENTRY BY ID
async function GetEntryById(req, res) {
  const userId = req.user?.id;
  const entryId = parseInt(req.params.id);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const entry = await healthJournalModel.GetEntryById(entryId, userId);
    if (!entry) return res.status(404).json({ error: 'Entry not found' });

    res.json(entry);
  } catch (error) {
    console.error('GetEntryById error:', error);
    res.status(500).json({ error: 'Failed to retrieve entry' });
  }
}

// CREATE ENTRY
async function CreateEntry(req, res) {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const { error, value } = healthJournalSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  try {
    await healthJournalModel.CreateEntry({ ...value, user_id: userId });
    res.status(201).json({ message: 'Health journal entry created' });
  } catch (err) {
    console.error('CreateEntry error:', err);
    res.status(500).json({ error: 'Failed to create entry' });
  }
}

// UPDATE ENTRY
async function UpdateEntry(req, res) {
  const userId = req.user?.id;
  const entryId = parseInt(req.params.id);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const { error, value } = healthJournalSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  try {
    const updated = await healthJournalModel.UpdateEntry(entryId, userId, value);
    if (!updated) return res.status(404).json({ error: 'Entry not found or not authorized' });

    res.json({ message: 'Entry updated', entry: updated });
  } catch (err) {
    console.error('UpdateEntry error:', err);
    res.status(500).json({ error: 'Failed to update entry' });
  }
}

// DELETE ENTRY
async function DeleteEntry(req, res) {
  const userId = req.user?.id;
  const entryId = parseInt(req.params.id);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const deleted = await healthJournalModel.DeleteEntry(entryId, userId);
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