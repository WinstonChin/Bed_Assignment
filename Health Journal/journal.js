const API_URL = '/health-journal';
const form = document.getElementById('journal-form');
const journalList = document.getElementById('journal-list');

const entryIdInput = document.getElementById('entry-id');
const dateInput = document.getElementById('entry-date');
const levelInput = document.getElementById('pain-level');
const locationInput = document.getElementById('pain-location');
const symptomsInput = document.getElementById('symptoms');
const notesInput = document.getElementById('notes');

document.addEventListener('DOMContentLoaded', loadEntries);

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const entry = {
    entry_date: dateInput.value,
    pain_level: parseInt(levelInput.value),
    pain_location: locationInput.value,
    symptoms: symptomsInput.value,
    notes: notesInput.value
  };

  const id = entryIdInput.value;

  try {
    if (id) {
      // Update
      await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry)
      });
    } else {
      // Create
      await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry)
      });
    }

    form.reset();
    entryIdInput.value = '';
    loadEntries();
  } catch (err) {
    alert('Failed to save entry.');
    console.error(err);
  }
});

async function loadEntries() {
  journalList.innerHTML = '';
  try {
    const res = await fetch(API_URL);
    const entries = await res.json();

    entries.forEach((entry) => {
      const li = document.createElement('li');
      li.innerHTML = `
        <strong>${entry.entry_date}</strong> | Pain: ${entry.pain_level}/10 | Location: ${entry.pain_location}<br />
        <em>Symptoms:</em> ${entry.symptoms}<br />
        <em>Notes:</em> ${entry.notes}<br />
        <button onclick="editEntry(${entry.id})">Edit</button>
        <button onclick="deleteEntry(${entry.id})">Delete</button>
        <hr />
      `;
      journalList.appendChild(li);
    });
  } catch (err) {
    alert('Failed to load entries.');
    console.error(err);
  }
}

async function deleteEntry(id) {
  if (!confirm('Delete this entry?')) return;
  try {
    await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    loadEntries();
  } catch (err) {
    alert('Failed to delete entry.');
    console.error(err);
  }
}

async function editEntry(id) {
  try {
    const res = await fetch(`${API_URL}/${id}`);
    const entry = await res.json();

    entryIdInput.value = entry.id;
    dateInput.value = entry.entry_date;
    levelInput.value = entry.pain_level;
    locationInput.value = entry.pain_location;
    symptomsInput.value = entry.symptoms;
    notesInput.value = entry.notes;

    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (err) {
    alert('Failed to load entry.');
    console.error(err);
  }
}
