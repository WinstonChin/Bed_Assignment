const journalModel = require('../Health Journal/MVC/journalModel');



describe('Health Journal Model', () => {
  let createdEntryId;

  test('should return an array from getAllEntries', async () => {
    const entries = await journalModel.getAllEntries();
    expect(Array.isArray(entries)).toBe(true);
  });

  test('should create a new entry', async () => {
    const testEntry = {
      user_id: 1,
      entry_date: new Date(),
      pain_level: 3,
      pain_location: 'test',
      symptoms: 'test symptoms',
      notes: 'test notes',
      photo: null
    };
    await expect(journalModel.CreateEntry(testEntry)).resolves.not.toThrow();

    // Optionally, fetch the latest entry to get its ID for update/delete tests
    const entries = await journalModel.getAllEntries();
    createdEntryId = entries[0]?.id; // Assumes newest entry is first
    expect(createdEntryId).toBeDefined();
  });

  test('should get all entries for a user', async () => {
    const entries = await journalModel.GetAllEntriesByUser(1);
    expect(Array.isArray(entries)).toBe(true);
    entries.forEach(entry => expect(entry.user_id).toBe(1));
  });

  test('should update an entry', async () => {
  if (!createdEntryId) return;
  const updatedData = {
    entry_date: new Date(),
    pain_level: 5,
    pain_location: 'updated',
    symptoms: 'updated symptoms',
    notes: 'updated notes'
    // photo is not needed in data, handled by photoFilename param
  };
  // Pass null for photoFilename if not updating photo
  const result = await journalModel.UpdateEntry(createdEntryId, 1, updatedData, null);
  // Your UpdateEntry returns the updated entry object or null
  expect(result).not.toBeNull();
  expect(result.pain_level).toBe(5);
});

  test('should delete an entry', async () => {
    if (!createdEntryId) return;
    const result = await journalModel.DeleteEntry(createdEntryId, 1);
    expect(result).toBe(true);
  });
});